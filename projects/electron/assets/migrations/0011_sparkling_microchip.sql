DROP INDEX IF EXISTS "revisions"."deltas_hash_index";--> statement-breakpoint
CREATE UNIQUE INDEX "deltas_hash_index" ON "revisions"."deltas" USING btree ("hash");
