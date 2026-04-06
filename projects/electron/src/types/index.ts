import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { ExtractTablesWithRelations } from 'drizzle-orm';

export type Transaction = PgTransaction<
	NodePgQueryResultHKT,
	Record<string, unknown>,
	ExtractTablesWithRelations<Record<string, unknown>>
>;
