import { inArray, isNotNull, SQL, sql } from "drizzle-orm";
import {
	boolean,
	date,
	index,
	integer,
	jsonb,
	pgSchema,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from "drizzle-orm/pg-core";

export const civilio = pgSchema("civilio");
export const revision = pgSchema("revisions");
export const formTypes = civilio.enum("form_types", [
	"fosa",
	"chefferie",
	"csc",
]);
export const chefferieIndexSeqInCivilio = civilio.sequence(
	"chefferie_index_seq",
	{
		startWith: "324",
		increment: "1",
		minValue: "1",
		maxValue: "9223372036854775807",
		cache: "1",
		cycle: false,
	},
);
export const chefferiePersonnelIndexSeqInCivilio = civilio.sequence(
	"chefferie_personnel_index_seq",
	{
		startWith: "186",
		increment: "1",
		minValue: "1",
		maxValue: "9223372036854775807",
		cache: "1",
		cycle: false,
	},
);
export const cscIdSeqInCivilio = civilio.sequence("csc_id_seq", {
	startWith: "475016321",
	increment: "1",
	minValue: "1",
	maxValue: "9223372036854775807",
	cache: "1",
	cycle: false,
});
export const cscIndexSeqInCivilio = civilio.sequence("csc_index_seq", {
	startWith: "445",
	increment: "1",
	minValue: "1",
	maxValue: "9223372036854775807",
	cache: "1",
	cycle: false,
});
export const cscPersonnelIndexSeqInCivilio = civilio.sequence(
	"csc_personnel_index_seq",
	{
		startWith: "774",
		increment: "1",
		minValue: "1",
		maxValue: "9223372036854775807",
		cache: "1",
		cycle: false,
	},
);
export const cscPiecesIndexSeqInCivilio = civilio.sequence(
	"csc_pieces_index_seq",
	{
		startWith: "543",
		increment: "1",
		minValue: "1",
		maxValue: "9223372036854775807",
		cache: "1",
		cycle: false,
	},
);
export const cscStatisticsIndexSeqInCivilio = civilio.sequence(
	"csc_statistics_index_seq",
	{
		startWith: "1463",
		increment: "1",
		minValue: "1",
		maxValue: "9223372036854775807",
		cache: "1",
		cycle: false,
	},
);
export const cscVillagesSeqInCivilio = civilio.sequence("csc_villages_seq", {
	startWith: "2344",
	increment: "1",
	minValue: "1",
	maxValue: "9223372036854775807",
	cache: "1",
	cycle: false,
});
export const fosaIdSeqInCivilio = civilio.sequence("fosa_id_seq", {
	startWith: "484119070",
	increment: "1",
	minValue: "1",
	maxValue: "9223372036854775807",
	cache: "1",
	cycle: false,
});
export const fosaIndexSeqInCivilio = civilio.sequence("fosa_index_seq", {
	startWith: "971",
	increment: "1",
	minValue: "1",
	maxValue: "9223372036854775807",
	cache: "1",
	cycle: false,
});
export const fosaPersonnelIndexSeqInCivilio = civilio.sequence(
	"fosa_personnel_index_seq",
	{
		startWith: "1261",
		increment: "1",
		minValue: "1",
		maxValue: "9223372036854775807",
		cache: "1",
		cycle: false,
	},
);

export const choices = civilio.table(
	"choices",
	{
		name: text().notNull(),
		label: text().notNull(),
		parent: text(),
		group: text().notNull(),
		i18NKey: text("i18n_key"),
		version: formTypes().notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.name, table.group, table.version],
			name: "choices_pkey",
		}),
	],
);

