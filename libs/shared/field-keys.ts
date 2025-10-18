import z from "zod";

export namespace PersonnelInfo {
	export const PERSONNEL_NAME = "data_personnel.columns.name.title";
	export const PERSONNEL_POSITION = "data_personnel.columns.role.title";
	export const PERSONNEL_GENDER = "data_personnel.columns.gender.title";
	export const PERSONNEL_PHONE = "data_personnel.columns.phone.title";
	export const PERSONNEL_EMAIL = "data_personnel.columns.email.title";
	export const PERSONNEL_AGE = "data_personnel.columns.age.title";
	export const PERSONNEL_CS_TRAINING = "data_personnel.columns.has_cs_training.title";
	export const PERSONNEL_ED_LEVEL = "data_personnel.columns.education_level.title";
	export const PERSONNEL_COMPUTER_LEVEL = "data_personnel.columns.pc_knowledge.title";
	export const PERSONNEL_STATUS = "data_personnel.columns.status.title";
	export const ALL_FIELDS = [
		PERSONNEL_NAME,
		PERSONNEL_PHONE,
		PERSONNEL_AGE,
		PERSONNEL_GENDER,
		PERSONNEL_EMAIL,
		PERSONNEL_COMPUTER_LEVEL,
		PERSONNEL_STATUS,
		PERSONNEL_CS_TRAINING,
		PERSONNEL_ED_LEVEL,
		PERSONNEL_POSITION,
	]
}

