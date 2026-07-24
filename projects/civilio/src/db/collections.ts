import { provideAppInitializer } from "@angular/core";
import { BasicIndex, createCollection, WithVirtualProps } from "@tanstack/db";
import { dexieCollectionOptions } from "tanstack-dexie-db-collection";
import { FormItem, Form, FormVersion, SubmissionResponse, SubmissionSession } from "./schemas";

const dbName = 'civilio-db';

export const responseSessionsCollection = createCollection(dexieCollectionOptions({
	id: 'form-response-sessions',
	schema: SubmissionSession,
	dbName,
	getKey: s => s.id,
	startSync: true,
	syncMode: 'on-demand',
	rowUpdateMode: 'partial',
	tableName: 'form-response-sessions',
}))

export const responseCollection = createCollection(dexieCollectionOptions({
	id: 'form-responses',
	schema: SubmissionResponse,
	dbName,
	getKey: (r) => [r.id, r.sessionId].join('|'),
	startSync: true,
	syncMode: 'on-demand',
	rowUpdateMode: 'partial',
	tableName: 'form-responses',
}))

export const formItemsCollection = createCollection(dexieCollectionOptions({
	id: 'form-items',
	schema: FormItem,
	dbName,
	getKey: fi => fi.id,
	startSync: true,
	syncMode: 'on-demand',
	rowUpdateMode: 'partial',
	tableName: 'form-items',
}));

export const formsCollection = createCollection(dexieCollectionOptions({
	id: 'forms',
	schema: Form,
	startSync: true,
	dbName,
	getKey: f => f.slug,
	awaitPersistence: false,
	syncMode: 'on-demand',
	rowUpdateMode: 'partial',
	tableName: 'forms',
}));

export const formVersionsCollection = createCollection(dexieCollectionOptions({
	id: 'form-versions',
	dbName,
	schema: FormVersion,
	getKey: (fv) => fv.id,
	startSync: true,
}));

export const allCollections = {
	forms: formsCollection,
	'form-versions': formVersionsCollection,
	'form-items': formItemsCollection,
	submissions: responseSessionsCollection,
	responses: responseCollection,
};

export function provideCollectionIndexing() {
	return provideAppInitializer(async () => {
		responseCollection.createIndex(row => row.id, { indexType: BasicIndex });
		responseCollection.createIndex(row => row.sessionId, { indexType: BasicIndex });
		responseCollection.createIndex(row => row.parentId, { indexType: BasicIndex });
		// responseCollection.createIndex(row => [row.sessionId, row.parentId], { indexType: BasicIndex });

		formsCollection.createIndex(row => row.slug, { indexType: BasicIndex });

		formItemsCollection.createIndex(row => row.id, { indexType: BasicIndex });
		formItemsCollection.createIndex(row => row.updatedAt, { indexType: BasicIndex });
		formItemsCollection.createIndex(row => [row.formVersion, row.path], { indexType: BasicIndex });
		formItemsCollection.createIndex(row => row.formVersion, { indexType: BasicIndex });

		formVersionsCollection.createIndex(row => row.id, { indexType: BasicIndex });
		formVersionsCollection.createIndex(row => row.form, { indexType: BasicIndex });
		formVersionsCollection.createIndex(row => row.updatedAt, { indexType: BasicIndex });
		formVersionsCollection.createIndex(row => [row.form, row.updatedAt], { indexType: BasicIndex });

		responseSessionsCollection.createIndex(row => row.id, { indexType: BasicIndex });
		responseSessionsCollection.createIndex(row => row.index, { indexType: BasicIndex });
	})
}

export type Entity<T extends object> = WithVirtualProps<T, string>;
