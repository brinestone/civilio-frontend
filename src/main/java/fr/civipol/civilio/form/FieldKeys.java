package fr.civipol.civilio.form;

@SuppressWarnings({ "DuplicatedCode" })
public class FieldKeys {
    public static final class Fosa {
        public static final String RESPONDING_DEVICE = "fosa.form.fields.responding_device.title";
        public static final String MAIL = "fosa.form.fields.email.title";
        public static final String PHONE = "fosa.form.fields.phone.title";
        public static final String POSITION = "fosa.form.fields.position.title";
        public static final String RESPONDENT_NAME = "fosa.form.fields.names.title";
        public static final String CREATION_DATE = "fosa.form.fields.creation_date.description";
        public static final String DIVISION = "fosa.form.fields.department.description";
        public static final String MUNICIPALITY = "fosa.form.fields.communes.title";
        public static final String QUARTER = "fosa.form.fields.quarter.title";
        public static final String LOCALITY = "fosa.form.fields.locality.title";
        public static final String OFFICE_NAME = "fosa.form.fields.fosa_name.title";
        public static final String DISTRICT = "fosa.form.fields.district.title";
        public static final String HEALTH_AREA = "fosa.form.fields.health_area.title";
        public static final String FACILITY_TYPE = "fosa.form.fields.fosa_type.title";
        public static final String HAS_MATERNITY = "fosa.form.fields.has_maternity.title";
        public static final String CSC_DISTANCE = "fosa.form.fields.distance_csc.title";
        public static final String GEO_POINT = "fosa.form.sections.geo_point.title";
        public static final String USES_DHIS = "fosa.form.fields.dhis2_usage.title";
        public static final String USES_BUNEC_BIRTH_FORM = "fosa.form.fields.uses_bunec_birth_form.title";
        public static final String USES_DHIS_FORMS = "fosa.form.fields.uses_dhis2_form.title";
        public static final String SEND_BIRTH_DECLARATIONS_TO_CSC = "fosa.form.fields.birth_declaration_transmission_to_csc.title";
        public static final String CSC_EVENT_REGISTRATIONS = "fosa.form.fields.csc_event_reg_type.title";
        public static final String STATS_YEAR_1 = "fosa.columns.year.1";
        public static final String STATS_DEATH_COUNT_1 = "fosa.columns.deaths.1";
        public static final String STATS_BIRTH_COUNT_1 = "fosa.columns.births.1";
        public static final String STATS_OBSERVATIONS_1 = "fosa.columns.observation.1";
        public static final String STATS_YEAR_2 = "fosa.columns.year.2";
        public static final String STATS_DEATH_COUNT_2 = "fosa.columns.deaths.2";
        public static final String STATS_BIRTH_COUNT_2 = "fosa.columns.births.2";
        public static final String STATS_YEAR_3 = "fosa.columns.year.3";
        public static final String STATS_DEATH_COUNT_3 = "fosa.columns.deaths.3";
        public static final String STATS_BIRTH_COUNT_3 = "fosa.columns.births.3";
        public static final String STATS_YEAR_4 = "fosa.columns.year.4";
        public static final String STATS_DEATH_COUNT_4 = "fosa.columns.deaths.4";
        public static final String STATS_BIRTH_COUNT_4 = "fosa.columns.births.4";
        public static final String STATS_YEAR_5 = "fosa.columns.year.5";
        public static final String STATS_DEATH_COUNT_5 = "fosa.columns.deaths.5";
        public static final String STATS_BIRTH_COUNT_5 = "fosa.columns.births.5";
        public static final String HAS_TOILET_FIELD = "fosa.form.fields.toilet_present.title";
        public static final String HAS_ENEO_CONNECTION = "fosa.form.fields.has_eneo_connection.title";
        public static final String HAS_BACKUP_POWER_SOURCE = "fosa.form.fields.has_power_source.title";
        public static final String BACKUP_POWER_SOURCES = "fosa.form.fields.alternative_power.title";
        public static final String HAS_INTERNET_CONNECTION = "fosa.form.fields.internet_conn.title";
        public static final String HAS_WATER_SOURCES = "fosa.form.fields.has_water_source.title";
        public static final String WATER_SOURCES = "fosa.form.fields.water_source.title";
        public static final String ENVIRONMENT_TYPE = "fosa.form.fields.environment.title";
        public static final String PC_COUNT = "fosa.form.fields.pc_count.title";
        public static final String PRINTER_COUNT = "fosa.form.fields.printer_count.title";
        public static final String TABLET_COUNT = "fosa.form.fields.tablet_count.title";
        public static final String CAR_COUNT = "fosa.form.fields.car_count.title";
        public static final String BIKE_COUNT = "fosa.form.fields.bike_count.title";
        public static final String PERSONNEL_COUNT = "fosa.form.fields.key_personnel_count.title";
        public static final String STATUS = "fosa.form.fields.fosa_status.title";
        public static final String ATTACHED_CSC = "fosa.form.fields.csc_reg.title";
        public static final String INDEX = "fosa.form.fields.index";
        public static final String VALIDATION_CODE = "fosa.form.fields.validation_code";
    }

