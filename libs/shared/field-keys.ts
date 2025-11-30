import z from "zod";

export namespace Fosa {
	export const SectionKeysSchema = z.enum([
		"fosa.form.sections.respondent",
		"fosa.form.sections.identification",
		"fosa.form.sections.reg_cs_events",
		"fosa.form.sections.stats",
		"fosa.form.sections.stats.line_1",
		"fosa.form.sections.stats.line_2",
		"fosa.form.sections.stats.line_3",
		"fosa.form.sections.stats.line_4",
		"fosa.form.sections.stats.line_5",
		"fosa.form.sections.infra",
		"fosa.form.sections.infra.sections.eq",
		"fosa.form.sections.extras",
		"fosa.form.sections.staff",
		"fosa.form.sections.staff.sections.employees",
	]);
	export const ServiceFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["fosa.form.sections.reg_cs_events"]),
		".fields.",
		z.enum([
			"uses_dhis2_form",
			"dhis2_usage",
			"uses_bunec_birth_form",
			"dhis2_form_training",
			"birth_declaration_transmission_to_csc",
			"csc_event_reg_type",
			"has_toilet",
			"has_eneo_connection",
			"has_backup_power_source",
			"backup_power_sources",
			"has_internet",
			"has_water_sources",
			"environment_type",
		]),
	]);
	export const RespondentFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["fosa.form.sections.respondent"]),
		".fields.",
		z.enum([
			"device",
			"email",
			"phone",
			"position",
			"names",
			"knows_creation_date",
			"creation_date",
		]),
	]);
	export const MetaFieldKeysSchema = z.templateLiteral([
		"fosa.form.fields",
		".",
		z.enum(["index", "validation_code"]),
	]);
	export const IdentificationFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["fosa.form.sections.identification"]),
		".fields",
		".",
		z.enum([
			"division",
			"municipality",
			"quarter",
			"locality",
			"facility_name",
			"district",
			"milieu",
			"other_category",
			"category",
			"status",
			"health_area",
			"has_maternity",
			"attached_cs",
			"cs_proximity",
			"knows_gps_coords",
			"gps_coords",
		]),
	]);
	export const StatsFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(["fosa.form.sections.stats.line_1"]),
			".fields.",
			z.enum(["stats_year_1", "stats_births_1", "stats_deaths_1"]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(["fosa.form.sections.stats.line_2"]),
			".fields.",
			z.enum(["stats_year_2", "stats_births_2", "stats_deaths_2"]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(["fosa.form.sections.stats.line_3"]),
			".fields.",
			z.enum(["stats_year_3", "stats_births_3", "stats_deaths_3"]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(["fosa.form.sections.stats.line_4"]),
			".fields.",
			z.enum(["stats_year_4", "stats_births_4", "stats_deaths_4"]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(["fosa.form.sections.stats.line_5"]),
			".fields.",
			z.enum(["stats_year_5", "stats_births_5", "stats_deaths_5"]),
		]),
	]);
	export const InfrastructureFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(["fosa.form.sections.infra"]),
			".fields.",
			z.enum([
				"toilet_present",
				"eneo_connection",
				"backup_power_available",
				"backup_power",
				"has_internet",
				"water_source_available",
				"water_sources",
			]),
		]),
	]);

	export const EquipmentFieldKeySchema = z.templateLiteral([
		SectionKeysSchema.extract(["fosa.form.sections.infra.sections.eq"]),
		".fields.",
		z.enum([
			"pc_count",
			"printer_count",
			"car_count",
			"tablet_count",
			"bike_count",
		]),
	]);

	export const StaffFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(["fosa.form.sections.staff"]),
			".fields.",
			z.enum(["employee_count"]),
		]),
		z.union([
			SectionKeysSchema.extract([
				"fosa.form.sections.staff.sections.employees",
			]),
			z.templateLiteral([
				SectionKeysSchema.extract([
					"fosa.form.sections.staff.sections.employees",
				]),
				".fields.",
				z.enum([
					"index",
					"names",
					"position",
					"gender",
					"phone",
					"age",
					"has_cs_training",
					"ed_level",
					"computer_level",
				]),
			]),
		]),
	]);

	export const CommentsFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["fosa.form.sections.extras"]),
		".fields.",
		z.enum(["relevant_info"]),
	]);
}
export namespace Chiefdom {
	export const SectionKeysSchema = z.enum([
		'chefferie.form.sections.respondent',
		'chefferie.form.sections.identification',
		'chefferie.form.sections.services',
		'chefferie.form.sections.services.sections.general',
		'chefferie.form.sections.services.sections.equipment',
		'chefferie.form.sections.infra',
		'chefferie.form.sections.personnel_status',
		'chefferie.form.sections.personnel_status.general',
		'chefferie.form.sections.personnel_status.employees',
		'chefferie.form.sections.comments'
	]);
	export const CommentsKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['chefferie.form.sections.comments']),
		'.fields.',
		z.enum([
			'relevant_info',
			'validation_code'
		])
	]);
	export const PersonnelStatusKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['chefferie.form.sections.personnel_status.general']),
			'.fields.',
			z.enum([
				'employee_count'
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['chefferie.form.sections.personnel_status.employees']),
			'.fields.',
			z.enum([
				'index',
				'name',
				'position',
				'gender',
				'phone',
				'age',
				'has_cs_training',
				'ed_level',
				'computer_level',
				'list'
			])
		])
	])
	export const InfrastructureKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['chefferie.form.sections.infra']),
		'.fields.',
		z.enum([
			'is_residence',
			'has_internet',
			'conn_type',
			'other_conn_type',
			'has_power',
			'power_source',
			'has_water_source',
			'water_sources',
			'other_water_source',
			'has_fire_extinguisher'
		])
	])
	export const ServicesKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['chefferie.form.sections.services.sections.general']),
			'.fields.',
			z.enum([
				'is_chief_officer',
				'is_oath_taken',
				'records_location',
				'other_records_location',
				'officer_trained_cs',
				'has_waiting_room',
				'toilets_accessible',
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['chefferie.form.sections.services.sections.equipment']),
			'.fields.',
			z.enum([
				'pc_count',
				'printer_count',
				'tablet_count',
				'car_count',
				'bike_count',
			])
		])
	])
	export const IdentificationFieldKeys = z.templateLiteral([
		SectionKeysSchema.extract(['chefferie.form.sections.identification']),
		'.fields.',
		z.enum([
			'division',
			'municipality',
			'quarter',
			'facility_name',
			'degree',
			'cs_proximity',
			'gps_coords'
		])
	])
	export const RespondentFieldKeys = z.templateLiteral([
		SectionKeysSchema.extract(['chefferie.form.sections.respondent']),
		'.fields.',
		z.enum([
			'name',
			'position',
			'phone',
			'email',
			'creation_date'
		])
	]);
}

