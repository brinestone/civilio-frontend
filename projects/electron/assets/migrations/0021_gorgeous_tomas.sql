CREATE TYPE "revisions"."sync_status" AS ENUM('pending', 'synced');--> statement-breakpoint
ALTER TABLE "revisions"."deltas" ADD COLUMN "syncStatus" "revisions"."sync_status" DEFAULT 'pending';