    public static final class PersonnelInfo {
        public static final String PERSONNEL_NAME = "data_personnel.columns.name.title";
        public static final String PERSONNEL_POSITION = "data_personnel.columns.role.title";
        public static final String PERSONNEL_GENDER = "data_personnel.columns.gender.title";
        public static final String PERSONNEL_PHONE = "data_personnel.columns.phone.title";
        public static final String PERSONNEL_EMAIL = "data_personnel.columns.email.title";
        public static final String PERSONNEL_AGE = "data_personnel.columns.age.title";
        public static final String PERSONNEL_CS_TRAINING = "data_personnel.columns.has_cs_training.title";
        public static final String PERSONNEL_ED_LEVEL = "data_personnel.columns.education_level.title";
        public static final String PERSONNEL_COMPUTER_LEVEL = "data_personnel.columns.pc_knowledge.title";
        public static final String PERSONNEL_STATUS = "data_personnel.columns.status.title";
        public static final String EC_TRAINING = "data_personnel.columns.ec_training.title";
        public static final String HAS_COMPUTER_TRAINING = "data_personnel.columns.has_pc_training.title";
        public static final String ARCHIVING_TRAINING = "data_personnel.columns.archiving_training.title";
        public static final String MONTHLY_REVENUE = "data_personnel.columns.monthly_revenue.title";
        public static final String[] ALL_FIELDS = { PERSONNEL_NAME, PERSONNEL_AGE, PERSONNEL_PHONE, PERSONNEL_AGE,
                PERSONNEL_GENDER, PERSONNEL_EMAIL, PERSONNEL_COMPUTER_LEVEL, PERSONNEL_CS_TRAINING, PERSONNEL_ED_LEVEL,
                PERSONNEL_POSITION };
    }

    public static final class Chiefdom {
        public static final String RESPONDENT_NAME = "chefferie.form.fields.names.title";
        public static final String POSITION = "chefferie.form.fields.position.title";
        public static final String PHONE = "chefferie.form.fields.phone.title";
        public static final String EMAIL = "chefferie.form.fields.email.title";
        public static final String CREATION_DATE = "chefferie.form.fields.creation_date.title";
        public static final String DIVISION = "chefferie.form.fields.department.title";
        public static final String MUNICIPALITY = "chefferie.form.fields.communes.title";
        public static final String QUARTER = "chefferie.form.fields.quarter.title";
        public static final String FACILITY_NAME = "chefferie.form.fields.facility_name.title";
        public static final String CLASSIFICATION = "chefferie.form.fields.classification.title";
        public static final String HEALTH_CENTER_PROXIMITY = "chefferie.form.fields.distance.title";
        public static final String GPS_COORDS = "chefferie.form.sections.geo_point.title";
        public static final String FUNCTION = "chefferie.form.fields.fonction.title";
        // public static final String RECEPTION_AREA =
        // "chefferie.form.fields.reception.title";
        // public static final String OTHER_RECEPTION_AREA =
        // "chefferie.form.fields.other_recep.title";
        public static final String CONSERVATION_PLACE = "chefferie.form.fields.conservation_place.title";
        public static final String CS_OFFICER_TRAINED = "chefferie.form.fields.training.title";
        public static final String WAITING_ROOM = "chefferie.form.fields.waiting_room.title";
        public static final String OTHER_WAITING_ROOM = "chefferie.form.fields.other_waiting_room.title";
        public static final String IS_CHIEF_CS_OFFICER = "chefferie.form.fields.cs_actor_is_chief.title";
        public static final String CHIEF_OATH = "chefferie.form.fields.oath.title";
        public static final String CS_REG_LOCATION = "chefferie.form.fields.cs_reg_location.title";
        public static final String OTHER_CS_REG_LOCATION = "chefferie.form.fields.other_cs_reg_location.title";
        public static final String TOILETS_ACCESSIBLE = "chefferie.form.fields.toilets_accessible.title";
        public static final String PC_COUNT = "chefferie.form.fields.equipment_quantity.computers";
        public static final String PRINTER_COUNT = "chefferie.form.fields.equipment_quantity.printers";
        public static final String TABLET_COUNT = "chefferie.form.fields.equipment_quantity.tablets";
        public static final String CAR_COUNT = "chefferie.form.fields.equipment_quantity.cars";
        public static final String BIKE_COUNT = "chefferie.form.fields.equipment_quantity.motorcycles";
        public static final String IS_CHIEFDOM_CHIEF_RESIDENCE = "chefferie.form.fields.structure.title";
        public static final String HAS_INTERNET = "chefferie.form.fields.connexion.title";
        public static final String INTERNET_TYPE = "chefferie.form.fields.typeConnexion.title";
        public static final String OTHER_INTERNET_TYPE = "chefferie.form.fields.other_internet_type.title";
        public static final String HAS_ENEO_CONNECTION = "chefferie.form.fields.eneoConnexion.title";
        public static final String WATER_ACCESS = "chefferie.form.fields.waterAcces.title";
        public static final String WATER_SOURCES = "chefferie.form.fields.waterType.title";
        public static final String OTHER_WATER_SOURCE = "chefferie.form.fields.other_water_source.title";
        public static final String HAS_EXTINGUISHER = "chefferie.form.fields.extinguisher.title";
        public static final String EMPLOYEE_COUNT = "chefferie.form.fields.employer.title";
        public static final String EXTRA_INFO = "chefferie.form.fields.extra_info.title";
        public static final String INDEX = "chefferie.form.fields.index";
        public static final String VALIDATION_CODE = "chefferie.form.fields.validation_code";
    }