export namespace CSC {
	export const SectionKeysSchema = z.enum([
		"csc.form.sections.respondent",
		"csc.form.sections.identification",
		"csc.form.sections.accessibility",
		"csc.form.sections.accessibility.sections.general",
		"csc.form.sections.accessibility.sections.villages",
		"csc.form.sections.infra",
		"csc.form.sections.areas",
		"csc.form.sections.areas.sections.general",
		"csc.form.sections.areas.sections.rooms",
		"csc.form.sections.equipment",
		"csc.form.sections.digitization",
		"csc.form.sections.record_indexing",
		"csc.form.sections.record_procurement",
		"csc.form.sections.financial_stats",
		"csc.form.sections.archiving_function",
		"csc.form.sections.archiving_function.sections.general",
		"csc.form.sections.archiving_function.sections.archive_stats",
		"csc.form.sections.deeds",
		"csc.form.sections.employees",
		"csc.form.sections.employees.sections.general",
		"csc.form.sections.employees.sections.officers",
		"csc.form.sections.extra",
	]);

	export const MetaFieldKeysSchema = z.templateLiteral([
		"csc.form.fields",
		".",
		z.enum(["index"]),
	]);

	export const EmployeeFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract([
				"csc.form.sections.employees.sections.officers",
			]),
			".fields.",
			z.enum([
				'index',
				'list',
				"name",
				"position",
				"other_position",
				"prof_status",
				"other_prof_status",
				"gender",
				"phone",
				"age",
				"email",
				"ed_level",
				"computer_level",
				"ec_training",
				"archive_training",
				"computer_training",
				"cs_seniority",
				"monthly_salary",
			]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract([
				"csc.form.sections.employees.sections.general",
			]),
			".fields.",
			z.enum([
				"male_count",
				"female_count",
				"non_officer_male_count",
				"non_officer_female_count",
				"has_ec_training",
				"has_computer_training",
				"has_archiving_training",
				"monthly_salary",
			]),
		]),
	]);

	export const DeedsFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.deeds"]),
		".fields.",
		z.enum([
			"year",
			'list',
			'index',
			"birth_certs_drawn",
			"birth_certs_not_withdrawn",
			"marriage_certs_drawn",
			"marriage_certs_not_withdrawn",
			"death_certs_drawn",
			"death_certs_not_withdrawn",
		]),
	]);

	export const ExtrasFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.extra"]),
		".fields.",
		z.enum(["relevant_info", "validation_code"]),
	]);

	export const ArchivingFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract([
				"csc.form.sections.archiving_function.sections.general",
			]),
			".fields.",
			z.enum([
				"has_archiving_room",
				"archive_room_electric_condition",
				"has_fire_extinguisher",
				"locked_door",
				"is_archive_room_access_limited",
				"room_has_humidity",
				"register_archiving_type",
				"other_archiving_type",
				"has_written_archiving_plan",
				"are_registers_deposited",
				"are_registers_deposited_systematically",
				"is_vandalized",
				"vandalization_date",
			]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract([
				"csc.form.sections.archiving_function.sections.archive_stats",
			]),
			".fields.",
			z.enum([
				"year",
				"list",
				"index",
				"birth_count",
				"marriage_count",
				"death_count",
			]),
		]),
	]);

	export const FinancialStatsFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.financial_stats"]),
		".fields.",
		z.enum([
			"birth_cert_cost",
			"birth_cert_copy_cost",
			"marriage_cert_copy_cost",
			"death_cert_copy_cost",
			"celibacy_cert_copy_cost",
			"non_registered_certs",
			"rates_under_deliberation",
			"prices_displayed",
			"municipality_budget_2024",
			"cs_budget_2024",
		]),
	]);

	export const RecordProcurementFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.record_procurement"]),
		".fields.",
		z.enum([
			"has_there_been_lack_off_registers",
			"records_provider",
			"other_records_provider",
			"uses_non_compliant_reigsters",
			"blank_registers_count",
			"blank_marriages",
			"blank_births",
			"blank_deaths",
		]),
	]);

	export const RecordIndexingFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.record_indexing"]),
		".fields.",
		z.enum([
			"records_scanned",
			"staff_trained",
			"document_scan_start_date",
			"data_indexed",
			"marriages_indexed",
			"deaths_indexed",
			"births_indexed",
			"marriages_scanned",
			"births_scanned",
			"deaths_scanned",
			"is_data_used_by_csc",
			"data_usage",
		]),
	]);

	export const DigitizationFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.digitization"]),
		".fields.",
		z.enum([
			"external_service_from_cr",
			"external_cr_uses_internet",
			"has_cs_software",
			"cs_software_name",
			"cs_software_license_sponsor",
			"other_cs_software_license_sponsor",
			"users_receive_digital_acts",
			"software_activation_date",
			"software_feedback",
			"software_trained_user_count",
			"software_recorded_marriage_count",
			"software_recorded_births_count",
			"software_recorded_death_count",
			"is_software_functioning",
			"software_non_functioning_reason",
		]),
	]);

	export const EquipmentFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.equipment"]),
		".fields.",
		z.enum([
			"pc_count",
			"server_count",
			"printer_count",
			"scanner_count",
			"inverter_count",
			"ac_count",
			"fan_count",
			"car_count",
			"projector_count",
			"office_table_count",
			"chair_count",
			"bike_count",
			"tablet_count",
		]),
	]);

	export const AreaFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(["csc.form.sections.areas.sections.rooms"]),
			".fields.",
			z.enum([
				"index",
				"list",
				"number",
				"name",
				"condition",
				"area",
				"renovation_nature",
			]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(["csc.form.sections.areas.sections.general"]),
			".fields.",
			z.enum([
				// 'office_count',
				"dedicated_cs_rooms",
				"moving_plans",
			]),
		]),
	]);

	export const InfrastructureFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.infra"]),
		".fields.",
		z.enum([
			"status",
			"other_building",
			"eneo_connection",
			"has_power_outages",
			"has_stable_power",
			"has_backup_power",
			"backup_power_sources",
			"other_power_source",
			"water_sources",
			"toilets_available",
			"are_toilets_separated",
			"network_type",
			"has_fiber_connection",
			"other_network_type",
			"has_internet",
			"internet_type",
			"other_internet_type",
			"internet_sponsor",
		]),
	]);

	export const AccessibilityFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract([
				"csc.form.sections.accessibility.sections.villages",
			]),
			".fields.",
			z.enum(["index", "name", "avg_dist", "list", "observations"]),
		]),
		z.templateLiteral([
			SectionKeysSchema.extract([
				"csc.form.sections.accessibility.sections.general",
			]),
			".fields.",
			z.enum([
				"serving_roads",
				"has_obstacles",
				"is_road_degradable",
				"attached_villages_count",
				"cover_radius",
			]),
		]),
	]);

	export const IdentificationFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.identification"]),
		".fields.",
		z.enum([
			"division",
			"municipality",
			"quarter",
			"facility_name",
			"category",
			"is_chiefdom",
			"degree",
			"size",
			"milieu",
			"attached_csc_count",
			"is_functional",
			"non_function_reason",
			"custom_non_function_reason",
			"non_function_duration",
			"csc_creation_declaration",
			"is_officer_appointed",
			"officer_declaration",
			"photo",
			"gps_coords",
		]),
	]);
	export const RespondentFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(["csc.form.sections.respondent"]),
		".fields.",
		z.enum([
			"names",
			"position",
			"phone",
			"email",
			"knows_creation_date",
			"creation_date",
		]),
	]);
}

