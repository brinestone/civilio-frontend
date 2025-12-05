DROP VIEW IF EXISTS "civilio"."vw_submissions";
ALTER TABLE "revisions"."deltas"
	ALTER COLUMN "changed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "revisions"."deltas"
	ALTER COLUMN "changed_at" SET DEFAULT now();
