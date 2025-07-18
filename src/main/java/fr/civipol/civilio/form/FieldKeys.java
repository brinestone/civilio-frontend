package fr.civipol.civilio.form;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.preferencesfx.formsfx.view.controls.SimpleTextControl;
import com.dlsc.preferencesfx.model.Category;
import com.dlsc.preferencesfx.model.Group;
import com.dlsc.preferencesfx.model.Setting;
import fr.civipol.civilio.domain.FieldMappingSource;
import fr.civipol.civilio.entity.FormType;
import javafx.beans.property.Property;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.transformation.FilteredList;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;

import java.util.Objects;
import java.util.function.Function;

@SuppressWarnings({"DuplicatedCode"})
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
        public static final String[] ALL_FIELDS = {PERSONNEL_NAME, PERSONNEL_AGE, PERSONNEL_PHONE, PERSONNEL_AGE,
                PERSONNEL_GENDER, PERSONNEL_EMAIL, PERSONNEL_COMPUTER_LEVEL, PERSONNEL_CS_TRAINING, PERSONNEL_ED_LEVEL,
                PERSONNEL_POSITION};
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
        //        public static final String RECEPTION_AREA = "chefferie.form.fields.reception.title";
//        public static final String OTHER_RECEPTION_AREA = "chefferie.form.fields.other_recep.title";
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
        public static final class Respondent {
            public static final String NAME = "csc.form.sections.respondent.fields.name.title";
            public static final String POSITION = "csc.form.sections.respondent.fields.position.title";
            public static final String PHONE = "csc.form.sections.respondent.fields.phone.title";
            public static final String EMAIL = "csc.form.sections.respondent.fields.email.title";
        }
        public static final class Identification {
            public static final String DEPARTMENT = "csc.form.sections.identification.fields.division.title";
            public static final String MUNICIPALITY = "csc.form.sections.identification.fields.municipality.title";
            public static final String QUARTER = "csc.form.sections.identification.fields.quarter.title";
            public static final String FACILITY_NAME = "csc.form.sections.identification.fields.facility.title";
            public static final String CATEGORY = "csc.form.sections.identification.fields.category.title";
            public static final String COUNCIL_SIZE = "csc.form.sections.identification.fields.council_size.title";
            public static final String MILIEU = "csc.form.sections.identification.fields.milieu.title";
            public static final String ATTACHED_CENTERS = "csc.form.sections.identification.fields.milieu.title";
            public static final String LOCALITY = "csc.form.sections.identification.fields.locality.title";
            public static final String CREATION_DATE = "csc.form.sections.identification.fields.creation.title";
            public static final String IS_FUNCTIONAL = "csc.form.sections.identification.fields.functional.title";
            public static final String NON_FUNCTION_REASON = "csc.form.sections.identification.fields.non_function_reason.title";
            public static final String OTHER_NON_FUNCTION_REASON = "csc.form.sections.identification.fields.other_non_function_reason.title";
            public static final String NON_FUNCTION_DURATION = "csc.form.sections.identification.fields.non_function_duration.title";
            public static final String SECONDARY_CREATION_ORDER = "csc.form.sections.identification.fields.sec_creation_order.title";
            public static final String OFFICER_APPOINTMENT_ORDER = "csc.form.sections.identification.fields.officer_appointment_order.title";
            public static final String PHOTO_URL = "csc.form.sections.identification.fields.photo_url.title";
            public static final String GPS_COORDS = "csc.form.sections.identification.fields.gps_coords.title";
        }
        public static final class Accessibility {
            public static final String ROAD_TYPE = "csc.form.sections.accessibility.fields.road_type.title";
            public static final String DOES_ROAD_DETERIORATE = "csc.form.sections.accessibility.fields.road_deteriorates.title";
            public static final String ROAD_OBSTACLE = "csc.form.sections.accessibility.fields.obstacle.title";
            public static final String ATTACHED_VILLAGES_NUMBER = "csc.form.sections.accessibility.fields.attached_villages_num.title";
            public static final String ATTACHED_VILLAGES_LIST = "csc.form.sections.accessibility.sub_forms.attached_villages_list.title";
            public static final String COVER_RADIUS = "csc.form.sections.accessibility.fields.cover_radius.title";

            public static final class Villages {
                public static final String NAME = "csc.form.sections.accessibility.sub_forms.villages.fields.name.title";
                public static final String DISTANCE = "csc.form.sections.accessibility.sub_forms.villages.fields.avg_distance.title";
                public static final String OBSERVATIONS = "csc.form.section.accessibility.sub_forms.villages.fields.observations.title";

            }
        }
        public static final class Infrastructure {
            public static final String STATUS = "csc.form.sections.infra.fields.occupancy_status.title";
            public static final String ENEO_CONNECTION = "csc.form.sections.infra.fields.eneo_connection.title";
            public static final String POWER_OUTAGES = "csc.form.sections.infra.fields.power_outages.title";
            public static final String STABLE_POWER = "csc.form.sections.infra.fields.stable_power.title";
            public static final String BACKUP_POWER_SOURCES_AVAILABLE = "csc.form.sections.infra.fields.backup_power_available.title";
            public static final String BACKUP_POWER_SOURCES = "csc.form.sections.infra.fields.backup_power.title";
            public static final String WATER_SOURCES = "csc.form.sections.infra.fields.water_sources.title";
            public static final String TOILETS_AVAILABLE = "csc.form.sections.infra.fields.toilets_available.title";
            public static final String NETWORK_TYPE = "csc.form.sections.infra.fields.zone_operators.title";
            public static final String OTHER_NETWORK_TYPE = "csc.form.sections.infra.fields.other_zone_operators.title";
            public static final String HAS_INTERNET = "csc.form.sections.infra.fields.has_internet.title";
            public static final String INTERNET_TYPE = "csc.form.sections.infra.fields.internet_type.title";
            public static final String OTHER_INTERNET_TYPE = "csc.form.sections.infra.fields.other_internet_type.title";
            public static final String INTERNET_SPONSOR = "csc.form.sections.infra.fields.internet_sponsor.title";
        }
        public static final class Areas {
            public static final String OFFICE_COUNT = "csc.form.sections.areas.fields.office_count.title";
            public static final String DEDICATED_CS_ROOMS = "csc.form.sections.areas.fields.dedicated_cs_rooms.title";
            public static final String MOVING = "csc.form.sections.areas.fields.moving.title";
            public static final String RENOVATION_DUE = "csc.form.sections.areas.fields.renovation_due.title";

            public static final class Rooms {
                public static final String NAME = "csc.form.sections.areas.sub_forms.rooms.fields.name.title";
                public static final String CONDITION = "csc.form.sections.areas.sub_forms.rooms.fields.condition.title";
                public static final String DIMENSION = "csc.form.sections.areas.sub_forms.rooms.fields.dimension.title";
                public static final String RENOVATION_NATURE = "csc.form.sections.areas.sub_forms.rooms.fields.renovation.title";
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
        }
        public static final class Digitization {
            public static final String EXTERNAL_SERVICE_FROM_CR = "csc.form.sections.digitization.fields.using_info_sys_outside_cs.title";
            public static final String EXTERNAL_CR_USES_INTERNET = "csc.form.sections.digitization.fields.external_cr_uses_internet.title";
            public static final String HAS_CS_SOFTWARE = "csc.form.sections.digitization.fields.has_cs_software.title";
            public static final String CS_SOFTWARE_NAME = "csc.form.sections.digitization.fields.cs_software_name.title";
            public static final String CS_SOFTWARE_LICENSE_SPONSOR = "csc.form.sections.digitization.fields.cs_software_license_sponsor.title";
            public static final String USERS_RECEIVE_DIGITAL_ACTS = "csc.form.sections.digitization.fields.users_receive_digital_acts.title";
            public static final String SOFTWARE_ACTIVATION_DATE = "csc.form.sections.digitization.fields.software_activation_date.title";
            public static final String SOFTWARE_FEEDBACK = "csc.form.sections.digitization.fields.software_feedback.title";
            public static final String SOFTWARE_TRAINED_USER_COUNT = "csc.form.sections.digitization.fields.software_trained_user_count.title";
            public static final String SOFTWARE_RECORDED_MARRIAGE_COUNT = "csc.form.sections.digitization.fields.software_recorded_marriage_count.title";
            public static final String SOFTWARE_RECORDED_BIRTHS_COUNT = "csc.form.sections.digitization.fields.software_recorded_birth_count.title";
            public static final String SOFTWARE_RECORDED_DEATH_COUNT = "csc.form.sections.digitization.fields.software_recorded_death_count.title";
            public static final String SOFTWARE_IS_WORKING = "csc.form.sections.digitization.fields.software_is_functional.title";
            public static final String SOFTWARE_DYSFUNCTION_REASON = "csc.form.sections.digitization.fields.software_dysfunction_reason.title";

            public static final class RecordIndexing {
                public static final String RECORDS_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.records_indexed.title";
                public static final String STAFF_TRAINED = "csc.form.sections.digitization.sub_forms.indexing.fields.staff_trained.title";
                public static final String INDEXING_DATE = "csc.form.sections.digitization.sub_forms.indexing.fields.index_date.title";
                public static final String DATA_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.is_data_indexed.title";
                public static final String MARRIAGES_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.marriages_indexed.title";
                public static final String DEATHS_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.deaths_indexed.title";
                public static final String BIRTHS_INDEXED = "csc.form.sections.digitization.sub_forms.indexing.fields.births_indexed.title";
                public static final String MARRIAGES_SCANNED = "csc.form.sections.digitization.sub_forms.indexing.fields.marriages_scanned.title";
                public static final String BIRTHS_SCANNED = "csc.form.sections.digitization.sub_forms.indexing.fields.births_scanned.title";
                public static final String DEATHS_SCANNED = "csc.form.sections.digitization.sub_forms.indexing.fields.deaths_scanned.title";
                public static final String IS_DATA_USED_BY_CSC = "csc.form.sections.digitization.sub_forms.indexing.fields.is_data_in_use.title";
                public static final String DATA_USAGE = "csc.form.sections.digitization.sub_forms.indexing.fields.data_usage.title";
            }
        }
        public static final class RecordProcurement {
            public static final String HAS_THERE_BEEN_LACK_OF_REGISTERS = "csc.form.sections.record_procurement.fields.lack_of_registers.title";
            public static final String RECORDS_PROVIDER = "csc.form.sections.record_procurement.fields.records_provider.title";
            public static final String NON_COMPLIANT_REGISTERS_USED = "csc.form.sections.record_procurement.fields.non_compliant_registers_used.title";
            public static final String BLANK_REGISTRIES_COUNT = "csc.form.sections.record_procurement.fields.blank_registries.title";
            public static final String BLANK_MARRIAGES = "csc.form.sections.record_procurement.fields.blank_marriages.title";
            public static final String BLANK_BIRTHS = "csc.form.sections.record_procurement.fields.blank_births.title";
            public static final String BLANK_DEATHS = "csc.form.sections.record_procurement.fields.blank_deaths.title";
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
        }
        public static final class Archiving {
            public static final String HAS_ARCHIVING_ROOM = "csc.form.sections.archiving.fields.archiving_room.title";
            public static final String ARCHIVE_ROOM_ELECTRIC_CONDITION = "csc.form.sections.archiving.fields.archiving_room_electric_condition.title";
            public static final String HAS_FIRE_EXTINGUISHERS = "csc.form.sections.archiving.fields.fire_extinguishers.title";
            public static final String LOCKED_DOOR = "csc.form.sections.archiving.fields.locked_door.title";
            public static final String IS_ARCHIVE_ROOM_ACCESS_LIMITED = "csc.form.sections.archiving.fields.access_limited.title";
            public static final String ROOM_HAS_HUMIDITY = "csc.form.sections.archiving.fields.room_has_humidity.title";
            public static final String REGISTER_ARCHIVING_TYPE = "csc.form.sections.archiving.fields.register_archiving_type.title";
            public static final String WRITTEN_ARCHIVING_PLAN = "csc.form.sections.archiving.fields.written_archiving_plan.title";
            public static final String REGISTERS_DEPOSITED = "csc.form.sections.archiving.fields.registers_deposited.title";
            public static final String REGISTERS_DEPOSITED_SYSTEMATICALLY = "csc.form.sections.archiving.fields.registers_deposited_systematically.title";
            public static final String VANDALIZED = "csc.form.sections.archiving.fields.vandalized.title";
            public static final String VANDALIZED_DATE = "csc.form.sections.archiving.fields.vandalized_date.title";
        }
        public static final class Deeds {
            public static final String YEAR = "csc.form.sections.deeds.fields.year.title";
            public static final String BIRTH_CERT_DRAWN = "csc.form.sections.deeds.fields.birth_certs_drawn.title";
            public static final String BIRTH_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.births_certs_not_withdrawn.title";
            public static final String MARRIAGE_CERT_DRAWN = "csc.form.sections.deeds.fields.marriage_certs_drawn.title";
            public static final String MARRIAGE_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.marriage_certs_not_withdrawn.title";
            public static final String DEATH_CERT_DRAWN = "csc.form.sections.deeds.fields.death_certs_drawn.title";
            public static final String DEATH_CERT_NOT_DRAWN = "csc.form.sections.deeds.fields.death_certs_not_withdrawn.title";
        }
        public static final class StatusOfArchivedRecords {
            public static final String YEAR = "csc.form.sections.archive_stats.fields.year.title";
            public static final String TYPE = "csc.form.sections.archive_stats.fields.type.title";
            public static final String TOTAL_REGISTERED = "csc.form.sections.archive_stats.fields.total_registered.title";
            public static final String TO_BE_RESTORED = "csc.form.sections.archive_stats.fields.to_be_restored.title";
            public static final String TO_BE_RECONSTITUTED = "csc.form.sections.archive_stats.fields.to_be_reconstituted.title";
            public static final String OBSERVATIONS = "csc.form.sections.archive_stats.fields.observations.title";
        }
        public static final class PersonnelInfo {
            public static final String MALE_COUNT = "csc.form.sections.personnel_info.fields.male_count.title";
            public static final String FEMALE_COUNT = "csc.form.sections.personnel_info.fields.female_count.title";

            public static final class Officers {
                public static final String NAME = "csc.form.sections.personnel_info.sub_forms.fields.name.title";
                public static final String STATUS = "csc.form.sections.personnel_info.sub_forms.fields.status.title";
                public static final String PHONE = "csc.form.sections.personnel_info.sub_forms.fields.phone.title";
                public static final String EMAIL = "csc.form.sections.personnel_info.sub_forms.fields.email.title";
                public static final String TOTAL_ALLOWANCE_2022 = "csc.form.sections.personnel_info.sub_forms.fields.allowance_2022.title";
                public static final String TOTAL_REVENUE_2022 = "csc.form.sections.personnel_info.sub_forms.fields.revenue_2022.title";
                public static final String CS_TRAINING = "csc.form.sections.personnel_info.sub_forms.fields.cs_training.title";
            }
        }
    }

    @SuppressWarnings("rawtypes")
    public static Category chiefdomFieldSettingsCategory(FieldMappingSource fieldMappingSource) {
        final var fieldMap = FXCollections.<String, Property>observableHashMap();
        final var allFields = FXCollections.<String>observableArrayList();
        fieldMappingSource.findAllDbColumns(FormType.CHIEFDOM, allFields::setAll);
        Function<String, Setting> settingFactory = k -> Setting.of(k,
                Field.ofStringType((StringProperty) fieldMap.computeIfAbsent(k, kk -> new SimpleStringProperty()))
                        .validate(CustomValidator.forPredicate(v -> allFields.stream().anyMatch(s -> s.equals(v)),
                                "fosa.form.msg.invalid_value"))
                        .render(new SimpleTextControl() {
                            private final FilteredList<String> suggestions = allFields
                                    .filtered(StringUtils::isNotBlank);

                            @Override
                            public void initializeParts() {
                                super.initializeParts();
                                TextFields.bindAutoCompletion(editableField, param -> suggestions);
                            }

                            @Override
                            public void setupValueChangedListeners() {
                                super.setupValueChangedListeners();
                                editableField.textProperty().addListener((ob, ov, nv) -> {
                                    if (StringUtils.isBlank(nv)) {
                                        suggestions.setPredicate(__ -> false);
                                    } else {
                                        suggestions.setPredicate(f -> {
                                            for (var entry : fieldMap.entrySet()) {
                                                if (entry.getKey().equals(k) || entry.getValue() == null)
                                                    continue;
                                                final var otherProperty = entry.getValue();
                                                if (otherProperty.getValue() instanceof String s) {
                                                    if (s.equalsIgnoreCase(f))
                                                        return false;
                                                } else if (Objects.equals(otherProperty.getValue(), f))
                                                    return false;
                                            }
                                            return f.toLowerCase().contains(nv.toLowerCase());
                                        });
                                    }
                                });
                            }
                        }),
                fieldMap.get(k));
        return Category.of("shell.menu.forms.chefferie",
                        Group.of(
                                "mapper.categories.forms.chefferie.base_fields.title",
                                settingFactory.apply(Chiefdom.INDEX),
                                settingFactory.apply(Chiefdom.VALIDATION_CODE),
                                settingFactory.apply(Chiefdom.RESPONDENT_NAME),
                                settingFactory.apply(Chiefdom.POSITION),
                                settingFactory.apply(Chiefdom.PHONE),
                                settingFactory.apply(Chiefdom.EMAIL),
//                                settingFactory.apply(Chefferie.CREATION_DATE),
                                settingFactory.apply(Chiefdom.DIVISION),
                                settingFactory.apply(Chiefdom.MUNICIPALITY),
                                settingFactory.apply(Chiefdom.QUARTER),
                                settingFactory.apply(Chiefdom.FACILITY_NAME),
                                settingFactory.apply(Chiefdom.CLASSIFICATION),
                                settingFactory.apply(Chiefdom.HEALTH_CENTER_PROXIMITY),
                                settingFactory.apply(Chiefdom.GPS_COORDS),
                                settingFactory.apply(Chiefdom.CHIEF_OATH),
//                                settingFactory.apply(Chefferie.OTHER_RECEPTION_AREA),
                                settingFactory.apply(Chiefdom.IS_CHIEF_CS_OFFICER),
                                settingFactory.apply(Chiefdom.CS_REG_LOCATION),
                                settingFactory.apply(Chiefdom.OTHER_CS_REG_LOCATION),
                                settingFactory.apply(Chiefdom.CS_OFFICER_TRAINED),
                                settingFactory.apply(Chiefdom.WAITING_ROOM),
                                settingFactory.apply(Chiefdom.OTHER_WAITING_ROOM),
//                                settingFactory.apply(Chefferie.RECEPTION_AREA),
                                settingFactory.apply(Chiefdom.TOILETS_ACCESSIBLE),
                                settingFactory.apply(Chiefdom.INTERNET_TYPE),
                                settingFactory.apply(Chiefdom.WATER_SOURCES),
                                settingFactory.apply(Chiefdom.OTHER_WATER_SOURCE),
                                settingFactory.apply(Chiefdom.PC_COUNT),
                                settingFactory.apply(Chiefdom.TABLET_COUNT),
                                settingFactory.apply(Chiefdom.PRINTER_COUNT),
                                settingFactory.apply(Chiefdom.CAR_COUNT),
                                settingFactory.apply(Chiefdom.BIKE_COUNT),
                                settingFactory.apply(Chiefdom.IS_CHIEFDOM_CHIEF_RESIDENCE),
                                settingFactory.apply(Chiefdom.HAS_INTERNET),
                                settingFactory.apply(Chiefdom.HAS_ENEO_CONNECTION),
                                settingFactory.apply(Chiefdom.WATER_ACCESS),
                                settingFactory.apply(Chiefdom.HAS_EXTINGUISHER),
                                settingFactory.apply(Chiefdom.EMPLOYEE_COUNT),
                                settingFactory.apply(Chiefdom.EXTRA_INFO)
                        )
                )
                .subCategories(
                        Category.of("mapper.categories.forms.chefferie.sub_forms.data_personnel.title",
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.data_personnel.title",
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_NAME),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_POSITION),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_GENDER),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_PHONE),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_EMAIL),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_AGE),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_CS_TRAINING),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_ED_LEVEL),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_COMPUTER_LEVEL))));
    }

    @SuppressWarnings("rawtypes")
    public static Category fosaFieldSettingsCategory(FieldMappingSource fieldMappingSource) {
        final var fieldMap = FXCollections.<String, Property>observableHashMap();
        final var allFields = FXCollections.<String>observableArrayList();
        fieldMappingSource.findAllDbColumns(FormType.FOSA, allFields::setAll);

        Function<String, Setting> settingFactory = k -> Setting.of(k,
                Field.ofStringType((StringProperty) fieldMap.computeIfAbsent(k, kk -> new SimpleStringProperty()))
                        .validate(CustomValidator.forPredicate(v -> allFields.stream().anyMatch(s -> s.equals(v)),
                                "fosa.form.msg.invalid_value"))
                        .render(new SimpleTextControl() {
                            private final FilteredList<String> suggestions = allFields
                                    .filtered(StringUtils::isNotBlank);

                            @Override
                            public void initializeParts() {
                                super.initializeParts();
                                TextFields.bindAutoCompletion(editableField, param -> suggestions);
                            }

                            @Override
                            public void setupValueChangedListeners() {
                                super.setupValueChangedListeners();
                                editableField.textProperty().addListener((ob, ov, nv) -> {
                                    if (StringUtils.isBlank(nv)) {
                                        suggestions.setPredicate(__ -> false);
                                    } else {
                                        suggestions.setPredicate(f -> {
                                            for (var entry : fieldMap.entrySet()) {
                                                if (entry.getKey().equals(k) || entry.getValue() == null)
                                                    continue;
                                                final var otherProperty = entry.getValue();
                                                if (otherProperty.getValue() instanceof String s) {
                                                    if (s.equalsIgnoreCase(f))
                                                        return false;
                                                } else if (Objects.equals(otherProperty.getValue(), f))
                                                    return false;
                                            }
                                            return f.toLowerCase().contains(nv.toLowerCase());
                                        });
                                    }
                                });
                            }
                        }),
                fieldMap.get(k));
        return Category.of("shell.menu.forms.fosa",
                        Group.of("mapper.categories.forms.fosa.base_fields.title",
                                settingFactory.apply(Fosa.INDEX),
                                settingFactory.apply(Fosa.VALIDATION_CODE),
                                settingFactory.apply(Fosa.RESPONDING_DEVICE),
                                settingFactory.apply(Fosa.RESPONDENT_NAME),
                                settingFactory.apply(Fosa.POSITION),
                                settingFactory.apply(Fosa.PHONE),
                                settingFactory.apply(Fosa.MAIL),
                                settingFactory.apply(Fosa.CREATION_DATE),
                                settingFactory.apply(Fosa.DIVISION),
                                settingFactory.apply(Fosa.MUNICIPALITY),
                                settingFactory.apply(Fosa.QUARTER),
                                settingFactory.apply(Fosa.LOCALITY),
                                settingFactory.apply(Fosa.OFFICE_NAME),
                                settingFactory.apply(Fosa.DISTRICT),
                                settingFactory.apply(Fosa.HEALTH_AREA),
                                settingFactory.apply(Fosa.ENVIRONMENT_TYPE),
                                settingFactory.apply(Fosa.FACILITY_TYPE),
                                settingFactory.apply(Fosa.STATUS),
                                settingFactory.apply(Fosa.HAS_MATERNITY),
                                settingFactory.apply(Fosa.ATTACHED_CSC),
                                settingFactory.apply(Fosa.CSC_DISTANCE),
                                settingFactory.apply(Fosa.GEO_POINT),
                                settingFactory.apply(Fosa.USES_DHIS),
                                settingFactory.apply(Fosa.USES_BUNEC_BIRTH_FORM),
                                settingFactory.apply(Fosa.USES_DHIS_FORMS),
                                settingFactory.apply(Fosa.SEND_BIRTH_DECLARATIONS_TO_CSC),
                                settingFactory.apply(Fosa.CSC_EVENT_REGISTRATIONS),
                                settingFactory.apply(Fosa.HAS_TOILET_FIELD),
                                settingFactory.apply(Fosa.HAS_ENEO_CONNECTION),
                                settingFactory.apply(Fosa.HAS_BACKUP_POWER_SOURCE),
                                settingFactory.apply(Fosa.BACKUP_POWER_SOURCES),
                                settingFactory.apply(Fosa.HAS_INTERNET_CONNECTION),
                                settingFactory.apply(Fosa.HAS_WATER_SOURCES),
                                settingFactory.apply(Fosa.WATER_SOURCES),
                                settingFactory.apply(Fosa.PC_COUNT),
                                settingFactory.apply(Fosa.PRINTER_COUNT),
                                settingFactory.apply(Fosa.TABLET_COUNT),
                                settingFactory.apply(Fosa.CAR_COUNT),
                                settingFactory.apply(Fosa.BIKE_COUNT),
                                settingFactory.apply(Fosa.PERSONNEL_COUNT)))
                .subCategories(
                        Category.of("mapper.categories.forms.fosa.sub_forms.title",
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.data_personnel.title",
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_NAME),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_POSITION),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_GENDER),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_PHONE),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_EMAIL),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_AGE),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_CS_TRAINING),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_ED_LEVEL),
                                        settingFactory.apply(PersonnelInfo.PERSONNEL_COMPUTER_LEVEL)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_0.title",
                                        settingFactory.apply(Fosa.STATS_YEAR_1),
                                        settingFactory.apply(Fosa.STATS_BIRTH_COUNT_1),
                                        settingFactory.apply(Fosa.STATS_DEATH_COUNT_1)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_1.title",
                                        settingFactory.apply(Fosa.STATS_YEAR_2),
                                        settingFactory.apply(Fosa.STATS_BIRTH_COUNT_2),
                                        settingFactory.apply(Fosa.STATS_DEATH_COUNT_2)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_2.title",
                                        settingFactory.apply(Fosa.STATS_YEAR_3),
                                        settingFactory.apply(Fosa.STATS_BIRTH_COUNT_3),
                                        settingFactory.apply(Fosa.STATS_DEATH_COUNT_3)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_3.title",
                                        settingFactory.apply(Fosa.STATS_YEAR_4),
                                        settingFactory.apply(Fosa.STATS_BIRTH_COUNT_4),
                                        settingFactory.apply(Fosa.STATS_DEATH_COUNT_4)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_4.title",
                                        settingFactory.apply(Fosa.STATS_YEAR_5),
                                        settingFactory.apply(Fosa.STATS_BIRTH_COUNT_5),
                                        settingFactory.apply(Fosa.STATS_DEATH_COUNT_5))));
    }
}
