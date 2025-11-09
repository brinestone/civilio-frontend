import { defineConfig } from "drizzle-kit";

const dbURL = new URL('postgresql://postgres:postgres@localhost:5432/record_db');
// const dbURL = new URL('postgresql://u_record:record_pwd@localhost:5432/record_db');

export default defineConfig({
	dialect: "postgresql",
	schema: "./projects/electron/src/db/schema.ts",
	out: "./projects/electron/assets/migrations",
	schemaFilter: ['civilio', 'revisions'],
	dbCredentials: {
		url: dbURL.toString(),
		ssl: dbURL.searchParams.has("sslmode", "require"),
	},
});
