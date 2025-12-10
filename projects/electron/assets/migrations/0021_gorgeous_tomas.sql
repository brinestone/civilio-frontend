DO
$$
	BEGIN
		IF NOT EXISTS (SELECT 1
									 FROM pg_type t
													JOIN pg_namespace n ON n.oid = t.typnamespace
									 WHERE t.typname = 'sync_status'
										 AND n.nspname = 'revisions') THEN
			CREATE TYPE "revisions"."sync_status" AS ENUM ('pending', 'synced');--> statement-breakpoint
		end if;
	END
$$;

ALTER TABLE "revisions"."deltas"
	ADD COLUMN IF NOT EXISTS "sync_status" "revisions"."sync_status" DEFAULT 'pending';
