import { inject, makeEnvironmentProviders, provideAppInitializer } from "@angular/core";
import { rxCollections } from "@app/adapters/rxdb";
import { SubmissionLookup } from "@civilio/sdk/models";
import { DocumentsService } from "@civilio/sdk/services/documents/documents.service";
import { BasicIndex, createCollection } from "@tanstack/db";
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import { RxCollection } from "rxdb";
import { replicateRxCollection } from 'rxdb/plugins/replication';
import { lastValueFrom } from "rxjs";
import { z } from 'zod';
import { FormSchema, FormVersionSchema } from "./schemas";
import { provideDocumentsSdk } from "@civilio/sdk/providers";

export const formsCollection = createCollection(rxdbCollectionOptions({
	rxCollection: rxCollections.forms,
	schema: FormSchema,
	startSync: true,
}))
export const formVersionsCollection = createCollection(rxdbCollectionOptions({
	rxCollection: rxCollections.formVersions,
	schema: FormVersionSchema,
	startSync: true,
}));
export const submissionsCollection = createCollection(rxdbCollectionOptions({
	rxCollection: rxCollections.submissions as unknown as RxCollection<z.output<typeof SubmissionLookup>>,
	startSync: true
}));
export function provideCollectionHooks() {
	return provideAppInitializer(async () => {
		console.log('adding collection hooks');
		appendHooksToCollection(rxCollections.formVersions);
		appendHooksToCollection(rxCollections.forms);
		appendHooksToCollection(rxCollections.submissions);
		formsCollection.createIndex(row => row.slug, { indexType: BasicIndex });

	})
}
function appendHooksToCollection(collection: RxCollection<any>) {
	collection.preInsert((data) => {
		const timestr = new Date().toISOString();
		data.createdAt = timestr;
		data.updatedAt = timestr;
	}, true);
	collection.preSave((data) => {
		data.updatedAt = new Date().toISOString();
	}, true);
}
export function provideReplicationHandlers() {
	return makeEnvironmentProviders([
		provideAppInitializer(async () => {
			const docsService = inject(DocumentsService);
			replicateRxCollection({
				collection: rxCollections.forms,
				replicationIdentifier: 'forms',
				pull: {
					handler: async (createdAt, batchSize) => {
						const result = await lastValueFrom(docsService.pullDocumentChanges('forms', { lastCheckpoint: createdAt ? Number(createdAt) : undefined, batchSize }))
						return result;
					}
				},
				// push: {
				// 	handler: async (docs) => {
				// 		debugger;
				// 		return await lastValueFrom(docsService.pushDocumentChanges('forms', docs));
				// 	}
				// }
			});

			replicateRxCollection({
				collection: rxCollections.formVersions,
				replicationIdentifier: 'forms-versions-replication',
				pull: {
					handler: async (createdAt, batch) => {
						const result = await lastValueFrom(docsService.pullDocumentChanges('form-versions', { lastCheckpoint: createdAt ? Number(createdAt) : undefined, batchSize: batch }));
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
		}),
		provideDocumentsSdk()
	]);
}
