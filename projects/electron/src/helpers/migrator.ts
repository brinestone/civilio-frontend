import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { PgDatabase } from 'drizzle-orm/pg-core';
import fs from 'fs/promises';
import path from 'path';
import { provideLogger } from './logging';

const DUPLICATE_OBJECT_ERROR_CODE = '42710';
const DUPLICATE_TABLE_ERROR_CODE = '42P07';
const DUPLICATE_COLUMN_ERROR_CODE = '42701';

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
	private readonly logger = provideLogger('MigrationRunner');

	constructor(
		private migrationsDir: string,
		private migrationsTable: string = '__drizzle_migrations'
	) {
		this.logger.verbose('Initializing');
	}

	async checkMigrations(db: TDb): Promise<{
		needsMigration: boolean;
		pending: MigrationFile[];
		appliedCount: number;
		lastAppliedName: string | null;
	}> {
		// 1. Read and sort all local migration files
		const migrationFiles = await this.readMigrationFiles();

		// 2. Ensure tracking table exists
		await this.ensureMigrationsTable(db);

		// 3. Get the "latest" migration applied by sequence/name
		const appliedData = await db.execute(sql`
			SELECT name
			FROM ${ sql.raw(this.migrationsTable) }
			ORDER BY name DESC
			LIMIT 1
		`);

		const lastAppliedName = appliedData.rows.length > 0
			? (appliedData.rows[0].name as string)
			: null;

		// Extract sequence number (e.g., "0001_name.sql" -> 1)
		const lastSequence = lastAppliedName
			? parseInt(lastAppliedName.split('_')[0])
			: -1;

		// 4. Filter: Only migrations with a prefix GREATER than the last applied sequence
		const pendingMigrations = migrationFiles.filter(file => {
			const currentSequence = parseInt(file.name.split('_')[0]);
			return currentSequence > lastSequence;
		});

		return {
			needsMigration: pendingMigrations.length > 0,
			pending: pendingMigrations,
			appliedCount: migrationFiles.length - pendingMigrations.length,
			lastAppliedName
		};
	}

	async runMigrations(db: TDb) {
		await this.ensureMigrationsTable(db);
		const status = await this.checkMigrations(db);

		if (!status.needsMigration) {
			this.logger.log('No new migrations to apply.');
			return;
		}

		this.logger.log(`Applying ${ status.pending.length } new migrations (starting after ${ status.lastAppliedName ?? 'beginning' })...`);

		for (const migration of status.pending) {
			await db.transaction(async (tx) => {
				try {
					// Execute statements split by the Drizzle breakpoint
					const statements = migration.content
						.split('--> statement-breakpoint')
						.map(v => v.trim())
						.filter(v => v.length > 0);

					for (const statement of statements) {
						try {
							await tx.execute(sql.raw(statement));
						} catch (e) {
							if ('code' in e && IDEMPOTENT_ERROR_CODES.has(e.code)) {
								this.logger.warn(`Migration ${ migration.name } skipped a statement (Object already exists).`);
							} else {
								throw e; // Rollback
							}
						}
					}

					// Record the migration success
					await tx.execute(sql`
						INSERT INTO ${ sql.identifier(this.migrationsTable) } (hash, name, created_at)
						VALUES (${ migration.hash }, ${ migration.name },
										${ new Date().toISOString() })
						ON CONFLICT (hash) DO UPDATE SET name = ${ migration.name }
					`);

					this.logger.log(`✓ Applied migration: ${ migration.name }`);
				} catch (error) {
					this.logger.error(`✗ Failed to apply migration ${ migration.name }:`, error);
					throw error;
				}
			});
		}
		this.logger.log('All migrations applied successfully');
	}

	private async readMigrationFiles(): Promise<MigrationFile[]> {
		try {
			const files = await fs.readdir(this.migrationsDir);
			const sqlFiles = files.filter(f => f.endsWith('.sql'));

			const migrations: MigrationFile[] = [];

			for (const fileName of sqlFiles) {
				const content = await fs.readFile(
					path.join(this.migrationsDir, fileName),
					'utf-8'
				);

				const hash = this.generateHash(content);
				const timestamp = parseInt(fileName.split('_')[0]) || 0;

				migrations.push({
					name: fileName,
					content,
					hash,
					timestamp
				});
			}

			// Sort by the prefix number to ensure linear execution
			return migrations.sort((a, b) => a.timestamp - b.timestamp);
		} catch (error) {
			if ((error as any).code === 'ENOENT') {
				throw new Error(`Migrations directory not found: ${ this.migrationsDir }`);
			}
			throw error;
		}
	}

	private generateHash(content: string): string {
		return crypto
			.createHash('sha256')
			.update(content)
			.digest('hex')
			.substring(0, 16);
	}

	private async ensureMigrationsTable(db: TDb): Promise<void> {
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS ${ sql.raw(this.migrationsTable) }
			(
				id         SERIAL PRIMARY KEY,
				hash       VARCHAR(64) UNIQUE NOT NULL,
				name       VARCHAR(255)       NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);
	}
}