export const fieldMappings = civilio.table(
	"form_field_mappings",
	{
		field: text().notNull(),
		i18nKey: text("i18n_key"),
		dbColumn: text("db_column").notNull(),
		dbTable: text("db_table").notNull(),
		form: formTypes().notNull(),
		dbColumnType: text("db_column_type").notNull(),
		aliasHash: text("alias_hash").generatedAlwaysAs(
			(): SQL => sql<string>`md5
				(${fieldMappings.field})`,
		),
	},
	(table) => [
		primaryKey({
			columns: [table.field, table.form],
			name: "field_db_column_db_table_form_pk",
		}),
	],
);
export const vwFormSubmissions = civilio
	.view("vw_submissions", {
		id: integer("_id"),
		index: integer("_index"),
		validationStatus: text("_validation_status"),
		validationCode: text("validation_code"),
		facilityName: text("facility_name"),
		submissionTime: date("_submission_time"),
		form: formTypes(),
		next: integer(),
		prev: integer(),
		isValid: boolean("is_valid"),
		currentVersion: text('current_version'),
		lastModifiedAt: timestamp("last_modified_at", { withTimezone: true }),
		lastModifiedBy: text("last_modified_by"),
	})
	.as(
		sql`
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
						 'validation_status_approved'::text AS is_valid,
						 current_version,
						 last_modified_at,
						 last_modified_by
			FROM ((SELECT df._id::double precision::integer                       AS _id,
										df._index,
										df._validation_status::text                             AS _validation_status,
										df.code_de_validation::text                             AS validation_code,
										df.q2_4_officename::text                                AS facility_name,
										df._submission_time::date                               AS _submission_time,
										(SELECT 'csc'::civilio.form_types AS form_types)        AS form,
										lead(df._index) OVER (ORDER BY df._index)               AS next,
										lag(df._index) OVER (ORDER BY df._index)                AS prev,
										COALESCE(rd.hash, df._version_)                         AS current_version,
										COALESCE(MAX(rd.changed_at),
														 df._submission_time::TIMESTAMP WITH TIME ZONE) AS last_modified_at,
										COALESCE(rd.changed_by, df._submitted_by)               AS last_modified_by
						 FROM csc.data df
										LEFT JOIN revisions.deltas rd ON rd.hash = df._version_
							 AND rd.form = 'csc'::civilio.form_types
							 AND rd.submission_index = df._index
						 GROUP BY df._id, df._index, rd.hash, rd.changed_by,
											df._validation_status, df.q2_4_officename,
											df.code_de_validation, df._submission_time, df._version_,
											df._submitted_by)
						UNION
						(SELECT df._id::double precision::integer                       AS _id,
										df._index,
										df._validation_status::text                             AS _validation_status,
										df.q14_02_validation_code::text                         AS validation_code,
										df.q1_12_officename::text                               AS facility_name,
										df._submission_time,
										(SELECT 'fosa'::civilio.form_types AS form_types)       AS form,
										lead(df._index) OVER (ORDER BY df._index)               AS next,
										lag(df._index) OVER (ORDER BY df._index)                AS prev,
										COALESCE(rd.hash, df._version_)                         AS current_version,
										COALESCE(MAX(rd.changed_at),
														 df._submission_time::TIMESTAMP WITH TIME ZONE) AS last_modified_at,
										COALESCE(rd.changed_by, df._submitted_by)               AS last_modified_by
						 FROM fosa.data df
										LEFT JOIN revisions.deltas rd ON rd.hash = df._version_
							 AND rd.form = 'fosa'::civilio.form_types
							 AND rd.submission_index = df._index
						 GROUP BY df._id, df._index, rd.hash, rd.changed_by,
											df.q1_12_officename, df._validation_status,
											df.q14_02_validation_code, df._submission_time,
											df._version_, df._submitted_by)
						UNION
						SELECT df._id::double precision::integer                       AS _id,
									 df._index,
									 df._validation_status::text                             AS _validation_status,
									 df.q14_02_validation_code::text                         AS validation_code,
									 df.q1_12_officename::text                               AS facility_name,
									 df._submission_time,
									 (SELECT 'chefferie'::civilio.form_types AS form_types)  AS form,
									 lead(df._index) OVER (ORDER BY df._index)               AS next,
									 lag(df._index) OVER (ORDER BY df._index)                AS prev,
									 COALESCE(rd.hash, df._version_)                         AS current_version,
									 COALESCE(MAX(rd.changed_at),
														df._submission_time::TIMESTAMP WITH TIME ZONE) AS last_modified_at,
									 COALESCE(rd.changed_by, df._submitted_by)               AS last_modified_by
						FROM chefferie.data df
									 LEFT JOIN revisions.deltas rd ON rd.hash = df._version_
							AND rd.form = 'chefferie'::civilio.form_types
							AND rd.submission_index = df._index
						GROUP BY df._id, df._index, rd.hash, rd.changed_by,
										 df._validation_status, df.q1_12_officename,
										 df.q14_02_validation_code, df._submission_time,
										 df._version_, df._submitted_by) result
			ORDER BY last_modified_at DESC
		`,
	);

