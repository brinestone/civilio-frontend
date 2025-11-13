DROP INDEX "revisions"."deltas_hash_index";--> statement-breakpoint
CREATE INDEX "deltas_hash_index" ON "revisions"."deltas" USING btree ("hash");
