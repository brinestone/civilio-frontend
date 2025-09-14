import { defineConfig } from "drizzle-kit";
const dbURL = new URL(process.env.DB_URL);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./assets/migrations",
  schemaFilter: ['civilio'],
  dbCredentials: {
    url: dbURL.toString(),
    ssl: dbURL.searchParams.has("sslmode", "require"),
  },
});
