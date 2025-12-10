import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { PgDatabase } from 'drizzle-orm/pg-core';
import fs from 'fs/promises';
import path from 'path';

const DUPLICATE_OBJECT_ERROR_CODE = '42710'; // 'duplicate_object' error
const DUPLICATE_TABLE_ERROR_CODE = '42P07'; // 'duplicate_table' error
const DUPLICATE_COLUMN_ERROR_CODE = '42701';

// You might want to include more idempotent error codes here, e.g.,
// const IDEMPOTENT_ERROR_CODES = new Set(['42710', '42P07']);
const IDEMPOTENT_ERROR_CODES = new Set([
	DUPLICATE_OBJECT_ERROR_CODE,
	DUPLICATE_TABLE_ERROR_CODE,
	DUPLICATE_COLUMN_ERROR_CODE
]);

type MigrationFile = {
	name: string;
	content: string;
	hash: string;
	timestamp: number;
};

export class MigrationRunner<TDb extends PgDatabase<any, any>> {
	constructor(
		private migrationsDir: string,
		private migrationsTable: string = '__drizzle_migrations'
	) {
	}

	async checkMigrations(db: TDb): Promise<{
		needsMigration: boolean;
		pending: MigrationFile[];
		applied: string[];
		lastApplied: string | null;
	}> {
		// 1. Read migration files
		const migrationFiles = await this.readMigrationFiles();

		// 2. Check if migrations table exists
		await this.ensureMigrationsTable(db);

		// 3. Get applied migrations
		const appliedMigrations = await this.getAppliedMigrations(db);
		const appliedHashes = new Set(appliedMigrations.map(m => m.hash));

		// 4. Find pending migrations
		const pendingMigrations = migrationFiles.filter(
			file => !appliedHashes.has(file.hash)
		);

		// 5. Get last applied migration
		const lastApplied = appliedMigrations.length > 0
			? appliedMigrations[appliedMigrations.length - 1].hash
			: null;

		return {
			needsMigration: pendingMigrations.length > 0,
			pending: pendingMigrations,
			applied: appliedMigrations.map(m => m.hash),
			lastApplied
		};
	}

	async runMigrations(db: TDb) {
		await this.ensureMigrationsTable(db);
		const status = await this.checkMigrations(db);
		if (!status.needsMigration) {
			console.log('No migrations needed');
			return;
		}
		console.log(`Applying ${status.pending.length} migrations...`);

		for (const migration of status.pending) {
			await db.transaction(async (tx) => {
				let ranSuccessfully = true;
				try {
					try {
						await tx.execute(sql.raw(migration.content));
					} catch (e) {
						if ('code' in e && IDEMPOTENT_ERROR_CODES.has(e.code)) {
							console.warn(`Warning: Migration ${migration.name} encountered a recoverable error (Object already exists). Continuing...`)
						} else {
							ranSuccessfully = false;
							throw e; // This rolls back the entire transaction.
						}
					}

					// Record the migration
					if (ranSuccessfully) {
						await tx.execute(sql`
							INSERT INTO ${sql.identifier(this.migrationsTable)} (hash, name, created_at)
							VALUES (${migration.hash}, ${migration.name},
											${new Date().toISOString()})
							ON CONFLICT (hash) DO UPDATE SET name = ${migration.name}
						`);
						console.log(`✓ Applied migration: ${migration.name}`);
					}

				} catch (error) {
					console.error(`✗ Failed to apply migration ${migration.name}:`, error);
					throw error;
				}
			});
		}
		console.log('All migrations applied successfully');
	}

	private async readMigrationFiles(): Promise<MigrationFile[]> {
		try {
			const files = await fs.readdir(this.migrationsDir);
			const sqlFiles = files
				.filter(f => f.endsWith('.sql'))
				.sort(); // Important: sort alphabetically for correct order

			const migrations: MigrationFile[] = [];

			for (const fileName of sqlFiles) {
				const content = await fs.readFile(
					path.join(this.migrationsDir, fileName),
					'utf-8'
				);

				const hash = this.generateHash(content);

				// Extract timestamp from filename (e.g., 0001_name.sql -> 1)
				const timestamp = parseInt(fileName.split('_')[0]) || 0;

				migrations.push({
					name: fileName,
					content,
					hash,
					timestamp
				});
			}

			return migrations.sort((a, b) => a.timestamp - b.timestamp);
		} catch (error) {
			if ((error as any).code === 'ENOENT') {
				throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
			}
			throw error;
		}
	}

	private generateHash(content: string): string {
		return crypto
			.createHash('sha256')
			.update(content)
			.digest('hex')
			.substring(0, 16); // Short hash for readability
	}

	private async ensureMigrationsTable(db: TDb): Promise<void> {
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS ${sql.raw(this.migrationsTable)}
			(
				id         SERIAL PRIMARY KEY,
				hash       VARCHAR(64) UNIQUE NOT NULL,
				name       VARCHAR(255)       NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);
	}

	private async getAppliedMigrations(db: TDb): Promise<Array<{
		hash: string
	}>> {
		try {
			const result = await db.execute(sql`
				SELECT hash
				FROM ${sql.raw(this.migrationsTable)}
				ORDER BY created_at
			`);
			return result.rows;
		} catch (error) {
			// Table might not exist yet
			return [];
		}
	}
}
