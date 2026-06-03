import { provideAppInitializer } from "@angular/core";
import { SubmissionLookup } from "@civilio/sdk/models";
import { BasicIndex, createCollection } from "@tanstack/db";
import { dexieCollectionOptions } from "tanstack-dexie-db-collection";
import { FormSchema, FormVersionSchema } from "./schemas";

const dbName = 'civilio-db';
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
	submissions: submissionsCollection
};

export function provideCollectionIndexing() {
	return provideAppInitializer(async () => {
		formVersionsCollection.createIndex(row => row.form, { indexType: BasicIndex });
		submissionsCollection.createIndex(row => row.index, { indexType: BasicIndex });
	})
}
