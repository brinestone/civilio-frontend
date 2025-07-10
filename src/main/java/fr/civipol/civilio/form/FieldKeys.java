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
        public static final String[] ALL_FIELDS = {PERSONNEL_NAME, PERSONNEL_AGE, PERSONNEL_PHONE, PERSONNEL_AGE,
                PERSONNEL_GENDER, PERSONNEL_EMAIL, PERSONNEL_COMPUTER_LEVEL, PERSONNEL_CS_TRAINING, PERSONNEL_ED_LEVEL,
                PERSONNEL_POSITION};

        public static class Chefferie {
            public static final String PERSONNEL_NAME = "data_chefferie_personnel.columns.name.title";
            public static final String PERSONNEL_POSITION = "data_chefferie_personnel.columns.role.title";
            public static final String PERSONNEL_GENDER = "data_chefferie_personnel.columns.gender.title";
            public static final String PERSONNEL_PHONE = "data_chefferie_personnel.columns.phone.title";
            public static final String PERSONNEL_EMAIL = "data_chefferie_personnel.columns.email.title";
            public static final String PERSONNEL_AGE = "data_chefferie_personnel.columns.age.title";
            public static final String PERSONNEL_CS_TRAINING = "data_chefferie_personnel.columns.has_cs_training.title";
            public static final String PERSONNEL_ED_LEVEL = "data_chefferie_personnel.columns.education_level.title";
            public static final String PERSONNEL_COMPUTER_LEVEL = "data_chefferie_personnel.columns.pc_knowledge.title";
            public static final String[] ALL_FIELDS = {PERSONNEL_NAME, PERSONNEL_AGE, PERSONNEL_PHONE, PERSONNEL_AGE,
                    PERSONNEL_GENDER, PERSONNEL_EMAIL, PERSONNEL_COMPUTER_LEVEL, PERSONNEL_CS_TRAINING, PERSONNEL_ED_LEVEL,
                    PERSONNEL_POSITION};
        }
    }

    public static class Chefferie {
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

    @SuppressWarnings("rawtypes")
    public static Category chefferieFieldSettingsCategory(FieldMappingSource fieldMappingSource) {
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
                                settingFactory.apply(Chefferie.INDEX),
                                settingFactory.apply(Chefferie.VALIDATION_CODE),
                                settingFactory.apply(Chefferie.RESPONDENT_NAME),
                                settingFactory.apply(Chefferie.POSITION),
                                settingFactory.apply(Chefferie.PHONE),
                                settingFactory.apply(Chefferie.EMAIL),
//                                settingFactory.apply(Chefferie.CREATION_DATE),
                                settingFactory.apply(Chefferie.DIVISION),
                                settingFactory.apply(Chefferie.MUNICIPALITY),
                                settingFactory.apply(Chefferie.QUARTER),
                                settingFactory.apply(Chefferie.FACILITY_NAME),
                                settingFactory.apply(Chefferie.CLASSIFICATION),
                                settingFactory.apply(Chefferie.HEALTH_CENTER_PROXIMITY),
                                settingFactory.apply(Chefferie.GPS_COORDS),
                                settingFactory.apply(Chefferie.CHIEF_OATH),
//                                settingFactory.apply(Chefferie.OTHER_RECEPTION_AREA),
                                settingFactory.apply(Chefferie.IS_CHIEF_CS_OFFICER),
                                settingFactory.apply(Chefferie.CS_REG_LOCATION),
                                settingFactory.apply(Chefferie.OTHER_CS_REG_LOCATION),
                                settingFactory.apply(Chefferie.CS_OFFICER_TRAINED),
                                settingFactory.apply(Chefferie.WAITING_ROOM),
                                settingFactory.apply(Chefferie.OTHER_WAITING_ROOM),
//                                settingFactory.apply(Chefferie.RECEPTION_AREA),
                                settingFactory.apply(Chefferie.TOILETS_ACCESSIBLE),
                                settingFactory.apply(Chefferie.INTERNET_TYPE),
                                settingFactory.apply(Chefferie.WATER_SOURCES),
                                settingFactory.apply(Chefferie.OTHER_WATER_SOURCE),
                                settingFactory.apply(Chefferie.PC_COUNT),
                                settingFactory.apply(Chefferie.TABLET_COUNT),
                                settingFactory.apply(Chefferie.PRINTER_COUNT),
                                settingFactory.apply(Chefferie.CAR_COUNT),
                                settingFactory.apply(Chefferie.BIKE_COUNT),
                                settingFactory.apply(Chefferie.IS_CHIEFDOM_CHIEF_RESIDENCE),
                                settingFactory.apply(Chefferie.HAS_INTERNET),
                                settingFactory.apply(Chefferie.HAS_ENEO_CONNECTION),
                                settingFactory.apply(Chefferie.WATER_ACCESS),
                                settingFactory.apply(Chefferie.HAS_EXTINGUISHER),
                                settingFactory.apply(Chefferie.EMPLOYEE_COUNT),
                                settingFactory.apply(Chefferie.EXTRA_INFO)
                        )
                )
                .subCategories(
                        Category.of("mapper.categories.forms.chefferie.sub_forms.data_personnel.title",
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.data_personnel.title",
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_NAME),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_POSITION),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_GENDER),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_PHONE),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_EMAIL),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_AGE),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_CS_TRAINING),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_ED_LEVEL),
                                        settingFactory.apply(PersonnelInfo.Chefferie.PERSONNEL_COMPUTER_LEVEL))));
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
