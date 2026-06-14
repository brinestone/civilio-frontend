import { provideAppInitializer } from "@angular/core";
import { RelevanceDefinition, SubmissionLookup } from "@civilio/sdk/models";
import { BasicIndex, createCollection, WithVirtualProps } from "@tanstack/db";
import { dexieCollectionOptions } from "tanstack-dexie-db-collection";
import { FormItem, FormSchema, FormVersionSchema } from "./schemas";

const dbName = 'civilio-db';

export const formItemRelevanceCollection = createCollection(dexieCollectionOptions({
	id: 'relevances',
	schema: RelevanceDefinition,
	dbName,
	getKey: r => r.
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
	schema: FormSchema,
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
	schema: FormVersionSchema,
	getKey: (fv) => fv.id,
	startSync: true,
}));
export const submissionsCollection = createCollection(dexieCollectionOptions({
	id: 'submissions',
	dbName,
	schema: SubmissionLookup,
	getKey: s => [s.index, s.form, s.formVersion].join('|'),
	startSync: true
}));

export const allCollections = {
	forms: formsCollection,
	'form-versions': formVersionsCollection,
	'form-items': formItemsCollection,
	submissions: submissionsCollection
};

export function provideCollectionIndexing() {
	return provideAppInitializer(async () => {
		formVersionsCollection.createIndex(row => row.form, { indexType: BasicIndex });
		submissionsCollection.createIndex(row => row.index, { indexType: BasicIndex });
		formItemsCollection.createIndex(row => row.formVersion, { indexType: BasicIndex });
	})
}

export type Entity<T extends object> = WithVirtualProps<T, string>;
