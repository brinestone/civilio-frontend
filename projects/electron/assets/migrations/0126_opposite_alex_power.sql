CREATE TYPE "civilio"."expression_operators" AS ENUM('and', 'or');--> statement-breakpoint
CREATE TYPE "civilio"."relevance_operators" AS ENUM('==', '>=', '<=', '>', '<', 'selected');--> statement-breakpoint
CREATE TABLE "civilio"."forms" (
	"name" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "forms_name_pk" PRIMARY KEY("name"),
	CONSTRAINT "forms_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "civilio"."form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"form_name" text NOT NULL,
	"readonly" boolean DEFAULT false,
	"title" text NOT NULL,
	"t_translated" text,
	"description" text,
	"d_translated" text,
	"span" integer DEFAULT 12
);
--> statement-breakpoint
CREATE TABLE "civilio"."relevance_conditions" (
	"operator" "civilio"."expression_operators" NOT NULL,
	"expressions" uuid[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "civilio"."relevance_expressions" (
	"field" uuid NOT NULL,
	"operator" "civilio"."relevance_operators" NOT NULL,
	"value" text
);
--> statement-breakpoint
ALTER TABLE "civilio"."form_fields" ADD CONSTRAINT "form_fields_form_name_forms_name_fk" FOREIGN KEY ("form_name") REFERENCES "civilio"."forms"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civilio"."relevance_expressions" ADD CONSTRAINT "relevance_expressions_field_form_fields_id_fk" FOREIGN KEY ("field") REFERENCES "civilio"."form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forms_name_index" ON "civilio"."forms" USING btree ("name");--> statement-breakpoint
CREATE INDEX "forms_label_index" ON "civilio"."forms" USING btree ("label");--> statement-breakpoint
CREATE INDEX "forms_description_index" ON "civilio"."forms" USING btree ("description") WHERE "civilio"."forms"."description" is not null;
