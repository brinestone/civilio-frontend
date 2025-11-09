import { Transaction } from '../types';
import { sql } from 'drizzle-orm';

async function removeDatabaseUser(tx: Transaction, username: string) {
	return tx.execute(sql.raw(`
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${username}) THEN

        -- Reassign all owned objects (tables, sequences, functions, schemas, etc.)
        -- to the 'postgres' superuser.
        RAISE NOTICE 'Reassigning ownership of objects in database "record" from "${username}" to "postgres"...';
        REASSIGN OWNED BY ${username} TO postgres;

        -- Revoke any lingering privileges the user might have been granted
        -- (though this is often implicitly handled by DROP ROLE, it is safer)
        RAISE NOTICE 'Dropping role "${username}"...';
        DROP ROLE ${username};

        RAISE NOTICE 'Role ${username} deleted successfully, and its owned objects were transferred to postgres.';

    ELSE
        RAISE NOTICE 'Role ${username} does not exist, no action taken.';
    END IF;
	`));
}

async function createDatabaseUser(tx: Transaction, username: string, password: string, dbName: string, ...accessSchemas: string[]) {

	const privileges = accessSchemas.map(s => {
		return `
		ALTER DEFAULT PRIVILEGES FOR ROLE ${username} IN SCHEMA ${s}
    GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON TABLES TO ${username};

		ALTER DEFAULT PRIVILEGES FOR ROLE ${username} IN SCHEMA ${s}
    GRANT ALL ON SEQUENCES TO ${username};

    ALTER DEFAULT PRIVILEGES FOR ROLE ${username} IN SCHEMA ${s}
    GRANT EXECUTE ON ROUTINES TO ${username};

    ALTER DEFAULT PRIVILEGES FOR ROLE ${username} IN SCHEMA ${s}
    GRANT USAGE ON TYPES TO ${username};
		`;
	});

	return tx.execute(sql.raw(`
	CREATE ROLE ${username} WITH LOGIN PASSWORD ${password} NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
	GRANT CONNECT ON DATABASE ${dbName} TO ${username};
	REVOKE ALL ON SCHEMA public FROM ${username};
	REVOKE CREATE ON SCHEMA public FROM PUBLIC;
	GRANT USAGE ON SCHEMA information_schema TO ${username};
	GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO ${username};
	GRANT CREATE ON DATABASE ${dbName} TO ${username};

	${privileges.join('\n')}
	`));
}