export const FosaFieldKeySchema = z.union([
	Fosa.RespondentFieldKeysSchema,
	Fosa.IdentificationFieldKeysSchema,
	Fosa.ServiceFieldKeysSchema,
	Fosa.MetaFieldKeysSchema,
	Fosa.StatsFieldKeysSchema,
	Fosa.InfrastructureFieldKeysSchema,
	Fosa.EquipmentFieldKeySchema,
	Fosa.CommentsFieldKeysSchema,
	Fosa.StaffFieldKeysSchema,
]);

export const CSCFieldKeySchema = z.union([
	CSC.RespondentFieldKeysSchema,
	CSC.IdentificationFieldKeysSchema,
	CSC.AccessibilityFieldKeysSchema,
	CSC.AreaFieldKeysSchema,
	CSC.InfrastructureFieldKeysSchema,
	CSC.EquipmentFieldKeysSchema,
	CSC.DigitizationFieldKeysSchema,
	CSC.RecordProcurementFieldKeysSchema,
	CSC.FinancialStatsFieldKeysSchema,
	CSC.ArchivingFieldKeysSchema,
	CSC.ExtrasFieldKeysSchema,
	CSC.DeedsFieldKeysSchema,
	CSC.EmployeeFieldKeysSchema,
	CSC.MetaFieldKeysSchema,
	CSC.RecordIndexingFieldKeysSchema,
]);

export const ChefferieKeySchema = z.union([
	Chiefdom.IdentificationFieldKeys,
	Chiefdom.ServicesKeysSchema,
	Chiefdom.RespondentFieldKeys,
	Chiefdom.CommentsKeysSchema,
	Chiefdom.PersonnelStatusKeysSchema,
	Chiefdom.InfrastructureKeysSchema,
])

export const FieldKeySchema = z.union([FosaFieldKeySchema, CSCFieldKeySchema, ChefferieKeySchema]);
export const AllSectionKeysSchema = z.union([
	Fosa.SectionKeysSchema,
	CSC.SectionKeysSchema,
	Chiefdom.SectionKeysSchema
]);
export type FieldKey = z.output<typeof FieldKeySchema>;
export type FormSectionKey = z.output<typeof AllSectionKeysSchema>;