    public static final class CSC {
        public static final String INDEX = "csc.form.fields.index.title";
        public static final String VALIDATION_CODE = "csc.form.fields.validation_code.title";
        public static final String[] TRACKABLE_FIELDS = {
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
                Accessibility.Villages.NAME,
                Accessibility.Villages.DISTANCE,
                Accessibility.Villages.OBSERVATIONS,
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
//                Areas.RENOVATION_DUE,
                Areas.Rooms.NUMBER,
                Areas.Rooms.NAME,
                Areas.Rooms.CONDITION,
                Areas.Rooms.AREA,
                Areas.Rooms.RENOVATION_NATURE,
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
                VitalStats.BIRTH_CERT_COST,
                VitalStats.BIRTH_CERT_COPY_COST,
                VitalStats.MARRIAGE_CERT_COPY_COST,
                VitalStats.DEATH_CERT_COPY_COST,
                VitalStats.CELIBACY_CERT_COPY_COST,
                VitalStats.NON_REGISTERED_CERTS,
                VitalStats.RATES_UNDER_DELIBERATION,
                VitalStats.PRICES_DISPLAYED,
                VitalStats.MUNICIPALITY_BUDGET_2024,
                VitalStats.CS_BUDGET_2024,
                VitalStats.CS_REVENUE_2024,
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
                Comments.RELEVANT_INFO,
                Deeds.YEAR,
                Deeds.BIRTH_CERT_DRAWN,
                Deeds.BIRTH_CERT_NOT_DRAWN,
                Deeds.MARRIAGE_CERT_DRAWN,
                Deeds.MARRIAGE_CERT_NOT_DRAWN,
                Deeds.DEATH_CERT_DRAWN,
                Deeds.DEATH_CERT_NOT_DRAWN,
                StatusOfArchivedRecords.YEAR,
                StatusOfArchivedRecords.BIRTH_COUNT,
                StatusOfArchivedRecords.MARRIAGE_COUNT,
                StatusOfArchivedRecords.DEATH_COUNT,
                PersonnelInfo.MALE_COUNT,
                PersonnelInfo.FEMALE_COUNT,
                PersonnelInfo.NON_OFFICER_MALE_COUNT,
                PersonnelInfo.NON_OFFICER_FEMALE_COUNT,
                PersonnelInfo.Officers.OTHER_POSITION,
                PersonnelInfo.Officers.STATUS,
                PersonnelInfo.Officers.OTHER_STATUS,
                PersonnelInfo.Officers.TOTAL_ALLOWANCE_2022,
                PersonnelInfo.Officers.TOTAL_REVENUE_2022,
                PersonnelInfo.Officers.ARCHIVING_TRAINING,
                PersonnelInfo.Officers.CS_SENIORITY,
                FieldKeys.PersonnelInfo.PERSONNEL_NAME,
                FieldKeys.PersonnelInfo.PERSONNEL_AGE,
                FieldKeys.PersonnelInfo.PERSONNEL_PHONE,
                FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL,
                FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL,
                FieldKeys.PersonnelInfo.PERSONNEL_EMAIL,
                FieldKeys.PersonnelInfo.PERSONNEL_GENDER,
                FieldKeys.PersonnelInfo.PERSONNEL_POSITION,
                FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING
        };

        public static final class Respondent {
            public static final String NAME = "csc.form.sections.respondent.fields.name.title";
            public static final String POSITION = "csc.form.sections.respondent.fields.position.title";
            public static final String PHONE = "csc.form.sections.respondent.fields.phone.title";
            public static final String EMAIL = "csc.form.sections.respondent.fields.email.title";
            public static final String KNOWS_CREATION_DATE = "csc.form.sections.respondent.fields.knows_creation_date.title";
            public static final String CREATION_DATE = "csc.form.sections.respondent.fields.creation_date.title";
            public static final String[] ALL_FIELDS = {
                    NAME, POSITION, PHONE, EMAIL, KNOWS_CREATION_DATE, CREATION_DATE
            };
        }

