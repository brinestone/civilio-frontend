import { assertInInjectionContext, inject, InjectionToken, makeEnvironmentProviders } from "@angular/core";
import pick from "lodash/pick";
import { CompositePrimaryKey, createRxDatabase, PrimaryKey, RxCollectionCreator, RxDatabase, TopLevelProperty } from 'rxdb';
import {
	getRxStorageDexie
} from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import z from "zod";

const storage = getRxStorageDexie();
export const db = await createRxDatabase({
	name: 'civilio-db', storage: wrappedValidateAjvStorage({ storage }),
});

export type ProvideRxReplicationOptions = {
	replicationId: string;
	batchSize: number;
	autoStart: boolean;
	live: boolean;
	retryTime: number;
};

const RXDB_INSTANCE = new InjectionToken<RxDatabase>('rx-db');
export function provideRxDb() {
	return makeEnvironmentProviders([
		{
			provide: RXDB_INSTANCE,
			useValue: db
		}
	])
}

export function injectRxDatabase() {
	assertInInjectionContext(injectRxDatabase);
	return inject(RXDB_INSTANCE);
}

export type ToRxSchemaOptions<TSchema extends z.ZodObject> = {
	version?: number;
	requiredProps?: (keyof z.output<TSchema>)[];
	indexes?: (keyof z.output<TSchema>)[];
	pkMaxLength?: number;
	title?: string
}

function isCompositePrimaryKey<TSchema extends z.ZodObject>(pk: PrimaryKey<z.output<TSchema>> | CompositePrimaryKey<z.output<TSchema>>): pk is CompositePrimaryKey<z.output<TSchema>> {
	return typeof pk !== 'string';
}
export function toRxSchema<TSchema extends z.ZodObject>(schema: TSchema, primaryKey: PrimaryKey<z.output<TSchema>> | CompositePrimaryKey<z.output<TSchema>>, options?: ToRxSchemaOptions<TSchema>) {
	const jsonSchema = schema.toJSONSchema({ target: 'draft-07' });
	const properties = jsonSchema.properties! as unknown as { [key in Extract<keyof z.output<TSchema>, string>]: TopLevelProperty };
	const primaryKeyPropertyPath = isCompositePrimaryKey(primaryKey) ? primaryKey.key : primaryKey;
	let primaryKeyProp = properties[primaryKeyPropertyPath];
	if (primaryKeyProp.anyOf) {
		primaryKeyProp = pick(primaryKeyProp.anyOf[0], ['type']);
		properties[primaryKeyPropertyPath] = primaryKeyProp;
	}
	primaryKeyProp.maxLength = options?.pkMaxLength ?? 1000;
	return {
		schema: {
			title: options?.title || 'rxdb-schema-' + (options?.version ?? 0),
			primaryKey,
			type: 'object',
			indexes: options?.indexes,
			properties: jsonSchema.properties! as unknown as { [key in Extract<keyof z.output<TSchema>, string>]: TopLevelProperty; },
			version: options?.version ?? 0,
			required: jsonSchema.required,
		},

	} as RxCollectionCreator<z.output<TSchema>>;
}
