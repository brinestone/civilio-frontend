import { DestroyRef, inject, Injectable, isDevMode, OnDestroy } from "@angular/core";
import { DocumentsService } from "@civilio/sdk/services/documents/documents.service";
import { allCollections } from "@db/collections";
import { Action, Actions, NgxsOnInit, ofActionSuccessful, State, StateContext, StateToken } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { keys } from "lodash";
import { concatMap, filter, interval, merge, mergeMap, of, startWith, take, tap, zip } from "rxjs";
import { LoadConfig } from "../config";
import { PullChanges, UpdateSyncState } from "./actions";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

type Context = StateContext<SyncStateModel>;
export type SyncStateModel = Record<keyof typeof allCollections, number>;
export const SYNC_STATE = new StateToken<SyncStateModel>('docs');

@Injectable()
@State({
	name: SYNC_STATE,
	defaults: {
		forms: 0,
		'form-versions': 0,
		submissions: 0
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
			concatMap(() => interval(isDevMode() ? 5000 : 30000)),
			takeUntilDestroyed(this.destroyRef)
		).subscribe(() => ctx.dispatch(PullChanges))
	}

	@Action(PullChanges, { cancelUncompleted: true })
	onPullChanges(ctx: Context) {
		const state = ctx.getState() as Record<string, number>;
		return of(keys(allCollections)).pipe(
			mergeMap(names => merge(...names.map(c => zip(of(c as keyof typeof allCollections), this.docsService.pullDocumentChanges(c, { lastCheckpoint: state[c], batchSize: 100 }))))),
			filter(([_, changes]) => changes.checkpoint !== undefined),
			tap(async ([collectionName, { changes, checkpoint }]) => {
				const targetCollection = allCollections[collectionName];
				if (!targetCollection) {
					console.warn(`Received update for unknown collection: ${collectionName}`);
					return;
				}

				for (const change of changes) {
					if (change.operation === 'delete') {
						await targetCollection.utils['deleteLocally'](change.entityKey);
					} else if (change.operation === 'insert') {
						await targetCollection.utils['insertLocally'](change.data);
					} else if (change.operation === 'update') {
						await targetCollection.utils['updateLocally'](change.entityKey, change.data);
					}
				}

				ctx.dispatch(new UpdateSyncState(collectionName, checkpoint!));
			})
		)
	}

	ngOnDestroy() {
		if (this.pollIntervalId !== undefined) {
			clearInterval(this.pollIntervalId);
			this.pollIntervalId = undefined;
		}
	}
	@Action(UpdateSyncState)
	onUpdateSyncState(ctx: Context, { key, value }: UpdateSyncState) {
		ctx.setState(patch({
			[key]: value
		}));
	}
}