        public static final class Identification {
            public static final String DIVISION = "csc.form.sections.identification.fields.division.title";
            public static final String MUNICIPALITY = "csc.form.sections.identification.fields.municipality.title";
            public static final String QUARTER = "csc.form.sections.identification.fields.quarter.title";
            public static final String FACILITY_NAME = "csc.form.sections.identification.fields.facility.title";
            public static final String CATEGORY = "csc.form.sections.identification.fields.category.title";
            public static final String TOWN_SIZE = "csc.form.sections.identification.fields.council_size.title";
            public static final String MILIEU = "csc.form.sections.identification.fields.milieu.title";
            public static final String ATTACHED_CENTERS = "csc.form.sections.identification.fields.attached_centers.title";
            public static final String LOCALITY = "csc.form.sections.identification.fields.locality.title";
            public static final String CREATION_DATE = "csc.form.sections.identification.fields.creation_date.title";
            public static final String IS_FUNCTIONAL = "csc.form.sections.identification.fields.functional.title";
            public static final String NON_FUNCTION_REASON = "csc.form.sections.identification.fields.non_function_reason.title";
            public static final String CHIEFDOM_DEGREE = "csc.form.sections.identification.fields.chiefdom_degree.title";
            public static final String OTHER_NON_FUNCTION_REASON = "csc.form.sections.identification.fields.other_non_function_reason.title";
            public static final String IS_CHIEFDOM = "csc.form.sections.identification.fields.fields.is_chiefdom.title";
            public static final String NON_FUNCTION_DURATION = "csc.form.sections.identification.fields.non_function_duration.title";
            public static final String SECONDARY_CREATION_ORDER = "csc.form.sections.identification.fields.sec_creation_order.title";
            public static final String OFFICER_APPOINTMENT_ORDER = "csc.form.sections.identification.fields.officer_appointment_order.title";
            public static final String IS_OFFICER_APPOINTED = "csc.form.sections.identification.fields.officer_appointed.title";
            public static final String PHOTO_URL = "csc.form.sections.identification.fields.photo_url.title";
            public static final String GPS_COORDS = "csc.form.sections.identification.fields.gps_coords.title";
            public static final String[] ALL_FIELDS = {
                    DIVISION, MUNICIPALITY, QUARTER, FACILITY_NAME, CATEGORY, TOWN_SIZE, MILIEU, ATTACHED_CENTERS,
                    IS_FUNCTIONAL, NON_FUNCTION_REASON, CHIEFDOM_DEGREE, OTHER_NON_FUNCTION_REASON,
                    IS_CHIEFDOM,
                    NON_FUNCTION_DURATION, SECONDARY_CREATION_ORDER, OFFICER_APPOINTMENT_ORDER, IS_OFFICER_APPOINTED,
                    PHOTO_URL, GPS_COORDS
            };
        }

        public static final class Accessibility {
            public static final String ROAD_TYPE = "csc.form.sections.accessibility.fields.road_type.title";
            public static final String DOES_ROAD_DETERIORATE = "csc.form.sections.accessibility.fields.road_deteriorates.title";
            public static final String ROAD_OBSTACLE = "csc.form.sections.accessibility.fields.obstacle.title";
            public static final String ATTACHED_VILLAGES_NUMBER = "csc.form.sections.accessibility.fields.attached_villages_num.title";
            public static final String ATTACHED_VILLAGES_LIST = "csc.form.sections.accessibility.sub_forms.attached_villages_list.title";
            public static final String COVER_RADIUS = "csc.form.sections.accessibility.fields.cover_radius.title";
            public static final String[] ALL_FIELDS = {
                    ROAD_TYPE, DOES_ROAD_DETERIORATE, ROAD_OBSTACLE, ATTACHED_VILLAGES_NUMBER,
                    COVER_RADIUS
            };

            public static final class Villages {
                public static final String NAME = "csc.form.sections.accessibility.sub_forms.villages.fields.name.title";
                public static final String DISTANCE = "csc.form.sections.accessibility.sub_forms.villages.fields.avg_distance.title";
                public static final String OBSERVATIONS = "csc.form.section.accessibility.sub_forms.villages.fields.observations.title";
                public static final String[] ALL_FIELDS = {
                        NAME, DISTANCE, OBSERVATIONS
                };
            }
        }

