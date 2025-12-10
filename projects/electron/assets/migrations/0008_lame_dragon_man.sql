CREATE INDEX IF NOT EXISTS "deltas_submission_index_index" ON "revisions"."deltas" USING btree ("submission_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deltas_index_index" ON "revisions"."deltas" USING btree ("index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deltas_form_index" ON "revisions"."deltas" USING btree ("form");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deltas_hash_index" ON "revisions"."deltas" USING btree ("hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deltas_changed_at_index" ON "revisions"."deltas" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deltas_parent_hash_index" ON "revisions"."deltas" USING btree ("parent", "hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deltas_submission_index_form_changed_at_index" ON "revisions"."deltas" USING btree ("submission_index", "form", "changed_at");