export const vwDbColumns = civilio
	.view("vw_db_columns", {
		name: text("column_name"),
		dataType: text("data_type"),
		tableName: text("table_name"),
		form: formTypes("form"),
	})
	.as(
		sql`SELECT c.column_name,
							 c.data_type,
							 c.table_name,
							 CAST(c.table_schema as ${formTypes}) as form
				FROM information_schema.columns c
				WHERE ${inArray(sql`c.table_schema`, formTypes.enumValues)}`,
	);

export const changeOp = revision.enum('change_op', ['INSERT', 'DELETE', 'UPDATE', 'REVERT']);
export const versionSyncStatus = revision.enum('sync_status', ['pending', 'synced', 'failed']);
export const deltaChanges = revision.table("deltas", {
	hash: text().notNull(),
	submissionIndex: integer("submission_index").notNull(),
	index: integer("index").notNull(),
	form: formTypes().notNull(),
	table: text('table_name').notNull(),
	changedAt: timestamp("changed_at", {
		mode: "date",
		withTimezone: true
	}).defaultNow().notNull(),
	deltaData: jsonb("delta_data").notNull(),
	changedBy: text("changed_by"),
	op: changeOp().notNull(),
	parent: text('parent'),
	syncStatus: versionSyncStatus('sync_status').default('pending'),
}, t => [
	primaryKey({
		columns: [t.hash, t.submissionIndex, t.index, t.form, t.table]
	}),
	index().on(t.hash),
	index().on(t.submissionIndex),
	index().on(t.index),
	index().on(t.form),
	index().on(t.changedAt),
	index().on(t.parent).where(isNotNull(t.parent)),
	index().on(t.parent, t.hash),
	index().on(t.submissionIndex, t.form, t.changedAt),
]);

export const changeLedger = revision.table('ledger', {
	hash: text().notNull(),
	form: formTypes().notNull(),
	timestamp: timestamp({ withTimezone: true }).notNull(),
	submissionIndex: integer('submission_index').notNull(),
	notes: text()
}, t => [
	uniqueIndex().on(t.hash, t.form, t.submissionIndex)
]);