        public static final class Infrastructure {
            public static final String STATUS = "csc.form.sections.infra.fields.occupancy_status.title";
            public static final String OTHER_BUILDING = "csc.form.sections.infra.fields.other_building.title";
            public static final String ENEO_CONNECTION = "csc.form.sections.infra.fields.eneo_connection.title";
            public static final String POWER_OUTAGES = "csc.form.sections.infra.fields.power_outages.title";
            public static final String STABLE_POWER = "csc.form.sections.infra.fields.stable_power.title";
            public static final String BACKUP_POWER_SOURCES_AVAILABLE = "csc.form.sections.infra.fields.backup_power_available.title";
            public static final String BACKUP_POWER_SOURCES = "csc.form.sections.infra.fields.backup_power.title";
            public static final String OTHER_POWER_SOURCE = "csc.form.sections.infra.fields.other_backup_power.title";
            public static final String WATER_SOURCES = "csc.form.sections.infra.fields.water_sources.title";
            public static final String TOILETS_AVAILABLE = "csc.form.sections.infra.fields.toilets_available.title";
            public static final String SEPARATE_TOILETS_AVAILABLE = "csc.form.sections.infra.fields.separate_toilets_available.title";
            public static final String NETWORK_TYPE = "csc.form.sections.infra.fields.zone_operators.title";
            public static final String HAS_FIBER_CONNECTION = "csc.form.sections.infra.fields.has_fiber.title";
            public static final String OTHER_NETWORK_TYPE = "csc.form.sections.infra.fields.other_zone_operators.title";
            public static final String HAS_INTERNET = "csc.form.sections.infra.fields.has_internet.title";
            public static final String INTERNET_TYPE = "csc.form.sections.infra.fields.internet_type.title";
            public static final String OTHER_INTERNET_TYPE = "csc.form.sections.infra.fields.other_internet_type.title";
            public static final String INTERNET_SPONSOR = "csc.form.sections.infra.fields.internet_sponsorer.title";
            public static final String[] ALL_FIELDS = {
                    STATUS, OTHER_BUILDING, ENEO_CONNECTION, POWER_OUTAGES, STABLE_POWER,
                    BACKUP_POWER_SOURCES_AVAILABLE,
                    BACKUP_POWER_SOURCES, OTHER_POWER_SOURCE, WATER_SOURCES, TOILETS_AVAILABLE,
                    SEPARATE_TOILETS_AVAILABLE,
                    NETWORK_TYPE, HAS_FIBER_CONNECTION, OTHER_NETWORK_TYPE, HAS_INTERNET, INTERNET_TYPE,
                    OTHER_INTERNET_TYPE, INTERNET_SPONSOR
            };
        }

        public static final class Areas {
            public static final String OFFICE_COUNT = "csc.form.sections.areas.fields.office_count.title";
            public static final String DEDICATED_CS_ROOMS = "csc.form.sections.areas.fields.dedicated_cs_rooms.title";
            public static final String MOVING = "csc.form.sections.areas.fields.moving.title";
//            public static final String RENOVATION_DUE = "csc.form.sections.areas.fields.renovation_due.title";
            public static final String[] ALL_FIELDS = {
                    OFFICE_COUNT, DEDICATED_CS_ROOMS, MOVING/*, RENOVATION_DUE*/
            };

            public static final class Rooms {
                public static final String NUMBER = "csc.form.sections.areas.sub_forms.rooms.fields.number.title";
                public static final String NAME = "csc.form.sections.areas.sub_forms.rooms.fields.name.title";
                public static final String CONDITION = "csc.form.sections.areas.sub_forms.rooms.fields.condition.title";
                public static final String AREA = "csc.form.sections.areas.sub_forms.rooms.fields.dimension.title";
                public static final String RENOVATION_NATURE = "csc.form.sections.areas.sub_forms.rooms.fields.renovation.title";
                public static final String[] ALL_FIELDS = {
                        NUMBER, NAME, CONDITION, AREA, RENOVATION_NATURE
                };
            }
        }

        public static final class Equipment {
            public static final String COMPUTER_COUNT = "csc.form.sections.equipment.fields.pc_count.title";
            public static final String SERVER_COUNT = "csc.form.sections.equipment.fields.server_count.title";
            public static final String PRINTER_COUNT = "csc.form.sections.equipment.fields.printer_count.title";
            public static final String SCANNER_COUNT = "csc.form.sections.equipment.fields.scanner_count.title";
            public static final String INVERTERS_COUNT = "csc.form.sections.equipment.fields.inverters.title";
            public static final String AIR_CONDITIONER_COUNT = "csc.form.sections.equipment.fields.conditioners.title";
            public static final String FAN_COUNT = "csc.form.sections.equipment.fields.fans.title";
            public static final String PROJECTOR_COUNT = "csc.form.sections.equipment.fields.projectors.title";
            public static final String OFFICE_TABLE_COUNT = "csc.form.sections.equipment.fields.office_tables.title";
            public static final String CHAIR_COUNT = "csc.form.sections.equipment.fields.chairs.title";
            public static final String CAR_COUNT = "csc.form.sections.equipment.fields.cars.title";
            public static final String BIKE_COUNT = "csc.form.sections.equipment.fields.bikes.title";
            public static final String TABLET_COUNT = "csc.form.sections.equipment.fields.tablets.title";
            public static final String[] ALL_FIELDS = {
                    COMPUTER_COUNT, SERVER_COUNT, PRINTER_COUNT, SCANNER_COUNT, INVERTERS_COUNT, AIR_CONDITIONER_COUNT,
                    FAN_COUNT, PROJECTOR_COUNT, OFFICE_TABLE_COUNT, CHAIR_COUNT, CAR_COUNT, BIKE_COUNT, TABLET_COUNT
            };
        }

