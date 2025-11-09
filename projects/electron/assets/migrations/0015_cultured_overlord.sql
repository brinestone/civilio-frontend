ALTER TABLE "revisions"."deltas" ALTER COLUMN "hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "revisions"."deltas" ALTER COLUMN "hash" DROP EXPRESSION;