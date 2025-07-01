package fr.civipol.civilio.form;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.preferencesfx.formsfx.view.controls.SimpleTextControl;
import com.dlsc.preferencesfx.model.Category;
import com.dlsc.preferencesfx.model.Group;
import com.dlsc.preferencesfx.model.Setting;
import fr.civipol.civilio.domain.FieldMappingSource;
import javafx.beans.property.Property;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.transformation.FilteredList;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;

import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Objects;
import java.util.function.Function;

public class FieldKeys {
    public static final class Fosa {
        public static final String MAIL = "fosa.form.fields.email.title";
        public static final String PHONE = "fosa.form.fields.phone.title";
        public static final String POSITION = "fosa.form.fields.position.title";
        public static final String RESPONDENT_NAME = "fosa.form.fields.names.title";
        public static final String CREATION_DATE = "fosa.form.fields.creation_date.description";
        public static final String REGION = "fosa.form.fields.region.title";
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
        public static final String STATS_YEAR = "fosa_vital_stats.columns.year";
        public static final String STATS_DEATH_COUNT = "fosa_vital_stats.columns.deaths";
        public static final String STATS_BIRTH_COUNT = "fosa_vital_stats.columns.births";
        public static final String PERSONNEL_NAME = "personnel_info.columns.name.title";
        public static final String PERSONNEL_POSITION = "personnel_info.columns.role.title";
        public static final String PERSONNEL_GENDER = "personnel_info.columns.gender.title";
        public static final String PERSONNEL_PHONE = "personnel_info.columns.phone.title";
        public static final String PERSONNEL_EMAIL = "personnel_info.columns.email.title";
        public static final String PERSONNEL_AGE = "personnel_info.columns.age.title";
        public static final String PERSONNEL_CS_TRAINING = "personnel_info.columns.has_cs_training.title";
        public static final String PERSONNEL_ED_LEVEL = "personnel_info.columns.education_level.title";
        public static final String PERSONNEL_COMPUTER_LEVEL = "personnel_info.columns.pc_knowledge.title";
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

        public static String[] allFields() {
            return Arrays.stream(Fosa.class.getDeclaredFields())
                    .filter(f -> Modifier.isStatic(f.getModifiers()) && Modifier.isFinal(f.getModifiers()))
                    .map(f -> {
                        try {
                            f.setAccessible(true);
                            return (String) f.get(null);
                        } catch (IllegalAccessException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .toArray(String[]::new);
        }
    }

    @SuppressWarnings("rawtypes")
    public static Category fosaFieldSettingsCategory(FieldMappingSource fieldFinder) {
        final var fieldMap = FXCollections.<String, Property>observableHashMap();
        final var allFields = FXCollections.<String>observableArrayList();
        fieldFinder.findAllFields(allFields::setAll);

        Function<String, Setting> settingFactory = k -> Setting.of(k, Field.ofStringType((StringProperty) fieldMap.computeIfAbsent(k, kk -> new SimpleStringProperty()))
                .validate(CustomValidator.forPredicate(v -> allFields.stream().anyMatch(s -> s.equals(v)), "fosa.form.msg.invalid_value"))
                .render(new SimpleTextControl() {
                    private final FilteredList<String> suggestions = allFields.filtered(StringUtils::isNotBlank);

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
                                        if (entry.getKey().equals(k) || entry.getValue() == null) continue;
                                        final var otherProperty = entry.getValue();
                                        if (otherProperty.getValue() instanceof String s) {
                                            if (s.equalsIgnoreCase(f)) return false;
                                        } else if (Objects.equals(otherProperty.getValue(), f)) return false;
                                    }
                                    return f.contains(nv);
                                });
                            }
                        });
                    }
                }), fieldMap.get(k));
        return Category.of("fosa.form.title")
                .subCategories(
                        Category.of("mapper.categories.forms.fosa.base_fields.title",
                                settingFactory.apply(Fosa.RESPONDENT_NAME),
                                settingFactory.apply(Fosa.POSITION),
                                settingFactory.apply(Fosa.PHONE),
                                settingFactory.apply(Fosa.MAIL),
                                settingFactory.apply(Fosa.CREATION_DATE),
                                settingFactory.apply(Fosa.REGION),
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
                                settingFactory.apply(Fosa.PERSONNEL_COUNT)
                        ),
                        Category.of("mapper.categories.forms.fosa.sub_forms.title",
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.personnel_info.title",
                                        settingFactory.apply(Fosa.PERSONNEL_NAME),
                                        settingFactory.apply(Fosa.PERSONNEL_POSITION),
                                        settingFactory.apply(Fosa.PERSONNEL_GENDER),
                                        settingFactory.apply(Fosa.PERSONNEL_PHONE),
                                        settingFactory.apply(Fosa.PERSONNEL_EMAIL),
                                        settingFactory.apply(Fosa.PERSONNEL_AGE),
                                        settingFactory.apply(Fosa.PERSONNEL_CS_TRAINING),
                                        settingFactory.apply(Fosa.PERSONNEL_ED_LEVEL),
                                        settingFactory.apply(Fosa.PERSONNEL_COMPUTER_LEVEL)
                                ),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats.title",
                                        settingFactory.apply(Fosa.STATS_YEAR),
                                        settingFactory.apply(Fosa.STATS_BIRTH_COUNT),
                                        settingFactory.apply(Fosa.STATS_DEATH_COUNT)
                                )
                        )
                );
    }
}