        public static final class Digitization {
            public static final String EXTERNAL_SERVICE_FROM_CR = "csc.form.sections.digitization.fields.using_info_sys_outside_cs.title";
            public static final String EXTERNAL_CR_USES_INTERNET = "csc.form.sections.digitization.fields.external_cr_uses_internet.title";
            public static final String HAS_CS_SOFTWARE = "csc.form.sections.digitization.fields.has_cs_software.title";
            public static final String CS_SOFTWARE_NAME = "csc.form.sections.digitization.fields.cs_software_name.title";
            public static final String CS_SOFTWARE_LICENSE_SPONSOR = "csc.form.sections.digitization.fields.cs_software_license_sponsor.title";
            public static final String OTHER_CS_SOFTWARE_LICENSE_SPONSOR = "csc.form.sections.digitization.fields.other_cs_software_license_sponsor.title";
            public static final String USERS_RECEIVE_DIGITAL_ACTS = "csc.form.sections.digitization.fields.users_receive_digital_acts.title";
            public static final String SOFTWARE_ACTIVATION_DATE = "csc.form.sections.digitization.fields.software_activation_date.title";
            public static final String SOFTWARE_FEEDBACK = "csc.form.sections.digitization.fields.software_feedback.title";
            public static final String SOFTWARE_TRAINED_USER_COUNT = "csc.form.sections.digitization.fields.software_trained_user_count.title";
            public static final String SOFTWARE_RECORDED_MARRIAGE_COUNT = "csc.form.sections.digitization.fields.software_recorded_marriage_count.title";
            public static final String SOFTWARE_RECORDED_BIRTHS_COUNT = "csc.form.sections.digitization.fields.software_recorded_birth_count.title";
            public static final String SOFTWARE_RECORDED_DEATH_COUNT = "csc.form.sections.digitization.fields.software_recorded_death_count.title";
            public static final String SOFTWARE_IS_WORKING = "csc.form.sections.digitization.fields.software_is_functional.title";
            public static final String SOFTWARE_DYSFUNCTION_REASON = "csc.form.sections.digitization.fields.software_dysfunction_reason.title";
            public static final String[] ALL_FIELDS = {
                    EXTERNAL_SERVICE_FROM_CR, EXTERNAL_CR_USES_INTERNET, HAS_CS_SOFTWARE, CS_SOFTWARE_NAME,
                    CS_SOFTWARE_LICENSE_SPONSOR,
                    USERS_RECEIVE_DIGITAL_ACTS, SOFTWARE_ACTIVATION_DATE, SOFTWARE_FEEDBACK,
                    SOFTWARE_TRAINED_USER_COUNT,
                    SOFTWARE_RECORDED_MARRIAGE_COUNT, SOFTWARE_RECORDED_BIRTHS_COUNT, SOFTWARE_RECORDED_DEATH_COUNT,
                    SOFTWARE_IS_WORKING, SOFTWARE_DYSFUNCTION_REASON
            };
        }

        public static final class RecordIndexing {
            public static final String RECORDS_SCANNED = "csc.form.sections.digitization.sub_forms.indexing.fields.records_scanned.title";
            public static final String STAFF_TRAINED = "csc.form.sections.digitization.sub_forms.indexing.fields.staff_trained.title";
            public static final String DOCUMENT_SCAN_START_DATE = "csc.form.sections.digitization.sub_forms.indexing.fields.document_scan_start_date.title";
            public static final String DATA_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.is_data_indexed.title";
            public static final String MARRIAGES_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.marriages_indexed.title";
            public static final String DEATHS_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.deaths_indexed.title";
            public static final String BIRTHS_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.births_indexed.title";
            public static final String MARRIAGES_SCANNED = "csc.form.sections.digitization.sub_forms.indexing.fields.marriages_scanned.title";
            public static final String BIRTHS_SCANNED = "csc.form.sections.digitization.sub_forms.indexing.fields.births_scanned.title";
            public static final String DEATHS_SCANNED = "csc.form.sections.digitization.sub_forms.indexing.fields.deaths_scanned.title";
            public static final String IS_DATA_USED_BY_CSC = "csc.form.sections.digitization.sub_forms.indexing.fields.is_data_in_use.title";
            public static final String DATA_USAGE = "csc.form.sections.digitization.sub_forms.indexing.fields.data_usage.title";
            public static final String[] ALL_FIELDS = {
                    RECORDS_SCANNED, STAFF_TRAINED, DOCUMENT_SCAN_START_DATE, DATA_INDEXED, MARRIAGES_INDEXED,
                    DEATHS_INDEXED,
                    BIRTHS_INDEXED, MARRIAGES_SCANNED, BIRTHS_SCANNED, DEATHS_SCANNED, IS_DATA_USED_BY_CSC, DATA_USAGE
            };
        }

