import {
	DbConnectionRefInput,
	DeleteDbConnectionRequest,
	FindConnectionHistoryResponse,
	FindConnectionHistoryResponseSchema,
	MalConfigurationError,
	MigrationsCheckReportSchema,
	TestDbConnectionRequest,
	TestDbConnectionRequestSchema,
	UseConnectionRequest,
	UseConnectionRequestSchema
} from '@civilio/shared';
import { getTableName, is, Table } from 'drizzle-orm';
import { Cache, MutationOption } from 'drizzle-orm/cache/core';
import { CacheConfig } from 'drizzle-orm/cache/core/types';
import { drizzle } from 'drizzle-orm/node-postgres';
import { app } from 'electron';
import { LRUCache } from 'lru-cache';
import { join, resolve } from 'path';
import { Client, Pool } from 'pg';
import z from 'zod';
import { ConnectionManager } from './conn';
import { MigrationRunner } from './migrator';

let pool: Pool | null = null;
const migrator = new MigrationRunner(app.isPackaged ? join(app.getPath('assets'), 'resources', 'assets') : resolve(join(__dirname, '..', 'assets')));
const connectionManager = new ConnectionManager(join(app.getPath('appData'), 'civilio', 'c.db'));

export function useConnection(req: UseConnectionRequest) {
	connectionManager.useConnection(UseConnectionRequestSchema.parse(req));
	resetPool();
}

export function clearConnections() {
	connectionManager.clearConnections();
}

export function removeConnection(params: DeleteDbConnectionRequest) {
	connectionManager.removeConnection(z.number().parse(params))
	resetPool();
}

export function saveConnectionParameters(params: DbConnectionRefInput) {
	connectionManager.addConnection(params);
	resetPool();
}

export function findConnectionHistory(): FindConnectionHistoryResponse {
	return FindConnectionHistoryResponseSchema.parse(connectionManager.getHistory());
}

export async function runMigrations() {
	const db = provideDatabase({});
	await migrator.runMigrations(db);
	connectionManager.toggleMigrated();
}

export async function checkMigration() {
	const db = provideDatabase({});
	return MigrationsCheckReportSchema.parse(await migrator.checkMigrations(db));
}

export async function testConnection(req: TestDbConnectionRequest) {
	const {
		database,
		host,
		password,
		port,
		ssl,
		username
	} = TestDbConnectionRequestSchema.parse(req);
	const client = new Client({
		user: username,
		host,
		password,
		port,
		ssl,
		database,
	});

	const url = new URL(`/${ database }`, `postgresql://${ username }:${ password }@${ host }:${ port }`);
	if (ssl) url.searchParams.set('sslmode', 'required');

	console.log(`Testing database on host: ${ host } using ${ url.toString() }...`);
	try {
		await client.connect();
		const res = await client.query('SELECT NOW()');
		console.log(`Database time is ${ res.rows[0].now }`);
		return true;
	} catch (ex) {
		console.log(`Test connection: ${ url } failed`);
		console.error(ex);
		return ex.message;
	} finally {
		await client.end();
	}
}

export function resetPool() {
	const conn = connectionManager.getCurrentConnection(true);
	if (conn == null) {
		throw new MalConfigurationError('db');
	}
	const { host, password, port, ssl, username, database } = conn;
	const url = new URL(`${ database }`, `postgresql://${ username }:${ password }@${ host }:${ port }`);
	if (ssl) {
		url.searchParams.set('sslmode', 'require');
	}
	pool = new Pool({
		connectionString: url.toString()
	});
}

function calculateSize(value: any): number {
	if (typeof value === 'string') {
		return Buffer.from(value).byteLength;
	} else if (typeof value === 'number') {
		return 8;
	} else if (typeof value === 'boolean') {
		return 4;
	} else if (typeof value === 'object' && value !== null) {
		if (Array.isArray(value)) {
			return value.reduce((sum, item) => sum + calculateSize(item), 0);
		} else {
			return Object.entries(value).reduce((sum, [k, v]) => calculateSize(k) + calculateSize(v), 0);
		}
	} else if (value === null || value === undefined) {
		return 0;
	}
	return 0;
}

class LRUDrizzleCache extends Cache {
	private readonly usedTablesPerKey: Record<string, string[]> = {};
	private readonly _cache = new LRUCache<string, any>({
		maxSize: 50000,
		max: 500,
		sizeCalculation: (value, key) => {
			const size = calculateSize(value);
			console.log(`value at ${ key } calculated to ${ size } size`)
			return size;
		}
	});
	private readonly ttl = 36000;

	strategy(): 'explicit' | 'all' {
		return 'explicit';
	}

	async get(key: string, tables: string[], isTag: boolean, isAutoInvalidate?: boolean): Promise<any[] | undefined> {
		console.log(`Getting ${ key } from cache`);
		return this._cache.get(key);
	}

	async put(key: string, response: any, tables: string[], isTag: boolean, config?: CacheConfig): Promise<void> {
		console.log(`Updating ${ key } from cache`);
		const ttl = config?.px ?? (config?.ex ? config.ex * 1000 : this.ttl);
		this._cache.set(key, response, { ttl });
		for (const table of tables) {
			const keys = this.usedTablesPerKey[table];
			if (keys === undefined) {
				this.usedTablesPerKey[table] = [key];
			} else {
				keys.push(key);
			}
		}
	}

	async onMutate({ tables, tags }: MutationOption): Promise<void> {
		const assertedTags = tags ? Array.isArray(tags) ? tags : [tags] : [];
		const assertedTables = tables ? Array.isArray(tables) ? tables : [tables] : [];

		const keysToDelete = new Set<string>();

		for (const table of assertedTables) {
			const tableName = is(table, Table) ? getTableName(table) : (table as string);
			const keys = this.usedTablesPerKey[tableName] ?? [];
			keys.forEach(key => keysToDelete.add(key));
		}

		if (keysToDelete.size > 0 || assertedTags.length > 0) {
			for (const tag of assertedTags) {
				this._cache.delete(tag);
			}

			for (const key of keysToDelete) {
				this._cache.delete(key);
				for (const table of assertedTables) {
					const tableName = is(table, Table) ? getTableName(table) : (table as string);
					this.usedTablesPerKey[tableName] = [];
				}
			}
		}
	}
}

const singletonCache = new LRUDrizzleCache();

export function provideDatabase(schema: Record<string, unknown>) {
	const conn = connectionManager.getCurrentConnection(true);
	if (conn == null) {
		throw new MalConfigurationError('db');
	}
	if (pool == null) {
		console.log(conn);
		const { host, password, port, ssl, username, database } = conn;
		const url = new URL(`${ database }`, `postgresql://${ username }:${ password }@${ host }:${ port }`);
		if (ssl) {
			url.searchParams.set('sslmode', 'require');
		}
		pool = new Pool({
			connectionString: url.toString()
		});
	}
	return drizzle(pool, {
		schema,
		logger: false,
		cache: singletonCache
	});
}
