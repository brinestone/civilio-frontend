CREATE SCHEMA IF NOT EXISTS "revisions";
--> statement-breakpoint
DO
$$
	BEGIN
		IF NOT EXISTS (SELECT 1
									 FROM pg_type t
													JOIN pg_namespace n ON n.oid = t.typnamespace
									 WHERE t.typname = 'change_op'
										 AND n.nspname = 'revisions') THEN
			CREATE TYPE "revisions"."change_op" AS ENUM ('INSERT', 'DELETE', 'UPDATE');
		end if;
	END
$$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "revisions"."deltas"
(
	"hash"             text GENERATED ALWAYS AS (MD5
																							 (("revisions"."deltas"."delta_data"):: TEXT)) STORED,
	"submission_index" integer                 NOT NULL,
	"index"            integer                 NOT NULL,
	"form"             "civilio"."form_types"  NOT NULL,
	"table_name"       text                    NOT NULL,
	"changed_at"       timestamp DEFAULT now() NOT NULL,
	"delta_data"       jsonb                   NOT NULL,
	"changed_by"       text,
	"op"               "revisions"."change_op" NOT NULL,
	"parent"           text,
	CONSTRAINT "deltas_hash_submission_index_index_form_table_name_pk" PRIMARY KEY ("hash", "submission_index", "index", "form", "table_name")
);
--> statement-breakpoint
DROP VIEW IF EXISTS "civilio"."vw_db_columns";--> statement-breakpoint
DROP VIEW IF EXISTS "civilio"."vw_submissions";--> statement-breakpoint
ALTER TABLE "civilio"."form_field_mappings"
	drop column IF EXISTS "alias_hash";--> statement-breakpoint
ALTER TABLE "civilio"."form_field_mappings"
	ADD COLUMN "alias_hash" text GENERATED ALWAYS AS (md5
																										("civilio"."form_field_mappings"."field")) STORED;
--> statement-breakpoint
CREATE VIEW "civilio"."vw_db_columns" AS
(
SELECT c.column_name,
			 c.data_type,
			 c.table_name,
			 CAST(c.table_schema as "civilio"."form_types") as form
FROM information_schema.columns c
WHERE c.table_schema in ('fosa', 'chefferie', 'csc'));
--> statement-breakpoint
CREATE VIEW "civilio"."vw_submissions" AS
(
SELECT _id,
			 _index,
			 _validation_status,
			 validation_code,
			 facility_name,
			 _submission_time,
			 form,
			 next,
			 prev,
			 lower(COALESCE(_validation_status, ''::text)) =
			 'validation_status_approved'::text AS is_valid
FROM (SELECT df._id::double precision::integer                AS _id,
						 df._index,
						 df._validation_status::text                      AS _validation_status,
						 df.code_de_validation::text                      AS validation_code,
						 df.q2_4_officename::text                         AS facility_name,
						 df._submission_time::date                        AS _submission_time,
						 (SELECT 'csc'::civilio.form_types AS form_types) AS form,
						 lead(df._index) OVER (ORDER BY df._index)        AS next,
						 lag(df._index) OVER (ORDER BY df._index)         AS prev
			FROM csc.data df
			UNION
			SELECT df._id::double precision::integer                 AS _id,
						 df._index,
						 df._validation_status::text                       AS _validation_status,
						 df.q14_02_validation_code::text                   AS validation_code,
						 df.q1_12_officename::text                         AS facility_name,
						 df._submission_time,
						 (SELECT 'fosa'::civilio.form_types AS form_types) AS form,
						 lead(df._index) OVER (ORDER BY df._index)         AS next,
						 lag(df._index) OVER (ORDER BY df._index)          AS prev
			FROM fosa.data df
			UNION
			SELECT df._id::double precision::integer                      AS _id,
						 df._index,
						 df._validation_status::text                            AS _validation_status,
						 df.q14_02_validation_code::text                        AS validation_code,
						 df.q1_12_officename::text                              AS facility_name,
						 df._submission_time,
						 (SELECT 'chefferie'::civilio.form_types AS form_types) AS form,
						 lead(df._index) OVER (ORDER BY df._index)              AS next,
						 lag(df._index) OVER (ORDER BY df._index)               AS prev
			FROM chefferie.data df) result
ORDER BY _submission_time DESC);
--> statement-breakpoint