        public static final class RecordProcurement {
            public static final String HAS_THERE_BEEN_LACK_OF_REGISTERS = "csc.form.sections.record_procurement.fields.lack_of_registers.title";
            public static final String RECORDS_PROVIDER = "csc.form.sections.record_procurement.fields.records_provider.title";
            public static final String OTHER_RECORDS_PROVIDER = "csc.form.sections.record_procurement.fields.other_records_provider.title";
            public static final String NON_COMPLIANT_REGISTERS_USED = "csc.form.sections.record_procurement.fields.non_compliant_registers_used.title";
            public static final String BLANK_REGISTRIES_COUNT = "csc.form.sections.record_procurement.fields.blank_registries.title";
            public static final String BLANK_MARRIAGES = "csc.form.sections.record_procurement.fields.blank_marriages.title";
            public static final String BLANK_BIRTHS = "csc.form.sections.record_procurement.fields.blank_births.title";
            public static final String BLANK_DEATHS = "csc.form.sections.record_procurement.fields.blank_deaths.title";
            public static final String[] ALL_FIELDS = {
                    HAS_THERE_BEEN_LACK_OF_REGISTERS, RECORDS_PROVIDER, OTHER_RECORDS_PROVIDER,
                    NON_COMPLIANT_REGISTERS_USED,
                    BLANK_REGISTRIES_COUNT, BLANK_MARRIAGES, BLANK_BIRTHS, BLANK_DEATHS
            };
        }

        public static final class VitalStats {
            public static final String BIRTH_CERT_COST = "csc.form.sections.vital_stats.fields.birth_cert_cost.title";
            public static final String BIRTH_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.birth_cert_copy_cost.title";
            public static final String MARRIAGE_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.marriage_cert_copy_cost.title";
            public static final String DEATH_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.death_cert_copy_cost.title";
            public static final String CELIBACY_CERT_COPY_COST = "csc.form.sections.vital_stats.fields.celibacy_cert_copy_cost.title";
            public static final String NON_REGISTERED_CERTS = "csc.form.sections.vital_stats.fields.non_registered_certs.title";
            public static final String RATES_UNDER_DELIBERATION = "csc.form.sections.vital_stats.fields.rates_under_deliberation.title";
            public static final String PRICES_DISPLAYED = "csc.form.sections.vital_stats.fields.prices_displayed.title";
            public static final String MUNICIPALITY_BUDGET_2024 = "csc.form.sections.vital_stats.fields.municipality_budget.title";
            public static final String CS_BUDGET_2024 = "csc.form.sections.vital_stats.fields.cs_budget.title";
            public static final String CS_REVENUE_2024 = "csc.form.sections.vital_stats.fields.cs_revenue.title";
            public static final String[] ALL_FIELDS = {
                    BIRTH_CERT_COST, BIRTH_CERT_COPY_COST, MARRIAGE_CERT_COPY_COST, DEATH_CERT_COPY_COST,
                    CELIBACY_CERT_COPY_COST,
                    NON_REGISTERED_CERTS, RATES_UNDER_DELIBERATION, PRICES_DISPLAYED, MUNICIPALITY_BUDGET_2024,
                    CS_BUDGET_2024, CS_REVENUE_2024
            };
        }

        public static final class Archiving {
            public static final String HAS_ARCHIVING_ROOM = "csc.form.sections.archiving.fields.archiving_room.title";
            public static final String ARCHIVE_ROOM_ELECTRIC_CONDITION = "csc.form.sections.archiving.fields.archiving_room_electric_condition.title";
            public static final String HAS_FIRE_EXTINGUISHERS = "csc.form.sections.archiving.fields.fire_extinguishers.title";
            public static final String LOCKED_DOOR = "csc.form.sections.archiving.fields.locked_door.title";
            public static final String IS_ARCHIVE_ROOM_ACCESS_LIMITED = "csc.form.sections.archiving.fields.access_limited.title";
            public static final String ROOM_HAS_HUMIDITY = "csc.form.sections.archiving.fields.room_has_humidity.title";
            public static final String REGISTER_ARCHIVING_TYPE = "csc.form.sections.archiving.fields.register_archiving_type.title";
            public static final String OTHER_ARCHIVING_TYPE = "csc.form.sections.archiving.fields.other_register_archiving_type.title";
            public static final String WRITTEN_ARCHIVING_PLAN = "csc.form.sections.archiving.fields.written_archiving_plan.title";
            public static final String REGISTERS_DEPOSITED = "csc.form.sections.archiving.fields.registers_deposited.title";
            public static final String REGISTERS_DEPOSITED_SYSTEMATICALLY = "csc.form.sections.archiving.fields.registers_deposited_systematically.title";
            public static final String VANDALIZED = "csc.form.sections.archiving.fields.vandalized.title";
            public static final String VANDALIZED_DATE = "csc.form.sections.archiving.fields.vandalized_date.title";
            public static final String[] ALL_FIELDS = {
                    HAS_ARCHIVING_ROOM, ARCHIVE_ROOM_ELECTRIC_CONDITION, HAS_FIRE_EXTINGUISHERS, LOCKED_DOOR,
                    IS_ARCHIVE_ROOM_ACCESS_LIMITED, ROOM_HAS_HUMIDITY, REGISTER_ARCHIVING_TYPE, OTHER_ARCHIVING_TYPE,
                    WRITTEN_ARCHIVING_PLAN, REGISTERS_DEPOSITED, REGISTERS_DEPOSITED_SYSTEMATICALLY, VANDALIZED,
                    VANDALIZED_DATE
            };
        }

