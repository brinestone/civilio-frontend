ALTER TABLE "revisions"."deltas"
	drop column IF EXISTS "hash";--> statement-breakpoint
ALTER TABLE "revisions"."deltas" ADD COLUMN "hash" text GENERATED ALWAYS AS (MD5
		(CAST("revisions"."deltas"."delta_data" as TEXT))) STORED;
