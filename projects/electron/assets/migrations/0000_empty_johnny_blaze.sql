-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "civilio";
--> statement-breakpoint
CREATE TYPE "civilio"."form_types" AS ENUM('fosa', 'chefferie', 'csc');--> statement-breakpoint
CREATE SEQUENCE "civilio"."chefferie_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 457502754 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."chefferie_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 324 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."chefferie_personnel_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 186 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."csc_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 475016321 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."csc_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 445 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."csc_personnel_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 774 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."csc_pieces_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 543 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."csc_statistics_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1463 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."csc_villages_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 2344 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."fosa_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 484119070 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."fosa_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 971 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "civilio"."fosa_personnel_index_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1261 CACHE 1;--> statement-breakpoint
CREATE TABLE "civilio"."migrations" (
	"_version" integer NOT NULL,
	"applied_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "civilio"."validation_codes" (
	"form" "civilio"."form_types" NOT NULL,
	"code" text NOT NULL,
	CONSTRAINT "validation_codes_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "civilio"."choices" (
	"name" text NOT NULL,
	"label" text NOT NULL,
	"parent" text,
	"group" text NOT NULL,
	"i18n_key" text,
	"version" "civilio"."form_types" NOT NULL,
	CONSTRAINT "choices_pkey" PRIMARY KEY("name","group","version")
);
--> statement-breakpoint
CREATE TABLE "civilio"."form_field_mappings" (
	"field" text NOT NULL,
	"i18n_key" text,
	"db_column" text NOT NULL,
	"db_table" text NOT NULL,
	"form" "civilio"."form_types" NOT NULL,
	"db_column_type" text NOT NULL,
	CONSTRAINT "field_db_column_db_table_form_pk" PRIMARY KEY("field","form")
);
--> statement-breakpoint
CREATE VIEW "civilio"."vw_submissions" AS (SELECT _id, _index, _validation_status, validation_code, facility_name, _submission_time, form, next, prev, lower(COALESCE(_validation_status, ''::text)) = 'validation_status_approved'::text AS is_valid FROM ( SELECT df._id::double precision::integer AS _id, df._index, df._validation_status::text AS _validation_status, df.code_de_validation::text AS validation_code, df.q2_4_officename::text AS facility_name, df._submission_time::date AS _submission_time, ( SELECT 'csc'::civilio.form_types AS form_types) AS form, lead(df._index) OVER (ORDER BY df._index) AS next, lag(df._index) OVER (ORDER BY df._index) AS prev FROM csc.data df UNION SELECT df._id::double precision::integer AS _id, df._index, df._validation_status::text AS _validation_status, df.q14_02_validation_code::text AS validation_code, df.q1_12_officename::text AS facility_name, df._submission_time, ( SELECT 'fosa'::civilio.form_types AS form_types) AS form, lead(df._index) OVER (ORDER BY df._index) AS next, lag(df._index) OVER (ORDER BY df._index) AS prev FROM fosa.data df UNION SELECT df._id::double precision::integer AS _id, df._index, df._validation_status::text AS _validation_status, df.q14_02_validation_code::text AS validation_code, df.q1_12_officename::text AS facility_name, df._submission_time, ( SELECT 'chefferie'::civilio.form_types AS form_types) AS form, lead(df._index) OVER (ORDER BY df._index) AS next, lag(df._index) OVER (ORDER BY df._index) AS prev FROM chefferie.data df) result ORDER BY _submission_time DESC);
*/