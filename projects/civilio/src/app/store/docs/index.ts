import { DestroyRef, inject, Injectable, isDevMode, OnDestroy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DocumentsService } from "@civilio/sdk/services/documents/documents.service";
import { allCollections } from "@db/collections";
import { Action, Actions, NgxsOnInit, ofActionSuccessful, State, StateContext, StateToken } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { entries, keys, set } from "lodash";
import { concatMap, filter, from, interval, map, merge, mergeMap, of, take, tap, zip } from "rxjs";
import { LoadConfig } from "../config";
import { PullChanges, PurgeStore, PushDocumentChanges, RecordLocalChanges, UpdateSyncState } from "./actions";
import { eq, queryOnce } from "@tanstack/db";
import { flatten } from "flat";
import { removeVirtualProps } from "@db/utils";

type Context = StateContext<SyncStateModel>;
export type SyncStateModel = {
	offsets: Record<keyof typeof allCollections, string>;
	fingerprint?: string;
	storeVersion?: string;
};
export const SYNC_STATE = new StateToken<SyncStateModel>('docs');
const offsetDefault = '';

@Injectable()
@State({
	name: SYNC_STATE,
	defaults: {
		offsets: {
			forms: offsetDefault,
			'form-versions': offsetDefault,
			"form-items": offsetDefault,
			submissions: offsetDefault
		}
	}
})
export class DocsState implements NgxsOnInit, OnDestroy {
	private readonly docsService = inject(DocumentsService);
	private readonly actions$ = inject(Actions);
	private readonly destroyRef = inject(DestroyRef);
	private pollIntervalId?: number;
	ngxsOnInit(ctx: Context): void {
		this.actions$.pipe(
			ofActionSuccessful(LoadConfig),
			take(1),
			concatMap(() => interval(300_000)),
			takeUntilDestroyed(this.destroyRef),
			filter(() => document.visibilityState == 'visible')
		).subscribe(() => ctx.dispatch(PullChanges))
	}

	@Action(PurgeStore, { cancelUncompleted: true })
	onPurgeStore(ctx: Context) {
		return from(keys(allCollections)).pipe(
			tap(name => ctx.setState(patch({
				offsets: patch({
					[name]: ''
				})
			}))),
			concatMap(async name => {
				const collection = allCollections[name as keyof typeof allCollections];
				return await collection.cleanup();
			}),
			tap(name => console.log(`${name} collection was cleared`))
		);
	}

	@Action(PullChanges, { cancelUncompleted: true })
	onPullChanges(ctx: Context) {
		const state = ctx.getState().offsets as Record<string, string>;
		return of(keys(allCollections)).pipe(
			mergeMap(names => merge(...names.map(c => zip(of(c as keyof typeof allCollections), this.docsService.pullDocumentChanges(c, { lastCheckpoint: encodeURIComponent(state[c]), batchSize: 100 }, { observe: 'response' }))))),
			tap(([_, response]) => {
				const storeVersion = response.headers.get('x-store-version');
				const fingerprint = response.headers.get('x-store-fingerprint')

				handleStoreIdentifierChange(ctx, fingerprint, storeVersion);
			}),
			filter(([_, response]) => response.body?.checkpoint !== undefined),
			tap(async ([collectionName, response]) => {
				const targetCollection = allCollections[collectionName];
				if (!targetCollection) {
					console.warn(`Received update for unknown collection: ${collectionName}`);
					return;
				}
				const changes = response.body?.changes;
				const checkpoint = response.body?.checkpoint;
				if (!changes) return;
				ctx.dispatch([new RecordLocalChanges(response.body.changes)]);
				if (checkpoint != state[collectionName] && checkpoint !== undefined) {
					ctx.dispatch(new UpdateSyncState(collectionName, checkpoint));
				}
			})
		)
	}

	ngOnDestroy() {
		if (this.pollIntervalId !== undefined) {
			clearInterval(this.pollIntervalId);
			this.pollIntervalId = undefined;
		}
	}
	@Action(PushDocumentChanges)
	onPushDocumentChanges(ctx: Context, { changes }: PushDocumentChanges) {
		const state = ctx.getState();
		return this.docsService.pushDocumentChanges(changes, { observe: 'response' }).pipe(
			tap(response => {
				const storeVersion = response.headers.get('x-store-version');
				const fingerprint = response.headers.get('x-store-fingerprint');

				handleStoreIdentifierChange(ctx, fingerprint, storeVersion);
			}),
			map(response => response.body!),
			concatMap(({ changes, checkpoint }) => {
				const collectionNames = [...new Set(changes.map(c => c.collection).filter(c => !!(allCollections as any)[c]))] as (keyof typeof state.offsets)[];
				return ctx.dispatch([
					new RecordLocalChanges(changes),
					...collectionNames.map(c => new UpdateSyncState(c, checkpoint))
				]);
			})
		)
	}
	@Action(RecordLocalChanges)
	async onRecordLocalChanges(_: Context, { changes }: RecordLocalChanges) {
		for (const change of changes) {
			const collection = allCollections[change.collection as keyof typeof allCollections];
			if (!collection) {
				console.warn(`Received update for unknown collection: ${change.collection}`);
				continue;
			}

			if (change.operation === 'delete') {
				await collection.utils['deleteLocally'](change.entityKey);
			} else if (change.operation === 'insert') {
				await collection.utils['insertLocally']({ ...change.data, updatedAt: change.recordedAt, createdAt: change.recordedAt });
			} else if (change.operation === 'update') {
				const original = await queryOnce(
					q => q.from({ c: collection })
						.where(({ c }) => eq(c.$key, change.entityKey))
						.select(({ c }) => c)
						.findOne()
				);
				if (!original) {
					console.warn(`Received update for non-existing entity: ${change.entityKey} in collection: ${change.collection}`);
					continue;
				}
				const update = collection.config.schema?.parse(original)!;
				for (const [k, v] of Object.entries(change.data)) {
					set(update, k, v);
				}
				await collection.utils['updateLocally'](change.entityKey, { ...update, updatedAt: change.recordedAt });
			}
		}
	}
	@Action(UpdateSyncState)
	onUpdateSyncState(ctx: Context, { key, value }: UpdateSyncState) {
		ctx.setState(patch({
			offsets: patch({
				[key]: value
			})
		}));
	}
}

function handleStoreIdentifierChange(context: Context, _fingerprint?: string | null, _storeVersion?: string | null) {
	const { fingerprint, storeVersion } = context.getState();
	let changed = false;
	if (fingerprint !== _fingerprint && !!_fingerprint) {
		context.setState(patch({
			fingerprint: _fingerprint
		}));
		changed = true;
	}

	if (storeVersion !== _storeVersion && !!_storeVersion) {
		context.setState(patch({
			storeVersion: _storeVersion
		}));
		changed = true;
	}

	if (changed) {
		context.dispatch(PurgeStore);
	}
}
