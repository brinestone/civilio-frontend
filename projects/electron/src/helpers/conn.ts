import {
	DbConnectionRefInput,
	DbConnectionRefInputSchema,
	DbConnectionRefSchema
} from "@civilio/shared";
import { DatabaseSync, StatementSync } from "node:sqlite";

export class ConnectionManager {
	private readonly conn: DatabaseSync;

	constructor(
		dbPath: string
	) {
		console.log(`Initializing connection manager on ${ dbPath }`)
		this.conn = new DatabaseSync(dbPath);
		this.initialize();
	}

	toggleMigrated(id?: number) {
		this.runInTransaction(() => {
			if (id === undefined) {
				this.conn.exec(`
					UPDATE connections
					SET migrated = ABS(migrated - 1)
					WHERE inUse = 1;
				`);
			} else {
				const query = this.conn.prepare(`
					UPDATE connections
					SET migrated = ABS(migrated - 1)
					WHERE id = :id;
				`);
				query.run({ id });
			}
		})
	}

	useConnection(id: number) {
		this.runInTransaction(() => {
			if (!this.connectionExistsById(id)) throw new Error('Connection does not exist with id: ' + id);
			let query = this.conn.prepare(`
				UPDATE connections
				SET inUse = 1
				WHERE id = :id;
			`);
			query.run({ id });

			query = this.conn.prepare(`
				UPDATE connections
				SET inUse = 0
				WHERE id <> :id;
			`);
			query.run({ id });
		});
	}

	connectionExistsById(id: number) {
		const query = this.conn.prepare(`
			SELECT EXISTS(SELECT 1 FROM connections WHERE id = ?) connectionExists;
		`);
		const result = query.get(id);
		return result?.connectionExists === 1;
	}

	hasConnections() {
		const query = this.conn.prepare(`
			SELECT EXISTS(SELECT * FROM connections) as hasConnections;
		`);
		const result = query.get();
		return result?.hasConnections === 1;
	}

	getCurrentConnection(includePassword = false) {
		let query: StatementSync;
		if (includePassword) {
			query = this.conn.prepare(`
				SELECT *
				FROM connections
				WHERE inUse = 1
				LIMIT 1;
			`);
		} else {
			query = this.conn.prepare(`
				SELECT username,
							 database,
							 host,
							 port,
							 ssl,
							 inUse,
							 addedAt,
							 updatedAt,
							 migrated,
							 id
				FROM connections
				WHERE inUse = 1
				LIMIT 1;
			`);
		}
		const result = query.get();
		const schema = DbConnectionRefSchema.nullable();
		return schema.parse(result ?? null)
	}

	clearConnections() {
		this.runInTransaction(() => {
			// noinspection SqlWithoutWhere
			this.conn.exec(`DELETE
											FROM connections;`);
		});
	}

	removeConnection(id: number) {
		this.runInTransaction(() => {
			const query = this.conn.prepare(`
				DELETE
				FROM connections
				WHERE id = ?
			`);
			query.run(id);
			const current = this.getCurrentConnection();
			if (current) return;
			this.conn.exec(`UPDATE connections
											SET inUse = 1
											WHERE updatedAt = MAX(updatedAt);`)
		})
	}

	getHistory() {
		const query = this.conn.prepare(`
			SELECT username,
						 database,
						 host,
						 port,
						 ssl,
						 "inUse",
						 "addedAt",
						 "updatedAt",
						 migrated,
						 id
			FROM connections
			ORDER BY updatedAt DESC;
		`);
		return query.all();
	}

	addConnection(ref: DbConnectionRefInput) {
		console.log('Adding new connection', ref);
		this.runInTransaction(() => {
			const {
				database,
				host,
				password,
				port,
				ssl,
				username
			} = DbConnectionRefInputSchema.parse(ref);
			let query = this.conn.prepare(`
				INSERT INTO connections(username, database, host, port, ssl, password)
				VALUES (:username, :database, :host, :port, :ssl, :password)
				ON CONFLICT (username,database,host)
					DO UPDATE SET updatedAt = CURRENT_TIMESTAMP,
												port      = excluded.port,
												password  = excluded.password
				RETURNING id;
			`);
			const { id } = query.get({
				username,
				database,
				host,
				port,
				ssl: ssl ? 1 : 0,
				password
			}) as { id: number };
			query = this.conn.prepare(`
				UPDATE connections
				SET inUse = 0
				WHERE id <> ?
			`);
			query.run(id);
		})
	}

	public initialize() {
		this.runInTransaction(() => {
			//language=SQLite
			this.conn.exec(`
				CREATE TABLE IF NOT EXISTS connections
				(
					username  TEXT      NOT NULL,
					database  TEXT      NOT NULL,
					host      TEXT      NOT NULL,
					password  TEXT      NOT NULL,
					port      INTEGER   NOT NULL DEFAULT 5432,
					ssl       INTEGER   NOT NULL DEFAULT 0,
					inUse     INTEGER   NOT NULL DEFAULT 1,
					addedAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
					updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
					migrated  INTEGER   NOT NULL DEFAULT 0,
					id        INTEGER PRIMARY KEY AUTOINCREMENT
				);
				CREATE UNIQUE INDEX IF NOT EXISTS connections_username_database_host_idx_uq ON connections (username, database, host);
			`);
		})
	}

	private runInTransaction<T>(fn: () => T) {
		this.conn.exec(`BEGIN TRANSACTION;`);
		try {
			const result = fn();
			this.conn.exec(`COMMIT;`);
			return result;
		} catch (e) {
			this.conn.exec('ROLLBACK;');
			throw e;
		}
	}
}
