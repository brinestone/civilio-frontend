import { provideAppInitializer } from "@angular/core";
import { SubmissionLookup } from "@civilio/sdk/models";
import { BasicIndex, createCollection, InferSchemaOutput, WithVirtualProps } from "@tanstack/db";
import { dexieCollectionOptions } from "tanstack-dexie-db-collection";
import z from "zod";
import { FormItem, FormSchema, FormVersionSchema } from "./schemas";

const dbName = 'civilio-db';

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
		console.log('setting up indexes')
		formVersionsCollection.createIndex(row => row.form, { indexType: BasicIndex });
		submissionsCollection.createIndex(row => row.index, { indexType: BasicIndex });
		formItemsCollection.createIndex(row => row.formVersion, { indexType: BasicIndex });
	})
}

export type Entity<T extends object> = WithVirtualProps<T, string>;

function configureCollection<TId extends string, T extends z.ZodType>(id: TId, schema: T, keyFunc: (arg: InferSchemaOutput<T>) => string | number) {
	return dexieCollectionOptions({
		id,
		dbName,
		schema,
		getKey: keyFunc,
		startSync: true,
		rowUpdateMode: 'partial',
		awaitPersistence: false,
		syncMode: 'on-demand',
	})
}
