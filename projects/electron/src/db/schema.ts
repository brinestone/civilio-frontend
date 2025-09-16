import { pgTable, pgSchema, integer, timestamp, unique, text, primaryKey, date, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const civilio = pgSchema("civilio");
export const formTypesInCivilio = civilio.enum("form_types", ['fosa', 'chefferie', 'csc'])

export const chefferieIdSeqInCivilio = civilio.sequence("chefferie_id_seq", {  startWith: "457502754", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const chefferieIndexSeqInCivilio = civilio.sequence("chefferie_index_seq", {  startWith: "324", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const chefferiePersonnelIndexSeqInCivilio = civilio.sequence("chefferie_personnel_index_seq", {  startWith: "186", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const cscIdSeqInCivilio = civilio.sequence("csc_id_seq", {  startWith: "475016321", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const cscIndexSeqInCivilio = civilio.sequence("csc_index_seq", {  startWith: "445", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const cscPersonnelIndexSeqInCivilio = civilio.sequence("csc_personnel_index_seq", {  startWith: "774", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const cscPiecesIndexSeqInCivilio = civilio.sequence("csc_pieces_index_seq", {  startWith: "543", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const cscStatisticsIndexSeqInCivilio = civilio.sequence("csc_statistics_index_seq", {  startWith: "1463", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const cscVillagesSeqInCivilio = civilio.sequence("csc_villages_seq", {  startWith: "2344", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const fosaIdSeqInCivilio = civilio.sequence("fosa_id_seq", {  startWith: "484119070", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const fosaIndexSeqInCivilio = civilio.sequence("fosa_index_seq", {  startWith: "971", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const fosaPersonnelIndexSeqInCivilio = civilio.sequence("fosa_personnel_index_seq", {  startWith: "1261", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const migrationsInCivilio = civilio.table("migrations", {
	version: integer("_version").notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
});

export const validationCodesInCivilio = civilio.table("validation_codes", {
	form: formTypesInCivilio().notNull(),
	code: text().notNull(),
}, (table) => [
	unique("validation_codes_code_key").on(table.code),
]);

export const choices = civilio.table("choices", {
	name: text().notNull(),
	label: text().notNull(),
	parent: text(),
	group: text().notNull(),
	i18NKey: text("i18n_key"),
	version: formTypesInCivilio().notNull(),
}, (table) => [
	primaryKey({ columns: [table.name, table.group, table.version], name: "choices_pkey"}),
]);

export const fieldMappings = civilio.table("form_field_mappings", {
  field: text().notNull(),
  i18nKey: text("i18n_key"),
	dbColumn: text("db_column").notNull(),
	dbTable: text("db_table").notNull(),
	form: formTypesInCivilio().notNull(),
	dbColumnType: text("db_column_type").notNull(),
}, (table) => [
	primaryKey({ columns: [table.field, table.form], name: "field_db_column_db_table_form_pk"}),
]);
export const vwFormSubmissions = civilio.view("vw_submissions", {	id: integer("_id"),
	index: integer("_index"),
	validationStatus: text("_validation_status"),
	validationCode: text("validation_code"),
	facilityName: text("facility_name"),
	submissionTime: date("_submission_time"),
	form: formTypesInCivilio(),
	next: integer(),
	prev: integer(),
	isValid: boolean("is_valid"),
}).as(sql`SELECT _id, _index, _validation_status, validation_code, facility_name, _submission_time, form, next, prev, lower(COALESCE(_validation_status, ''::text)) = 'validation_status_approved'::text AS is_valid FROM ( SELECT df._id::double precision::integer AS _id, df._index, df._validation_status::text AS _validation_status, df.code_de_validation::text AS validation_code, df.q2_4_officename::text AS facility_name, df._submission_time::date AS _submission_time, ( SELECT 'csc'::civilio.form_types AS form_types) AS form, lead(df._index) OVER (ORDER BY df._index) AS next, lag(df._index) OVER (ORDER BY df._index) AS prev FROM csc.data df UNION SELECT df._id::double precision::integer AS _id, df._index, df._validation_status::text AS _validation_status, df.q14_02_validation_code::text AS validation_code, df.q1_12_officename::text AS facility_name, df._submission_time, ( SELECT 'fosa'::civilio.form_types AS form_types) AS form, lead(df._index) OVER (ORDER BY df._index) AS next, lag(df._index) OVER (ORDER BY df._index) AS prev FROM fosa.data df UNION SELECT df._id::double precision::integer AS _id, df._index, df._validation_status::text AS _validation_status, df.q14_02_validation_code::text AS validation_code, df.q1_12_officename::text AS facility_name, df._submission_time, ( SELECT 'chefferie'::civilio.form_types AS form_types) AS form, lead(df._index) OVER (ORDER BY df._index) AS next, lag(df._index) OVER (ORDER BY df._index) AS prev FROM chefferie.data df) result ORDER BY _submission_time DESC`);