export const vwFacilities = civilio.view("vw_facilities", {
	facilityName: text("facility_name"),
	index: integer('index'),
	type: formTypes('form'),
	location: text('location'),
	coords: text('gps_coordinates'),
	extraInfo: jsonb('extra_info'),
	approved: boolean('approved'),
	createdAt: date('created_at', { mode: 'date' })
}).as(sql`
	SELECT UPPER(info.facility_name) AS facility_name,
				 info.index,
				 info.form,
				 UPPER(info.location)      AS location,
				 info.gps_coordinates,
				 validated                 AS approved,
				 extra_info,
				 created_at
	FROM (SELECT c._index                                    as index,
							 'csc'::civilio.form_types                   as form,
							 c.q2_4_officename                           as facility_name,
							 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
							 c.q2_12_gps_coordinates                     as gps_coordinates,
							 COALESCE(c._validation_status = 'validation_status_approved',
												false)                             as validated,
							 jsonb_build_object(
								 'milieu', mil.label,
								 'is_functional', COALESCE(c.q2_10_fonctionnel = '1', false),
								 'degree', deg_o.label,
								 'is_chiefdom', COALESCE(c.q2_1a_chefferie = '1', false),
								 'size', COALESCE(c_size.label, c.q2_06_taille_commune),
								 'village_count', COALESCE(v_counts.village_count, 0),
								 'employee_count', COALESCE(em_counts.employee_count, 1),
								 'equipment',
								 (
									 COALESCE(c.q6_01_computers::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_02_serveurs::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_03_printers::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_4_scanners::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_5_onduleur::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_6_climatiseur::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_7_ventilateur::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_9_tablea_bureau::DOUBLE PRECISION::INTEGER,
														0) +
									 COALESCE(c.q6_10_chaise::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q6_12_car::DOUBLE PRECISION::INTEGER, 0) +
									 COALESCE(c.q9_13_moto::DOUBLE PRECISION::INTEGER, 0)
									 ),
								 'has_internet', COALESCE(
									 c.q4_12_batiment_connecte::DOUBLE PRECISION::INTEGER = 1,
									 false),
								 'has_power', COALESCE(
									 c.q4_02_reseau_electrique::DOUBLE PRECISION::INTEGER = 1 OR
									 c.q4_5_autre_source::DOUBLE PRECISION::INTEGER = 1, false),
								 'has_water',
								 COALESCE(c.q4_7alimentation_eau::TEXT NOT IN ('1'), false)
							 )                                           as extra_info,
							 c.q0_06_date_creation                       AS created_at
				FROM csc.data c
							 LEFT JOIN (SELECT _parent_index, COUNT(*) AS employee_count
													FROM csc.data_personnel
													GROUP BY _parent_index) em_counts
												 ON em_counts._parent_index = c._index
							 LEFT JOIN (SELECT _parent_index, COUNT(*) AS village_count
													FROM csc.data_villages
													GROUP BY _parent_index) v_counts
												 ON v_counts._parent_index = c._index
							 LEFT JOIN civilio.choices c_size
												 ON c_size."group" = 'pq1hw83' AND
														c_size.version = 'csc' AND
														c_size.name = c.q2_06_taille_commune
							 LEFT JOIN civilio.choices mil
												 ON mil."group" = 'vb2qk85' AND mil.version = 'csc' AND
														mil.name = c.milieu::TEXT
							 LEFT JOIN civilio.choices deg_o
												 ON deg_o."group" = 'sl95o71' AND
														deg_o.version = 'csc' AND deg_o.name = c.degr::TEXT
							 LEFT JOIN civilio.choices mu_div
												 ON mu_div."group" = 'division' AND
														mu_div.name = c.q2_01_division::TEXT AND
														mu_div.version = 'csc'
							 LEFT JOIN civilio.choices mu_ch
												 ON mu_ch."group" = 'commune' AND
														mu_ch.name = c.q2_02_municipality::TEXT AND
														mu_ch.version = 'csc' AND
														mu_ch.parent = c.q2_01_division::TEXT
				UNION
				SELECT c._index,
							 'fosa'::civilio.form_types                  as form,
							 c.q1_12_officename                          as facility_name,
							 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
							 c.q1_13_gps_coordinates                     as gps_coordinates,
							 COALESCE(c._validation_status = 'validation_status_approved',
												false)                             as validated,
							 jsonb_build_object(
								 'milieu', ml.label,
								 'health_area', mha.label,
								 'health_district', mda.label,
								 'category',
								 COALESCE(NULLIF(TRIM(BOTH ' ' FROM c.autre_cat_gorie), ''),
													c_cat.label),
								 'status', c_status.label,
								 'employee_count', COALESCE(em_counts.employee_count, 1),
								 'has_internet', COALESCE(
									 c.q7_08_broadband_conn_available::DOUBLE PRECISION::INTEGER =
									 1, false),
								 'has_power', COALESCE(
									 c.q7_01_facility_conn_power_grid::DOUBLE PRECISION::INTEGER =
									 1,
									 c.q7_04_any_source_of_backup::DOUBLE PRECISION::INTEGER = 1,
									 false),
								 'has_water', COALESCE(
									 c.q6_09aalimentation_eau::DOUBLE PRECISION::INTEGER = 1,
									 false),
								 'equipment', (
									 COALESCE(c.q9_02_computers, 0) +
									 COALESCE(c.q9_03_printers, 0) +
									 COALESCE(c.q9_04_tablets, 0) +
									 COALESCE(c.q9_10_car, 0) +
									 COALESCE(c.q9_11_mopeds, 0)
									 ),
								 'stats_l_5', jsonb_build_object('births',
																								 COALESCE(group_ce1sz98_ligne_colonne, 0) +
																								 COALESCE(group_ce1sz98_ligne_1_colonne, 0) +
																								 COALESCE(group_ce1sz98_ligne_2_colonne, 0) +
																								 COALESCE(group_ce1sz98_ligne_3_colonne, 0) +
																								 COALESCE(group_ce1sz98_ligne_4_colonne, 0),
																								 'deaths',
																								 COALESCE(group_ce1sz98_ligne_colonne_1, 0) +
																								 COALESCE(group_ce1sz98_ligne_1_colonne_1, 0) +
																								 COALESCE(group_ce1sz98_ligne_2_colonne_1, 0) +
																								 COALESCE(group_ce1sz98_ligne_3_colonne_1, 0) +
																								 COALESCE(group_ce1sz98_ligne_4_colonne_1, 0)
															)
							 )                                           AS extra_info,
							 c.q0_06_date_creation                       AS created_at
				FROM fosa.data c
							 LEFT JOIN (SELECT _parent_index, COUNT(*) AS employee_count
													FROM fosa.data_personnel
													GROUP BY _parent_index) em_counts
												 ON em_counts._parent_index = c._index
							 LEFT JOIN civilio.choices c_status
												 ON c_status."group" = 'qy7we33' AND
														c_status.name = c.statut_de_la_fosa::TEXT AND
														c_status.version = 'fosa'
							 LEFT JOIN civilio.choices c_cat
												 ON c_cat."group" = 'pa9ii12' AND
														c_cat.name = c.q1_07_type_healt_facility::TEXT AND
														c_cat.version = 'fosa'
							 LEFT JOIN civilio.choices mda
												 ON mda."group" = 'district' AND
														mda.name = c.ds_rattachement::TEXT AND
														mda.version = 'fosa'
							 LEFT JOIN civilio.choices mha ON mha."group" = 'airesante' AND
																								mha.name =
																								c.as_rattachement::TEXT AND
																								mha.version = 'fosa' AND
																								mha.parent = c.ds_rattachement::TEXT
							 LEFT JOIN civilio.choices ml
												 ON ml."group" = 'vb2qk85' AND
														ml.name = c.milieu::TEXT AND ml.version = 'fosa'
							 LEFT JOIN civilio.choices mu_div
												 ON mu_div."group" = 'division' AND
														mu_div.name = c.q1_02_division::TEXT AND
														mu_div.version = 'fosa'
							 LEFT JOIN civilio.choices mu_ch
												 ON mu_ch."group" = 'commune' AND
														mu_ch.name = c.q1_03_municipality::TEXT AND
														mu_ch.version = 'fosa' AND
														mu_ch.parent = c.q1_02_division::TEXT
				UNION
				SELECT c._index,
							 'chefferie'::civilio.form_types             as form,
							 c.q1_12_officename                          as facility_name,
							 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
							 c.q1_13_gps_coordinates                     as gps_coordinates,
							 COALESCE(c._validation_status = 'validation_status_approved',
												false)                             as validated,
							 jsonb_build_object(
								 'degree', c_deg.label,
								 'equipment', (COALESCE(c.q9_02_computers, 0) +
															 COALESCE(c.q9_03_printers, 0) +
															 COALESCE(c.q9_04_tablets, 0) +
															 COALESCE(c.q9_10_car, 0) +
															 COALESCE(c.q9_11_mopeds, 0)),
								 'has_internet', COALESCE(
									 c.q4_02_broadband_conn_available::DOUBLE PRECISION::INTEGER =
									 1, false),
								 'has_water', COALESCE(
									 c.q6_09aalimentation_eau::DOUBLE PRECISION::INTEGER = 1,
									 false),
								 'has_power',
								 COALESCE(c.q4_04_electricite::DOUBLE PRECISION::INTEGER = 1,
													false),
								 'employee_count', employee_count
							 )                                           AS extra_info,
							 c.q0_06_date_creation                       AS created_at
				FROM chefferie.data c
							 LEFT JOIN (SELECT _parent_index, COUNT(*) AS employee_count
													FROM chefferie.data_personnel
													GROUP BY _parent_index) em_counts
												 ON em_counts._parent_index = c._index
							 LEFT JOIN civilio.choices c_deg
												 ON c_deg."group" = 'vb2qk85' AND
														c_deg.name = c.degre::TEXT AND
														c_deg.version = 'chefferie'
							 LEFT JOIN civilio.choices mu_div
												 ON mu_div."group" = 'division' AND
														mu_div.name = c.q1_02_division::TEXT AND
														mu_div.version = 'chefferie'
							 LEFT JOIN civilio.choices mu_ch
												 ON mu_ch."group" = 'commune' AND
														mu_ch.name = c.q1_03_municipality::TEXT AND
														mu_ch.version = 'chefferie' AND
														mu_ch.parent = c.q1_02_division::TEXT) AS info
`);

export const forms = civilio.table('forms', {
	id: uuid().defaultRandom().primaryKey(),
	description: text(),
	createdAt: timestamp({ mode: 'date' })
})
