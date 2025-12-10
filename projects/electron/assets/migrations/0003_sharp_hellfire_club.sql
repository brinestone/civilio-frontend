ALTER TABLE "civilio"."form_field_mappings"
	ADD COLUMN IF NOT EXISTS "alias_hash" text GENERATED ALWAYS AS (md5("civilio"."form_field_mappings"."field")) STORED;
