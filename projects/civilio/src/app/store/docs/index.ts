import { DestroyRef, inject, Injectable, OnDestroy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DocumentsService } from "@civilio/sdk/services/documents/documents.service";
import { allCollections } from "@db/collections";
import { Action, Actions, NgxsOnInit, ofActionSuccessful, State, StateContext, StateToken } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { keys } from "lodash";
import { concatMap, filter, interval, merge, mergeMap, of, take, tap, zip } from "rxjs";
import { LoadConfig } from "../config";
import { PullChanges, PushDocumentChanges, RecordLocalChanges, UpdateSyncState } from "./actions";

type Context = StateContext<SyncStateModel>;
export type SyncStateModel = Record<keyof typeof allCollections, string>;
export const SYNC_STATE = new StateToken<SyncStateModel>('docs');
const offsetDefault = '';

@Injectable()
@State({
	name: SYNC_STATE,
	defaults: {
		forms: offsetDefault,
		'form-versions': offsetDefault,
		"form-items": offsetDefault,
		submissions: offsetDefault
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
			concatMap(() => interval(6_000)),
			takeUntilDestroyed(this.destroyRef),
			filter(() => {
				return document.visibilityState == 'visible';
			})
		).subscribe(() => ctx.dispatch(PullChanges))
	}

	@Action(PullChanges, { cancelUncompleted: true })
	onPullChanges(ctx: Context) {
		const state = ctx.getState() as Record<string, string>;
		return of(keys(allCollections)).pipe(
			mergeMap(names => merge(...names.map(c => zip(of(c as keyof typeof allCollections), this.docsService.pullDocumentChanges(c, { lastCheckpoint: encodeURIComponent(state[c]), batchSize: 100 }))))),
			filter(([_, changes]) => changes.checkpoint !== undefined),
			tap(async ([collectionName, { changes, checkpoint }]) => {
				const targetCollection = allCollections[collectionName];
				if (!targetCollection) {
					console.warn(`Received update for unknown collection: ${collectionName}`);
					return;
				}
				ctx.dispatch([new RecordLocalChanges(changes)]);
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
		return this.docsService.pushDocumentChanges(changes).pipe(
			concatMap(({ changes, checkpoint }) => {
				const collectionNames = [...new Set(changes.map(c => c.collection).filter(c => !!(allCollections as any)[c]))] as (keyof typeof state)[];
				return ctx.dispatch([
					new RecordLocalChanges(changes),
					...collectionNames.map(c => new UpdateSyncState(c, checkpoint))
				]);
			})
		)
	}
	@Action(RecordLocalChanges)
	async onRecordLocalChangese(_: Context, { changes }: RecordLocalChanges) {
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
				await collection.utils['updateLocally'](change.entityKey, { ...change.data, updatedAt: change.recordedAt });
			}
		}
	}
	@Action(UpdateSyncState)
	onUpdateSyncState(ctx: Context, { key, value }: UpdateSyncState) {
		ctx.setState(patch({
			[key]: value
		}));
	}
}
