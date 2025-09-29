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
    z.templateLiteral([
      SectionKeysSchema.extract(['fosa.form.sections.staff.sections.employees']),
      '.fields.',
      z.enum([
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

  export const CommentsFieldKeysSchema = z.templateLiteral([
    SectionKeysSchema.extract(['fosa.form.sections.extras']),
    '.fields.',
    z.enum([
      'relevant_info'
    ])
  ])
  const STAFF_INFO_FIELDS = [
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
    ...STAFF_INFO_FIELDS
  ] as const;

  export const TRACKABLE_FIELDS = ALL_FIELDS;
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
  export const INDEX = 'csc.form.fields.index.title';
  export const VALIDATION_CODE = 'csc.form.fields.validation_code.title';

  export namespace StaffInfo {
    export const MALE_COUNT = "csc.form.sections.personnel_info.fields.male_count.title";
    export const FEMALE_COUNT = "csc.form.sections.personnel_info.fields.female_count.title";
    export const NON_OFFICER_MALE_COUNT = "csc.form.sections.personnel_info.fields.non_officer_male_count.title";
    export const NON_OFFICER_FEMALE_COUNT = "csc.form.sections.personnel_info.fields.non_officer_female_count.title";
    export const HAS_EC_TRAINING = "data_personnel.columns.ec_training.title";
    export const HAS_COMPUTER_TRAINING = "data_personnel.columns.has_pc_training.title";
    export const HAS_ARCHIVING_TRAINING = "data_personnel.columns.archiving_training.title";
    export const MONTHLY_SALARY = "data_personnel.columns.monthly_revenue.title";
    export const ALL_FIELDS = [
      HAS_EC_TRAINING, HAS_COMPUTER_TRAINING, HAS_ARCHIVING_TRAINING, MONTHLY_SALARY,
      MALE_COUNT, FEMALE_COUNT, NON_OFFICER_MALE_COUNT, NON_OFFICER_FEMALE_COUNT
    ];

    export namespace Officers {
      export const OTHER_POSITION = "csc.form.sections.personnel_info.sub_forms.officers.fields.other_position.title";
      export const STATUS = "csc.form.sections.personnel_info.sub_forms.officers.fields.status.title";
      export const OTHER_STATUS = "csc.form.sections.personnel_info.sub_forms.officers.fields.other_status.title";
      export const TOTAL_ALLOWANCE_2022 = "csc.form.sections.personnel_info.sub_forms.officers.fields.allowance_2022.title";
      export const TOTAL_REVENUE_2022 = "csc.form.sections.personnel_info.sub_forms.officers.fields.revenue_2022.title";
      export const HAS_ARCHIVING_TRAINING = "csc.form.sections.personnel_info.sub_forms.officers.fields.archiving_training.title";
      export const CS_SENIORITY = "csc.form.sections.personnel_info.sub_forms.officers.fields.seniority.title";
      export const ALL_FIELDS = [
        OTHER_POSITION, STATUS, OTHER_STATUS, TOTAL_ALLOWANCE_2022, TOTAL_REVENUE_2022,
        HAS_ARCHIVING_TRAINING, CS_SENIORITY
      ];

      export const STAFF_FIELDS = [
        PersonnelInfo.PERSONNEL_NAME,
        PersonnelInfo.PERSONNEL_POSITION,
        StaffInfo.Officers.OTHER_POSITION,
        StaffInfo.Officers.STATUS,
        StaffInfo.Officers.OTHER_STATUS,
        PersonnelInfo.PERSONNEL_GENDER,
        PersonnelInfo.PERSONNEL_PHONE,
        PersonnelInfo.PERSONNEL_AGE,
        PersonnelInfo.PERSONNEL_EMAIL,
        PersonnelInfo.PERSONNEL_ED_LEVEL,
        PersonnelInfo.PERSONNEL_COMPUTER_LEVEL,
        StaffInfo.HAS_EC_TRAINING,
        Officers.HAS_ARCHIVING_TRAINING,
        HAS_COMPUTER_TRAINING,
        Officers.CS_SENIORITY,
        MONTHLY_SALARY
      ];

      export const STATS_FIELDS = [
        MALE_COUNT,
        FEMALE_COUNT,
        NON_OFFICER_MALE_COUNT,
        NON_OFFICER_FEMALE_COUNT
      ];
    }
  }

  export namespace StatusOfArchivedRecords {
    export const YEAR = "csc.form.sections.archive_stats.fields.year.title";
    export const BIRTH_COUNT = "csc.form.sections.archive_stats.fields.birth_count.title";
    export const MARRIAGE_COUNT = "csc.form.sections.archive_stats.fields.marriage_count.title";
    export const DEATH_COUNT = "csc.form.sections.archive_stats.fields.death_count.title";
    export const ALL_FIELDS = [
      YEAR, BIRTH_COUNT, MARRIAGE_COUNT, DEATH_COUNT
    ]
  }

  export namespace Deeds {
    export const YEAR = "csc.form.sections.deeds.fields.year.title";
    export const BIRTH_CERT_DRAWN = "csc.form.sections.deeds.fields.birth_certs_drawn.title";
    export const BIRTH_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.births_certs_not_withdrawn.title";
    export const MARRIAGE_CERT_DRAWN = "csc.form.sections.deeds.fields.marriage_certs_drawn.title";
    export const MARRIAGE_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.marriage_certs_not_withdrawn.title";
    export const DEATH_CERT_DRAWN = "csc.form.sections.deeds.fields.death_certs_drawn.title";
    export const DEATH_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.death_certs_not_withdrawn.title";
    export const ALL_FIELDS = [
      YEAR, BIRTH_CERT_DRAWN, BIRTH_CERT_NOT_DRAWN, MARRIAGE_CERT_DRAWN, MARRIAGE_CERT_NOT_DRAWN,
      DEATH_CERT_DRAWN, DEATH_CERT_NOT_DRAWN
    ];
  }

  export namespace Extras {
    export const RELEVANT_INFO = "csc.form.sections.comments.fields.relevant_info.title";
    export const ALL_FIELDS = [RELEVANT_INFO];
  }

  export namespace Archiving {
    export const HAS_ARCHIVING_ROOM = "csc.form.sections.archiving.fields.archiving_room.title";
    export const ARCHIVE_ROOM_ELECTRIC_CONDITION = "csc.form.sections.archiving.fields.archiving_room_electric_condition.title";
    export const HAS_FIRE_EXTINGUISHERS = "csc.form.sections.archiving.fields.fire_extinguishers.title";
    export const LOCKED_DOOR = "csc.form.sections.archiving.fields.locked_door.title";
    export const IS_ARCHIVE_ROOM_ACCESS_LIMITED = "csc.form.sections.archiving.fields.access_limited.title";
    export const ROOM_HAS_HUMIDITY = "csc.form.sections.archiving.fields.room_has_humidity.title";
    export const REGISTER_ARCHIVING_TYPE = "csc.form.sections.archiving.fields.register_archiving_type.title";
    export const OTHER_ARCHIVING_TYPE = "csc.form.sections.archiving.fields.other_register_archiving_type.title";
    export const WRITTEN_ARCHIVING_PLAN = "csc.form.sections.archiving.fields.written_archiving_plan.title";
    export const REGISTERS_DEPOSITED = "csc.form.sections.archiving.fields.registers_deposited.title";
    export const REGISTERS_DEPOSITED_SYSTEMATICALLY = "csc.form.sections.archiving.fields.registers_deposited_systematically.title";
    export const VANDALIZED = "csc.form.sections.archiving.fields.vandalized.title";
    export const VANDALIZED_DATE = "csc.form.sections.archiving.fields.vandalized_date.title";
    export const ALL_FIELDS = [
      HAS_ARCHIVING_ROOM, ARCHIVE_ROOM_ELECTRIC_CONDITION, HAS_FIRE_EXTINGUISHERS, LOCKED_DOOR,
      IS_ARCHIVE_ROOM_ACCESS_LIMITED, ROOM_HAS_HUMIDITY, REGISTER_ARCHIVING_TYPE, OTHER_ARCHIVING_TYPE,
      WRITTEN_ARCHIVING_PLAN, REGISTERS_DEPOSITED, REGISTERS_DEPOSITED_SYSTEMATICALLY, VANDALIZED,
      VANDALIZED_DATE
    ]
  }

  export namespace FinancialStats {
    export const BIRTH_CERT_COST = "csc.form.sections.vital_stats.fields.birth_cert_cost.title";
    export const BIRTH_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.birth_cert_copy_cost.title";
    export const MARRIAGE_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.marriage_cert_copy_cost.title";
    export const DEATH_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.death_cert_copy_cost.title";
    export const CELIBACY_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.celibacy_cert_copy_cost.title";
    export const NON_REGISTERED_CERTS = "csc.form.sections.vital_stats.fields.non_registered_certs.title";
    export const RATES_UNDER_DELIBERATION = "csc.form.sections.vital_stats.fields.rates_under_deliberation.title";
    export const PRICES_DISPLAYED = "csc.form.sections.vital_stats.fields.prices_displayed.title";
    export const MUNICIPALITY_BUDGET_2024 = "csc.form.sections.vital_stats.fields.municipality_budget.title";
    export const CS_BUDGET_2024 = "csc.form.sections.vital_stats.fields.cs_budget.title";
    export const ALL_FIELDS = [
      BIRTH_CERT_COST, BIRTH_CERT_COPY_COST, MARRIAGE_CERT_COPY_COST, DEATH_CERT_COPY_COST,
      CELIBACY_CERT_COPY_COST,
      NON_REGISTERED_CERTS, RATES_UNDER_DELIBERATION, PRICES_DISPLAYED, MUNICIPALITY_BUDGET_2024
    ];
  }

  export namespace RecordProcurement {
    export const HAS_THERE_BEEN_LACK_OF_REGISTERS = "csc.form.sections.record_procurement.fields.lack_of_registers.title";
    export const RECORDS_PROVIDER = "csc.form.sections.record_procurement.fields.records_provider.title";
    export const OTHER_RECORDS_PROVIDER = "csc.form.sections.record_procurement.fields.other_records_provider.title";
    export const NON_COMPLIANT_REGISTERS_USED = "csc.form.sections.record_procurement.fields.non_compliant_registers_used.title";
    export const BLANK_REGISTRIES_COUNT = "csc.form.sections.record_procurement.fields.blank_registries.title";
    export const BLANK_MARRIAGES = "csc.form.sections.record_procurement.fields.blank_marriages.title";
    export const BLANK_BIRTHS = "csc.form.sections.record_procurement.fields.blank_births.title";
    export const BLANK_DEATHS = "csc.form.sections.record_procurement.fields.blank_deaths.title";
    export const ALL_FIELDS = [
      HAS_THERE_BEEN_LACK_OF_REGISTERS, RECORDS_PROVIDER, OTHER_RECORDS_PROVIDER,
      NON_COMPLIANT_REGISTERS_USED,
      BLANK_REGISTRIES_COUNT, BLANK_MARRIAGES, BLANK_BIRTHS, BLANK_DEATHS
    ];
  }

  export namespace RecordIndexing {
    export const RECORDS_SCANNED = "csc.form.sections.indexing.fields.records_scanned.title";
    export const STAFF_TRAINED = "csc.form.sections.indexing.fields.staff_trained.title";
    export const DOCUMENT_SCAN_START_DATE = "csc.form.sections.indexing.fields.document_scan_start_date.title";
    export const DATA_INDEXED = "csc.form.sections.indexing.fields.is_data_indexed.title";
    export const MARRIAGES_INDEXED = "csc.form.sections.indexing.fields.marriages_indexed.title";
    export const DEATHS_INDEXED = "csc.form.sections.indexing.fields.deaths_indexed.title";
    export const BIRTHS_INDEXED = "csc.form.sections.indexing.fields.births_indexed.title";
    export const MARRIAGES_SCANNED = "csc.form.sections.indexing.fields.marriages_scanned.title";
    export const BIRTHS_SCANNED = "csc.form.sections.indexing.fields.births_scanned.title";
    export const DEATHS_SCANNED = "csc.form.sections.indexing.fields.deaths_scanned.title";
    export const IS_DATA_USED_BY_CSC = "csc.form.sections.indexing.fields.is_data_in_use.title";
    export const DATA_USAGE = "csc.form.sections.indexing.fields.data_usage.title";
    export const ALL_FIELDS = [
      RECORDS_SCANNED, STAFF_TRAINED, DOCUMENT_SCAN_START_DATE, DATA_INDEXED, MARRIAGES_INDEXED,
      DEATHS_INDEXED,
      BIRTHS_INDEXED, MARRIAGES_SCANNED, BIRTHS_SCANNED, DEATHS_SCANNED, IS_DATA_USED_BY_CSC, DATA_USAGE
    ];
  }

  export namespace Digitization {
    export const EXTERNAL_SERVICE_FROM_CR = "csc.form.sections.digitization.fields.using_info_sys_outside_cs.title";
    export const EXTERNAL_CR_USES_INTERNET = "csc.form.sections.digitization.fields.external_cr_uses_internet.title";
    export const HAS_CS_SOFTWARE = "csc.form.sections.digitization.fields.has_cs_software.title";
    export const CS_SOFTWARE_NAME = "csc.form.sections.digitization.fields.cs_software_name.title";
    export const CS_SOFTWARE_LICENSE_SPONSOR = "csc.form.sections.digitization.fields.cs_software_license_sponsor.title";
    export const OTHER_CS_SOFTWARE_LICENSE_SPONSOR = "csc.form.sections.digitization.fields.other_cs_software_license_sponsor.title";
    export const USERS_RECEIVE_DIGITAL_ACTS = "csc.form.sections.digitization.fields.users_receive_digital_acts.title";
    export const SOFTWARE_ACTIVATION_DATE = "csc.form.sections.digitization.fields.software_activation_date.title";
    export const SOFTWARE_FEEDBACK = "csc.form.sections.digitization.fields.software_feedback.title";
    export const SOFTWARE_TRAINED_USER_COUNT = "csc.form.sections.digitization.fields.software_trained_user_count.title";
    export const SOFTWARE_RECORDED_MARRIAGE_COUNT = "csc.form.sections.digitization.fields.software_recorded_marriage_count.title";
    export const SOFTWARE_RECORDED_BIRTHS_COUNT = "csc.form.sections.digitization.fields.software_recorded_birth_count.title";
    export const SOFTWARE_RECORDED_DEATH_COUNT = "csc.form.sections.digitization.fields.software_recorded_death_count.title";
    export const SOFTWARE_IS_WORKING = "csc.form.sections.digitization.fields.software_is_functional.title";
    export const SOFTWARE_DYSFUNCTION_REASON = "csc.form.sections.digitization.fields.software_dysfunction_reason.title";
    export const ALL_FIELDS = [
      EXTERNAL_SERVICE_FROM_CR, EXTERNAL_CR_USES_INTERNET, HAS_CS_SOFTWARE, CS_SOFTWARE_NAME,
      CS_SOFTWARE_LICENSE_SPONSOR,
      USERS_RECEIVE_DIGITAL_ACTS, SOFTWARE_ACTIVATION_DATE, SOFTWARE_FEEDBACK,
      SOFTWARE_TRAINED_USER_COUNT,
      SOFTWARE_RECORDED_MARRIAGE_COUNT, SOFTWARE_RECORDED_BIRTHS_COUNT, SOFTWARE_RECORDED_DEATH_COUNT,
      SOFTWARE_IS_WORKING, SOFTWARE_DYSFUNCTION_REASON
    ];
  }

  export namespace Equipment {
    export const COMPUTER_COUNT = "csc.form.sections.equipment.fields.pc_count.title";
    export const SERVER_COUNT = "csc.form.sections.equipment.fields.server_count.title";
    export const PRINTER_COUNT = "csc.form.sections.equipment.fields.printer_count.title";
    export const SCANNER_COUNT = "csc.form.sections.equipment.fields.scanner_count.title";
    export const INVERTERS_COUNT = "csc.form.sections.equipment.fields.inverters.title";
    export const AIR_CONDITIONER_COUNT = "csc.form.sections.equipment.fields.conditioners.title";
    export const FAN_COUNT = "csc.form.sections.equipment.fields.fans.title";
    export const PROJECTOR_COUNT = "csc.form.sections.equipment.fields.projectors.title";
    export const OFFICE_TABLE_COUNT = "csc.form.sections.equipment.fields.office_tables.title";
    export const CHAIR_COUNT = "csc.form.sections.equipment.fields.chairs.title";
    export const CAR_COUNT = "csc.form.sections.equipment.fields.cars.title";
    export const BIKE_COUNT = "csc.form.sections.equipment.fields.bikes.title";
    export const TABLET_COUNT = "csc.form.sections.equipment.fields.tablets.title";
    export const ALL_FIELDS = [
      COMPUTER_COUNT, SERVER_COUNT, PRINTER_COUNT, SCANNER_COUNT, INVERTERS_COUNT, AIR_CONDITIONER_COUNT,
      FAN_COUNT, PROJECTOR_COUNT, OFFICE_TABLE_COUNT, CHAIR_COUNT, CAR_COUNT, BIKE_COUNT, TABLET_COUNT
    ];
  }

  export namespace Areas {
    export const OFFICE_COUNT = "csc.form.sections.areas.fields.office_count.title";
    export const DEDICATED_CS_ROOMS = "csc.form.sections.areas.fields.dedicated_cs_rooms.title";
    export const MOVING = "csc.form.sections.areas.fields.moving.title";
    export const ALL_FIELDS = [
      OFFICE_COUNT, DEDICATED_CS_ROOMS, MOVING
    ];

    export namespace Rooms {
      export const NUMBER = "csc.form.sections.areas.sub_forms.rooms.fields.number.title";
      export const NAME = "csc.form.sections.areas.sub_forms.rooms.fields.name.title";
      export const CONDITION = "csc.form.sections.areas.sub_forms.rooms.fields.condition.title";
      export const AREA = "csc.form.sections.areas.sub_forms.rooms.fields.dimension.title";
      export const RENOVATION_NATURE = "csc.form.sections.areas.sub_forms.rooms.fields.renovation.title";
      export const ALL_FIELDS = [
        NUMBER, NAME, CONDITION, AREA, RENOVATION_NATURE
      ];
    }
  }

  export namespace Infrastructure {
    export const STATUS = "csc.form.sections.infra.fields.occupancy_status.title";
    export const OTHER_BUILDING = "csc.form.sections.infra.fields.other_building.title";
    export const ENEO_CONNECTION = "csc.form.sections.infra.fields.eneo_connection.title";
    export const POWER_OUTAGES = "csc.form.sections.infra.fields.power_outages.title";
    export const STABLE_POWER = "csc.form.sections.infra.fields.stable_power.title";
    export const BACKUP_POWER_SOURCES_AVAILABLE = "csc.form.sections.infra.fields.backup_power_available.title";
    export const BACKUP_POWER_SOURCES = "csc.form.sections.infra.fields.backup_power.title";
    export const OTHER_POWER_SOURCE = "csc.form.sections.infra.fields.other_backup_power.title";
    export const WATER_SOURCES = "csc.form.sections.infra.fields.water_sources.title";
    export const TOILETS_AVAILABLE = "csc.form.sections.infra.fields.toilets_available.title";
    export const SEPARATE_TOILETS_AVAILABLE = "csc.form.sections.infra.fields.separate_toilets_available.title";
    export const NETWORK_TYPE = "csc.form.sections.infra.fields.zone_operators.title";
    export const HAS_FIBER_CONNECTION = "csc.form.sections.infra.fields.has_fiber.title";
    export const OTHER_NETWORK_TYPE = "csc.form.sections.infra.fields.other_zone_operators.title";
    export const HAS_INTERNET = "csc.form.sections.infra.fields.has_internet.title";
    export const INTERNET_TYPE = "csc.form.sections.infra.fields.internet_type.title";
    export const OTHER_INTERNET_TYPE = "csc.form.sections.infra.fields.other_internet_type.title";
    export const INTERNET_SPONSOR = "csc.form.sections.infra.fields.internet_sponsor.title";
    export const ALL_FIELDS = [
      STATUS, OTHER_BUILDING, ENEO_CONNECTION, POWER_OUTAGES, STABLE_POWER,
      BACKUP_POWER_SOURCES_AVAILABLE,
      BACKUP_POWER_SOURCES, OTHER_POWER_SOURCE, WATER_SOURCES, TOILETS_AVAILABLE,
      SEPARATE_TOILETS_AVAILABLE,
      NETWORK_TYPE, HAS_FIBER_CONNECTION, OTHER_NETWORK_TYPE, HAS_INTERNET, INTERNET_TYPE,
      OTHER_INTERNET_TYPE, INTERNET_SPONSOR
    ];
  }

  export namespace Accessibility {
    export const ROAD_TYPE = "csc.form.sections.accessibility.fields.road_type.title";
    export const DOES_ROAD_DETERIORATE = "csc.form.sections.accessibility.fields.road_deteriorates.title";
    export const ROAD_OBSTACLE = "csc.form.sections.accessibility.fields.obstacle.title";
    export const ATTACHED_VILLAGES_NUMBER = "csc.form.sections.accessibility.fields.attached_villages_num.title";
    export const COVER_RADIUS = "csc.form.sections.accessibility.fields.cover_radius.title";
    export const ALL_FIELDS = [
      ROAD_TYPE,
      DOES_ROAD_DETERIORATE,
      ROAD_OBSTACLE,
      ATTACHED_VILLAGES_NUMBER,
      COVER_RADIUS,
    ];
    export namespace Villages {
      export const NAME = "csc.form.sections.accessibility.sub_forms.villages.fields.name.title";
      export const DISTANCE = "csc.form.sections.accessibility.sub_forms.villages.fields.avg_distance.title";
      export const OBSERVATIONS = "csc.form.section.accessibility.sub_forms.villages.fields.observations.title";
      export const ALL_FIELDS = [
        NAME, DISTANCE, OBSERVATIONS
      ]
    }
  }

  export namespace Respondent {
    export const NAME = "csc.form.sections.respondent.fields.name.title";
    export const POSITION = "csc.form.sections.respondent.fields.position.title";
    export const PHONE = "csc.form.sections.respondent.fields.phone.title";
    export const EMAIL = "csc.form.sections.respondent.fields.email.title";
    export const KNOWS_CREATION_DATE = "csc.form.sections.respondent.fields.knows_creation_date.title";
    export const CREATION_DATE = "csc.form.sections.respondent.fields.creation_date.title";
    export const ALL_FIELDS = [
      NAME, POSITION, PHONE, EMAIL, KNOWS_CREATION_DATE, CREATION_DATE
    ]
  }

  export namespace Identification {
    export const DIVISION = "csc.form.sections.identification.fields.division.title";
    export const MUNICIPALITY = "csc.form.sections.identification.fields.municipality.title";
    export const QUARTER = "csc.form.sections.identification.fields.quarter.title";
    export const FACILITY_NAME = "csc.form.sections.identification.fields.facility.title";
    export const CATEGORY = "csc.form.sections.identification.fields.category.title";
    export const TOWN_SIZE = "csc.form.sections.identification.fields.council_size.title";
    export const MILIEU = "csc.form.sections.identification.fields.milieu.title";
    export const ATTACHED_CENTERS = "csc.form.sections.identification.fields.attached_centers.title";
    export const LOCALITY = "csc.form.sections.identification.fields.locality.title";
    export const CREATION_DATE = "csc.form.sections.identification.fields.creation_date.title";
    export const IS_FUNCTIONAL = "csc.form.sections.identification.fields.functional.title";
    export const NON_FUNCTION_REASON = "csc.form.sections.identification.fields.non_function_reason.title";
    export const CHIEFDOM_DEGREE = "csc.form.sections.identification.fields.chiefdom_degree.title";
    export const OTHER_NON_FUNCTION_REASON = "csc.form.sections.identification.fields.other_non_function_reason.title";
    export const IS_CHIEFDOM = "csc.form.sections.identification.fields.fields.is_chiefdom.title";
    export const NON_FUNCTION_DURATION = "csc.form.sections.identification.fields.non_function_duration.title";
    export const SECONDARY_CREATION_ORDER = "csc.form.sections.identification.fields.sec_creation_order.title";
    export const OFFICER_APPOINTMENT_ORDER = "csc.form.sections.identification.fields.officer_appointment_order.title";
    export const IS_OFFICER_APPOINTED = "csc.form.sections.identification.fields.officer_appointed.title";
    export const PHOTO_URL = "csc.form.sections.identification.fields.photo_url.title";
    export const GPS_COORDS = "csc.form.sections.identification.fields.gps_coords.title";
    export const ALL_FIELDS = {
      DIVISION, MUNICIPALITY, QUARTER, FACILITY_NAME, CATEGORY, TOWN_SIZE, MILIEU, ATTACHED_CENTERS,
      IS_FUNCTIONAL, NON_FUNCTION_REASON, CHIEFDOM_DEGREE, OTHER_NON_FUNCTION_REASON,
      IS_CHIEFDOM,
      NON_FUNCTION_DURATION, SECONDARY_CREATION_ORDER, OFFICER_APPOINTMENT_ORDER, IS_OFFICER_APPOINTED,
      PHOTO_URL, GPS_COORDS
    };
  }

  export const TRACKABLE_FIELDS = [
    INDEX,
    VALIDATION_CODE,
    Identification.FACILITY_NAME,
    Identification.CATEGORY,
    Identification.TOWN_SIZE,
    Identification.MILIEU,
    Identification.ATTACHED_CENTERS,
    Identification.LOCALITY,
    Identification.CREATION_DATE,
    Identification.IS_FUNCTIONAL,
    Identification.NON_FUNCTION_REASON,
    Identification.CHIEFDOM_DEGREE,
    Identification.OTHER_NON_FUNCTION_REASON,
    Identification.IS_CHIEFDOM,
    Identification.NON_FUNCTION_DURATION,
    Identification.SECONDARY_CREATION_ORDER,
    Identification.OFFICER_APPOINTMENT_ORDER,
    Identification.IS_OFFICER_APPOINTED,
    Identification.PHOTO_URL,
    Identification.GPS_COORDS,
    Identification.QUARTER,
    Identification.DIVISION,
    Identification.MUNICIPALITY,
    Respondent.CREATION_DATE,
    Respondent.KNOWS_CREATION_DATE,
    Respondent.NAME,
    Respondent.POSITION,
    Respondent.PHONE,
    Respondent.EMAIL,
    Accessibility.ROAD_TYPE,
    Accessibility.DOES_ROAD_DETERIORATE,
    Accessibility.ROAD_OBSTACLE,
    Accessibility.ATTACHED_VILLAGES_NUMBER,
    Accessibility.COVER_RADIUS,
    Infrastructure.STATUS,
    Infrastructure.OTHER_BUILDING,
    Infrastructure.ENEO_CONNECTION,
    Infrastructure.POWER_OUTAGES,
    Infrastructure.STABLE_POWER,
    Infrastructure.BACKUP_POWER_SOURCES_AVAILABLE,
    Infrastructure.BACKUP_POWER_SOURCES,
    Infrastructure.OTHER_POWER_SOURCE,
    Infrastructure.WATER_SOURCES,
    Infrastructure.TOILETS_AVAILABLE,
    Infrastructure.SEPARATE_TOILETS_AVAILABLE,
    Infrastructure.NETWORK_TYPE,
    Infrastructure.HAS_FIBER_CONNECTION,
    Infrastructure.OTHER_NETWORK_TYPE,
    Infrastructure.HAS_INTERNET,
    Infrastructure.INTERNET_TYPE,
    Infrastructure.OTHER_INTERNET_TYPE,
    Infrastructure.INTERNET_SPONSOR,
    Areas.OFFICE_COUNT,
    Areas.DEDICATED_CS_ROOMS,
    Areas.MOVING,
    Equipment.COMPUTER_COUNT,
    Equipment.SERVER_COUNT,
    Equipment.PRINTER_COUNT,
    Equipment.SCANNER_COUNT,
    Equipment.INVERTERS_COUNT,
    Equipment.AIR_CONDITIONER_COUNT,
    Equipment.FAN_COUNT,
    Equipment.PROJECTOR_COUNT,
    Equipment.OFFICE_TABLE_COUNT,
    Equipment.CHAIR_COUNT,
    Equipment.CAR_COUNT,
    Equipment.BIKE_COUNT,
    Equipment.TABLET_COUNT,
    Digitization.EXTERNAL_SERVICE_FROM_CR,
    Digitization.EXTERNAL_CR_USES_INTERNET,
    Digitization.HAS_CS_SOFTWARE,
    Digitization.CS_SOFTWARE_NAME,
    Digitization.CS_SOFTWARE_LICENSE_SPONSOR,
    Digitization.USERS_RECEIVE_DIGITAL_ACTS,
    Digitization.SOFTWARE_ACTIVATION_DATE,
    Digitization.SOFTWARE_FEEDBACK,
    Digitization.SOFTWARE_TRAINED_USER_COUNT,
    Digitization.SOFTWARE_RECORDED_MARRIAGE_COUNT,
    Digitization.SOFTWARE_RECORDED_BIRTHS_COUNT,
    Digitization.SOFTWARE_RECORDED_DEATH_COUNT,
    Digitization.SOFTWARE_IS_WORKING,
    Digitization.SOFTWARE_DYSFUNCTION_REASON,
    RecordIndexing.RECORDS_SCANNED,
    RecordIndexing.STAFF_TRAINED,
    RecordIndexing.DOCUMENT_SCAN_START_DATE,
    RecordIndexing.DATA_INDEXED,
    RecordIndexing.MARRIAGES_INDEXED,
    RecordIndexing.DEATHS_INDEXED,
    RecordIndexing.BIRTHS_INDEXED,
    RecordIndexing.MARRIAGES_SCANNED,
    RecordIndexing.BIRTHS_SCANNED,
    RecordIndexing.DEATHS_SCANNED,
    RecordIndexing.IS_DATA_USED_BY_CSC,
    RecordIndexing.DATA_USAGE,
    RecordProcurement.HAS_THERE_BEEN_LACK_OF_REGISTERS,
    RecordProcurement.RECORDS_PROVIDER,
    RecordProcurement.OTHER_RECORDS_PROVIDER,
    RecordProcurement.NON_COMPLIANT_REGISTERS_USED,
    RecordProcurement.BLANK_REGISTRIES_COUNT,
    RecordProcurement.BLANK_MARRIAGES,
    RecordProcurement.BLANK_BIRTHS,
    RecordProcurement.BLANK_DEATHS,
    FinancialStats.BIRTH_CERT_COST,
    FinancialStats.BIRTH_CERT_COPY_COST,
    FinancialStats.MARRIAGE_CERT_COPY_COST,
    FinancialStats.DEATH_CERT_COPY_COST,
    FinancialStats.CELIBACY_CERT_COPY_COST,
    FinancialStats.NON_REGISTERED_CERTS,
    FinancialStats.RATES_UNDER_DELIBERATION,
    FinancialStats.PRICES_DISPLAYED,
    FinancialStats.MUNICIPALITY_BUDGET_2024,
    FinancialStats.CS_BUDGET_2024,
    Archiving.HAS_ARCHIVING_ROOM,
    Archiving.ARCHIVE_ROOM_ELECTRIC_CONDITION,
    Archiving.HAS_FIRE_EXTINGUISHERS,
    Archiving.LOCKED_DOOR,
    Archiving.IS_ARCHIVE_ROOM_ACCESS_LIMITED,
    Archiving.ROOM_HAS_HUMIDITY,
    Archiving.REGISTER_ARCHIVING_TYPE,
    Archiving.OTHER_ARCHIVING_TYPE,
    Archiving.WRITTEN_ARCHIVING_PLAN,
    Archiving.REGISTERS_DEPOSITED,
    Archiving.REGISTERS_DEPOSITED_SYSTEMATICALLY,
    Archiving.VANDALIZED,
    Archiving.VANDALIZED_DATE,
    Extras.RELEVANT_INFO,
    Deeds.YEAR,
    Deeds.BIRTH_CERT_DRAWN,
    Deeds.BIRTH_CERT_NOT_DRAWN,
    Deeds.MARRIAGE_CERT_DRAWN,
    Deeds.MARRIAGE_CERT_NOT_DRAWN,
    Deeds.DEATH_CERT_DRAWN,
    Deeds.DEATH_CERT_NOT_DRAWN,
  ]
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

export const FieldKeySchema = z.union([
  FosaFieldKeySchema
]);
export const AllSectionKeysSchema = z.union([
  Fosa.SectionKeysSchema
]);
export type FosaFieldKey = z.output<typeof FosaFieldKeySchema>;
export type FieldKey = z.output<typeof FieldKeySchema>;
export type FormSectionKeys = z.output<typeof AllSectionKeysSchema>;