        public static final class Comments {
            public static final String RELEVANT_INFO = "csc.form.sections.comments.fields.relevant_info.title";
            public static final String[] ALL_FIELDS = { RELEVANT_INFO };
        }

        public static final class Deeds {
            public static final String YEAR = "csc.form.sections.deeds.fields.year.title";
            public static final String BIRTH_CERT_DRAWN = "csc.form.sections.deeds.fields.birth_certs_drawn.title";
            public static final String BIRTH_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.births_certs_not_withdrawn.title";
            public static final String MARRIAGE_CERT_DRAWN = "csc.form.sections.deeds.fields.marriage_certs_drawn.title";
            public static final String MARRIAGE_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.marriage_certs_not_withdrawn.title";
            public static final String DEATH_CERT_DRAWN = "csc.form.sections.deeds.fields.death_certs_drawn.title";
            public static final String DEATH_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.death_certs_not_withdrawn.title";
            public static final String[] ALL_FIELDS = {
                    YEAR, BIRTH_CERT_DRAWN, BIRTH_CERT_NOT_DRAWN, MARRIAGE_CERT_DRAWN, MARRIAGE_CERT_NOT_DRAWN,
                    DEATH_CERT_DRAWN, DEATH_CERT_NOT_DRAWN
            };
        }

        public static final class StatusOfArchivedRecords {
            public static final String YEAR = "csc.form.sections.archive_stats.fields.year.title";
            public static final String BIRTH_COUNT = "csc.form.sections.archive_stats.fields.birth_count.title";
            public static final String MARRIAGE_COUNT = "csc.form.sections.archive_stats.fields.marriage_count.title";
            public static final String DEATH_COUNT = "csc.form.sections.archive_stats.fields.death_count.title";
            public static final String[] ALL_FIELDS = {
                    YEAR, BIRTH_COUNT, MARRIAGE_COUNT, DEATH_COUNT
            };
        }

        public static final class PersonnelInfo {
            public static final String MALE_COUNT = "csc.form.sections.personnel_info.fields.male_count.title";
            public static final String FEMALE_COUNT = "csc.form.sections.personnel_info.fields.female_count.title";
            public static final String NON_OFFICER_MALE_COUNT = "csc.form.sections.personnel_info.fields.non_officer_male_count.title";
            public static final String NON_OFFICER_FEMALE_COUNT = "csc.form.sections.personnel_info.fields.non_officer_female_count.title";
            public static final String[] ALL_FIELDS = {
                    MALE_COUNT, FEMALE_COUNT, NON_OFFICER_MALE_COUNT, NON_OFFICER_FEMALE_COUNT
            };

            public static final class Officers {
                public static final String OTHER_POSITION = "csc.form.sections.personnel_info.sub_forms.officers.fields.other_position.title";
                public static final String STATUS = "csc.form.sections.personnel_info.sub_forms.officers.fields.status.title";
                public static final String OTHER_STATUS = "csc.form.sections.personnel_info.sub_forms.officers.fields.other_status.title";
                public static final String TOTAL_ALLOWANCE_2022 = "csc.form.sections.personnel_info.sub_forms.officers.fields.allowance_2022.title";
                public static final String TOTAL_REVENUE_2022 = "csc.form.sections.personnel_info.sub_forms.officers.fields.revenue_2022.title";
                public static final String ARCHIVING_TRAINING = "csc.form.sections.personnel_info.sub_forms.officers.fields.archiving_training.title";
                public static final String CS_SENIORITY = "csc.form.sections.personnel_info.sub_forms.officers.fields.seniority.title";
                public static final String[] ALL_FIELDS = {
                        OTHER_POSITION, STATUS, OTHER_STATUS, TOTAL_ALLOWANCE_2022, TOTAL_REVENUE_2022,
                        ARCHIVING_TRAINING, CS_SENIORITY
                };
            }
        }
    }
}