export namespace Fosa {
	export const SectionKeysSchema = z.enum([
		'fosa.form.sections.respondent',
		'fosa.form.sections.identification',
		'fosa.form.sections.reg_cs_events',
		'fosa.form.sections.stats',
		'fosa.form.sections.stats.line_1',
		'fosa.form.sections.stats.line_2',
		'fosa.form.sections.stats.line_3',
		'fosa.form.sections.stats.line_4',
		'fosa.form.sections.stats.line_5',
		'fosa.form.sections.infra',
		'fosa.form.sections.infra.sections.eq',
		'fosa.form.sections.extras',
		'fosa.form.sections.staff',
		'fosa.form.sections.staff.sections.employees'
	]);
	export const ServiceFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['fosa.form.sections.reg_cs_events']),
		'.fields.',
		z.enum([
			'uses_dhis2_form',
			'dhis2_usage',
			'uses_bunec_birth_form',
			'dhis2_form_training',
			'birth_declaration_transmission_to_csc',
			'csc_event_reg_type',
			'has_toilet',
			'has_eneo_connection',
			'has_backup_power_source',
			'backup_power_sources',
			'has_internet',
			'has_water_sources',
			'environment_type'
		])]);
	export const RespondentFieldKeysSchema = z.templateLiteral([SectionKeysSchema.extract(['fosa.form.sections.respondent']), '.fields.', z.enum([
		'device',
		'email',
		'phone',
		'position',
		'names',
		'knows_creation_date',
		'creation_date'
	])]);
	export const MetaFieldKeysSchema = z.templateLiteral(['fosa.form.fields', '.', z.enum([
		'index',
		'validation_code'
	])]);
	export const IdentificationFieldKeysSchema = z.templateLiteral([SectionKeysSchema.extract(['fosa.form.sections.identification']), '.fields', '.', z.enum([
		'division',
		'municipality',
		'quarter',
		'locality',
		'facility_name',
		'district',
		'milieu',
		'other_category',
		'category',
		'status',
		'health_area',
		'has_maternity',
		'attached_cs',
		'cs_proximity',
		'knows_gps_coords',
		'gps_coords'
	])]);
	export const StatsFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['fosa.form.sections.stats.line_1']),
			'.fields.',
			z.enum([
				'stats_year_1',
				'stats_births_1',
				'stats_deaths_1',
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['fosa.form.sections.stats.line_2']),
			'.fields.',
			z.enum([
				'stats_year_2',
				'stats_births_2',
				'stats_deaths_2',
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['fosa.form.sections.stats.line_3']),
			'.fields.',
			z.enum([
				'stats_year_3',
				'stats_births_3',
				'stats_deaths_3',
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['fosa.form.sections.stats.line_4']),
			'.fields.',
			z.enum([
				'stats_year_4',
				'stats_births_4',
				'stats_deaths_4',
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['fosa.form.sections.stats.line_5']),
			'.fields.',
			z.enum([
				'stats_year_5',
				'stats_births_5',
				'stats_deaths_5',
			])
		])
	]);
	export const InfrastructureFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['fosa.form.sections.infra']),
			'.fields.',
			z.enum([
				'toilet_present',
				'eneo_connection',
				'backup_power_available',
				'backup_power',
				'has_internet',
				'water_source_available',
				'water_sources',
			])
		])
	]);

	export const EquipmentFieldKeySchema = z.templateLiteral([
		SectionKeysSchema.extract(['fosa.form.sections.infra.sections.eq']),
		'.fields.',
		z.enum([
			'pc_count',
			'printer_count',
			'car_count',
			'tablet_count',
			'bike_count'
		])
	]);

	export const StaffFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['fosa.form.sections.staff']),
			'.fields.',
			z.enum([
				'employee_count'
			])
		]),
		z.union([
			SectionKeysSchema.extract(['fosa.form.sections.staff.sections.employees']),
			z.templateLiteral([
				SectionKeysSchema.extract(['fosa.form.sections.staff.sections.employees']),
				'.fields.',
				z.enum([
					'index',
					'names',
					'position',
					'gender',
					'phone',
					'age',
					'has_cs_training',
					'ed_level',
					'computer_level'
				])
			])
		])
	])

	export const CommentsFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['fosa.form.sections.extras']),
		'.fields.',
		z.enum([
			'relevant_info'
		])
	]);
}
export namespace Chiefdom {
	export const RESPONDENT_NAME = "chefferie.form.fields.names.title";
	export const POSITION = "chefferie.form.fields.position.title";
	export const PHONE = "chefferie.form.fields.phone.title";
	export const EMAIL = "chefferie.form.fields.email.title";
	export const CREATION_DATE = "chefferie.form.fields.creation_date.title";
	export const DIVISION = "chefferie.form.fields.department.title";
	export const MUNICIPALITY = "chefferie.form.fields.communes.title";
	export const QUARTER = "chefferie.form.fields.quarter.title";
	export const FACILITY_NAME = "chefferie.form.fields.facility_name.title";
	export const CLASSIFICATION = "chefferie.form.fields.classification.title";
	export const HEALTH_CENTER_PROXIMITY = "chefferie.form.fields.distance.title";
	export const GPS_COORDS = "chefferie.form.sections.geo_point.title";
	export const CS_OFFICER_TRAINED = "chefferie.form.fields.training.title";
	export const WAITING_ROOM = "chefferie.form.fields.waiting_room.title";
	export const OTHER_WAITING_ROOM = "chefferie.form.fields.other_waiting_room.title";
	export const IS_CHIEF_CS_OFFICER = "chefferie.form.fields.cs_actor_is_chief.title";
	export const CHIEF_OATH = "chefferie.form.fields.oath.title";
	export const CS_REG_LOCATION = "chefferie.form.fields.cs_reg_location.title";
	export const OTHER_CS_REG_LOCATION = "chefferie.form.fields.other_cs_reg_location.title";
	export const TOILETS_ACCESSIBLE = "chefferie.form.fields.toilets_accessible.title";
	export const PC_COUNT = "chefferie.form.fields.equipment_quantity.computers";
	export const PRINTER_COUNT = "chefferie.form.fields.equipment_quantity.printers";
	export const TABLET_COUNT = "chefferie.form.fields.equipment_quantity.tablets";
	export const CAR_COUNT = "chefferie.form.fields.equipment_quantity.cars";
	export const BIKE_COUNT = "chefferie.form.fields.equipment_quantity.motorcycles";
	export const IS_CHIEFDOM_CHIEF_RESIDENCE = "chefferie.form.fields.structure.title";
	export const HAS_INTERNET = "chefferie.form.fields.connexion.title";
	export const INTERNET_TYPE = "chefferie.form.fields.typeConnexion.title";
	export const OTHER_INTERNET_TYPE = "chefferie.form.fields.other_internet_type.title";
	export const HAS_ENEO_CONNECTION = "chefferie.form.fields.eneoConnexion.title";
	export const WATER_ACCESS = "chefferie.form.fields.waterAcces.title";
	export const WATER_SOURCES = "chefferie.form.fields.waterType.title";
	export const OTHER_WATER_SOURCE = "chefferie.form.fields.other_water_source.title";
	export const HAS_EXTINGUISHER = "chefferie.form.fields.extinguisher.title";
	export const EMPLOYEE_COUNT = "chefferie.form.fields.employer.title";
	export const EXTRA_INFO = "chefferie.form.fields.extra_info.title";
	export const INDEX = "chefferie.form.fields.index";
	export const VALIDATION_CODE = "chefferie.form.fields.validation_code";
	export const STAFF_INFO_FIELDS = [
		PersonnelInfo.PERSONNEL_NAME,
		PersonnelInfo.PERSONNEL_POSITION,
		PersonnelInfo.PERSONNEL_GENDER,
		PersonnelInfo.PERSONNEL_PHONE,
		PersonnelInfo.PERSONNEL_AGE,
		PersonnelInfo.PERSONNEL_CS_TRAINING,
		PersonnelInfo.PERSONNEL_ED_LEVEL,
		PersonnelInfo.PERSONNEL_COMPUTER_LEVEL,
	];
	export const ALL_FIELDS = [
		RESPONDENT_NAME,
		POSITION,
		PHONE,
		EMAIL,
		CREATION_DATE,
		DIVISION,
		MUNICIPALITY,
		QUARTER,
		FACILITY_NAME,
		CLASSIFICATION,
		HEALTH_CENTER_PROXIMITY,
		GPS_COORDS,
		CS_OFFICER_TRAINED,
		WAITING_ROOM,
		OTHER_WAITING_ROOM,
		IS_CHIEF_CS_OFFICER,
		CHIEF_OATH,
		CS_REG_LOCATION,
		OTHER_CS_REG_LOCATION,
		TOILETS_ACCESSIBLE,
		PC_COUNT,
		PRINTER_COUNT,
		TABLET_COUNT,
		CAR_COUNT,
		BIKE_COUNT,
		IS_CHIEFDOM_CHIEF_RESIDENCE,
		HAS_INTERNET,
		INTERNET_TYPE,
		OTHER_INTERNET_TYPE,
		HAS_ENEO_CONNECTION,
		WATER_ACCESS,
		WATER_SOURCES,
		OTHER_WATER_SOURCE,
		HAS_EXTINGUISHER,
		EMPLOYEE_COUNT,
		EXTRA_INFO,
		INDEX,
		VALIDATION_CODE,
		...STAFF_INFO_FIELDS
	];
	export const TRACKABLE_FIELDS = [
		RESPONDENT_NAME,
		POSITION,
		PHONE,
		EMAIL,
		CREATION_DATE,
		DIVISION,
		MUNICIPALITY,
		QUARTER,
		FACILITY_NAME,
		CLASSIFICATION,
		HEALTH_CENTER_PROXIMITY,
		GPS_COORDS,
		CS_OFFICER_TRAINED,
		WAITING_ROOM,
		OTHER_WAITING_ROOM,
		IS_CHIEF_CS_OFFICER,
		CHIEF_OATH,
		CS_REG_LOCATION,
		OTHER_CS_REG_LOCATION,
		TOILETS_ACCESSIBLE,
		PC_COUNT,
		PRINTER_COUNT,
		TABLET_COUNT,
		CAR_COUNT,
		BIKE_COUNT,
		IS_CHIEFDOM_CHIEF_RESIDENCE,
		HAS_INTERNET,
		INTERNET_TYPE,
		OTHER_INTERNET_TYPE,
		HAS_ENEO_CONNECTION,
		WATER_ACCESS,
		WATER_SOURCES,
		OTHER_WATER_SOURCE,
		HAS_EXTINGUISHER,
		EMPLOYEE_COUNT,
		EXTRA_INFO,
		INDEX,
		VALIDATION_CODE,
		...STAFF_INFO_FIELDS
	];
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
		'csc.form.sections.record_indexing',
		"csc.form.sections.record_procurement",
		"csc.form.sections.financial_stats",
		"csc.form.sections.archving_function",
		"csc.form.sections.archving_function.sections.general",
		"csc.form.sections.archving_function.sections.archive_stats",
		"csc.form.sections.deeds",
		"csc.form.sections.employees",
		"csc.form.sections.employees.sections.general",
		"csc.form.sections.employees.sections.officers",
		"csc.form.sections.extra"
	]);

	export const MetaFieldKeysSchema = z.templateLiteral([
		'csc.form.fields', '.', z.enum([
			'index'
		])
	])

	export const EmployeeFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.employees.sections.officers']),
			'.fields.',
			z.enum([
				'name',
				'position',
				'other_position',
				'prof_status',
				'other_prof_status',
				'gender',
				'phone',
				'age',
				'email',
				'ed_level',
				'computer_level',
				'ec_training',
				'archive_training',
				'computer_training',
				'cs_seniority',
				'monthly_salary'
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.employees.sections.general']),
			'.fields.',
			z.enum([
				'male_count',
				'female_count',
				'non_officer_male_count',
				'non_officer_female_count',
				'has_ec_training',
				'has_computer_training',
				'has_archiving_training',
				'monthly_salary'
			])
		])
	]);

	export const DeedsFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.deeds']),
		'.fields.',
		z.enum([
			'year',
			'birth_certs_drawn',
			'birth_certs_not_drawn',
			'marriage_certs_drawn',
			'marriage_certs_not_drawn',
			'death_certs_drawn',
			'death_certs_not_drawn'
		])
	]);

	export const ExtrasFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.extra']),
		'.fields.',
		z.enum([
			'relevant_info',
			'validation_code'
		])
	]);

	export const ArchivingFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.archving_function.sections.general']),
			'.fields.',
			z.enum([
				'has_archiving_room',
				'archive_room_electric_condition',
				'has_fire_extinguisher',
				'locked_door',
				'is_archive_room_access_limited',
				'room_has_humidity',
				'register_archiving_type',
				'other_archiving_type',
				'has_written_archiving_plan',
				'are_registers_deposited',
				'are_registers_deposited_systematically',
				'is_vandalized',
				'vandalization_date'
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.archving_function.sections.archive_stats']),
			'.fields.',
			z.enum([
				'year',
				'birth_count',
				'marriage_count',
				'death_count'
			])
		])
	]);

	export const FinancialStatsFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.financial_stats']),
		'.fields.',
		z.enum([
			'birth_cert_cost',
			'birth_cert_copy_cost',
			'marriage_cert_copy_cost',
			'death_cert_copy_cost',
			'celibacy_cert_copy_cost',
			'non_registerd_certs',
			'rates_under_deliberation',
			'prices_displayed',
			'municipality_budget_2024',
			'cs_budget_2024'
		])
	])

	export const RecordProcurementFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.record_procurement']),
		'.fields.',
		z.enum([
			'has_there_been_lack_off_registers',
			'records_provider',
			'other_records_provider',
			'uses_non_compliant_reigsters',
			'blank_registers_count',
			'blank_marriages',
			'blank_births',
			'blank_deaths'
		])
	])

	export const RecordIndexingFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.record_indexing']),
		'.fields.',
		z.enum([
			'records_scanned',
			'staff_trained',
			'document_scan_start_date',
			'data_indexed',
			'marriages_indexed',
			'deaths_indexed',
			'births_indexed',
			'marriages_scanned',
			'births_scanned',
			'deaths_scanned',
			'is_data_used_by_csc',
			'data_usage'
		])
	])

	export const DigitizationFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.digitization']),
		'.fields.',
		z.enum([
			'external_service_from_cr',
			'external_cr_uses_internet',
			'has_cs_software',
			'cs_software_name',
			'cs_software_license_sponsor',
			'other_cs_software_license_sponsor',
			'users_receive_digital_acts',
			'software_activation-date',
			'software_feedback',
			'software_trained_user_count',
			'software_recorded_marriage_count',
			'software_recorded_births_count',
			'software_recorded_death_count',
			'is_software_functioning',
			'software_non_functioning_reason'
		])
	])

	export const EquipmentFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.equipment']),
		'.fields.',
		z.enum([
			'pc_count',
			'server_count',
			'printer_count',
			'scanner_count',
			'inverter_count',
			'ac_count',
			'fan_count',
			'projector_count',
			'office_table_count',
			'chair_count',
			'bike_count',
			'tablet_count'
		])
	])

	export const AreaFieldKeysSchema = z.union([
		SectionKeysSchema.extract(['csc.form.sections.areas.sections.rooms']),
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.areas.sections.rooms']),
			'.fields.',
			z.enum([
				'index',
				'number',
				'name',
				'condition',
				'area',
				'renovation_nature',
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.areas.sections.general']),
			'.fields.',
			z.enum([
				// 'office_count',
				'dedicated_cs_rooms',
				'moving_plans'
			])
		])
	])

	export const InfrastructureFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.infra']),
		'.fields.',
		z.enum([
			'status',
			'other_building',
			'eneo_connection',
			'has_power_outages',
			'has_stable_power',
			'has_backup_power',
			'backup_power_sources',
			'other_power_source',
			'water_sources',
			'toilets_available',
			'are_toilets_separated',
			'network_type',
			'has_fiber_connection',
			'other_network_type',
			'has_internet',
			'internet_type',
			'other_internet_type',
			'internet_sponsor'
		])
	])

	export const AccessibilityFieldKeysSchema = z.union([
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.accessibility.sections.villages'])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.accessibility.sections.villages']),
			'.fields.',
			z.enum([
				'index',
				'name',
				'avg_dist',
				'obsvervations'
			])
		]),
		z.templateLiteral([
			SectionKeysSchema.extract(['csc.form.sections.accessibility.sections.general']),
			'.fields.',
			z.enum([
				'serving_roads',
				'has_obstacles',
				'is_road_degradable',
				'attached_villages_count',
				'cover_radius'
			])
		]),

	])

	export const IdentificationFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.identification']),
		'.fields.',
		z.enum([
			'division',
			'municipality',
			'quarter',
			'facility_name',
			'category',
			'is_chiefdom',
			'degree',
			'size',
			'milieu',
			'attached_csc_count',
			'is_functional',
			'non_function_reason',
			'custom_non_function_reason',
			'non_function_duration',
			'csc_creation_declaration',
			'is_officer_appointed',
			'officer_declaration',
			'photo',
			'gps_coords'
		])
	])
	export const RespondentFieldKeysSchema = z.templateLiteral([
		SectionKeysSchema.extract(['csc.form.sections.respondent']),
		'.fields.',
		z.enum([
			'names',
			'position',
			'phone',
			'email',
			'knows_creation_date',
			'creation_date'
		])
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
	Fosa.StaffFieldKeysSchema
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
	CSC.RecordIndexingFieldKeysSchema
]);

export const FieldKeySchema = z.union([
	FosaFieldKeySchema,
	CSCFieldKeySchema
]);
export const AllSectionKeysSchema = z.union([
	Fosa.SectionKeysSchema,
	CSC.SectionKeysSchema
]);
export type FosaFieldKey = z.output<typeof FosaFieldKeySchema>;
export type FieldKey = z.output<typeof FieldKeySchema>;
export type FormSectionKeys = z.output<typeof AllSectionKeysSchema>;
