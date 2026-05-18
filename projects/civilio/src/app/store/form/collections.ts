import { inject, provideAppInitializer } from "@angular/core";
import { db, toRxSchema } from "@app/adapters/rxdb";
import { FormVersionLookup, SubmissionLookup } from "@civilio/sdk/models";
import { DocumentsService } from "@civilio/sdk/services/documents/documents.service";
import { createCollection } from "@tanstack/db";
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import { RxCollection } from "rxdb";
import { replicateRxCollection } from 'rxdb/plugins/replication';
import { lastValueFrom } from "rxjs";
import { z } from 'zod';

const formsRxCollection = toRxSchema(FormVersionLookup, 'id');
const rxCollections = await db.addCollections({
	forms: formsRxCollection,
	submissions: toRxSchema(SubmissionLookup, {
		fields: ['index', 'form', 'formVerison'],
		separator: '|',
		key: 'id'
	})
});

export const formsCollection = createCollection(rxdbCollectionOptions({
	rxCollection: rxCollections.forms as unknown as RxCollection<z.output<typeof FormVersionLookup>>,
	startSync: true
}));
export const submissionsCollection = createCollection(rxdbCollectionOptions({
	rxCollection: rxCollections.submissions as unknown as RxCollection<z.output<typeof SubmissionLookup>>,
	startSync: true
}))
export function provideReplicationHandlers() {
	return provideAppInitializer(async () => {
		const docsService = inject(DocumentsService);

		replicateRxCollection({
			collection: rxCollections.forms,
			replicationIdentifier: 'forms-replication',
			pull: {
				handler: async (createdAt, batch) => {
					const result = await lastValueFrom(docsService.pullDocumentChanges('forms', { lastCheckpoint: createdAt ? Number(createdAt) : undefined, batchSize: batch }));
					debugger;
					return result;
				}
			}
		});

		replicateRxCollection({
			collection: rxCollections.submissions,
			replicationIdentifier: 'submissions-replication',
			pull: {
				handler: async (createdAt, batch) => {
					const result = await lastValueFrom(docsService.pullDocumentChanges('submissions', { lastCheckpoint: createdAt ? Number(createdAt) : undefined, batchSize: batch }))
					debugger;
					return result;
				}
			}
		})
		await Promise.resolve();
	});
}
// const REPLICATION_HANDLERS = new InjectionToken('replication-handlers');
// export function provideReplicationHandlers<TCollectionName extends keyof typeof rxCollections, TCheckpointProp extends (keyof typeof rxCollections[TCollectionName])>(collection: (keyof typeof rxCollections), providerFn: () => (checkpoint: TCheckpointProp, batchSize: number) => Observable<((typeof rxCollections)[TCollectionName])['schema']['defaultValues'][]> | Promise<((typeof rxCollections)[TCollectionName])['schema']['defaultValues'][]>) {
// 	return [
// 		{
// 			provide: REPLICATION_HANDLERS,
// 			useValue:
// 		}
// 	] as Provider[]
// }

// const RX_FORMS_COLLECTION = new RxCollectionToken('form-definitions', FormVersionLookup, {
// 	primaryKey: 'id',
// });
// const TS_FORM_COLLECTION = RxTanstackCollectionToken.fromRxCollectionToken(RX_FORMS_COLLECTION);

// const RX_SUB_COLLECTION = new RxCollectionToken('submissions', SubmissionLookup, {
// 	primaryKey: {
// 		fields: ['index', 'form', 'formVersion'],
// 		separator: '|',
// 		key: 'id',
// 	}
// });
// const TS_SUB_COLLECTION = RxTanstackCollectionToken.fromRxCollectionToken(RX_SUB_COLLECTION);

// export function provideSubmissionsCollection() {
// 	return makeEnvironmentProviders([
// 		provideRxCollection(RX_SUB_COLLECTION),
// 		usingRxCollection(TS_SUB_COLLECTION)
// 	])
// }

// export function provideFormsCollection() {
// 	return makeEnvironmentProviders([
// 		provideRxCollection(RX_FORMS_COLLECTION),
// 		usingRxCollection(TS_FORM_COLLECTION)
// 	])
// }

// export function injectSubmissionsCollection() {
// 	assertInInjectionContext(injectSubmissionsCollection);
// 	return injectRxTanstackCollection(TS_SUB_COLLECTION);
// }

// export function injectFormsCollection() {
// 	assertInInjectionContext(injectFormsCollection);
// 	return injectRxTanstackCollection(TS_FORM_COLLECTION);
// }
