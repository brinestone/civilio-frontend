import { defineConfig } from "drizzle-kit";
const dbURL = new URL('postgresql://postgres:postgres@localhost:5432/postgres');

export default defineConfig({
  dialect: "postgresql",
  schema: "./projects/electron/src/db/schema.ts",
  out: "./projects/electron/assets/migrations",
  schemaFilter: ['civilio'],
  dbCredentials: {
    url: dbURL.toString(),
    ssl: dbURL.searchParams.has("sslmode", "require"),
  },
});
