package fr.civipol.civilio.form;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.preferencesfx.formsfx.view.controls.SimpleTextControl;
import com.dlsc.preferencesfx.model.Category;
import com.dlsc.preferencesfx.model.Setting;
import fr.civipol.civilio.domain.FieldMappingSource;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.transformation.FilteredList;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;

import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Objects;
import java.util.function.Function;

public class FieldKeys {
    public final class Fosa {
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
        public static final String STATS_YEAR = "controls.stats_collector.columns.year";
        public static final String STATS_DEATH_COUNT = "controls.stats_collector.columns.deaths";
        public static final String STATS_BIRTH_COUNT = "controls.stats_collector.columns.births";
        public static final String PERSONNEL_NAME = "controls.personnel_info.columns.name";
        public static final String PERSONNEL_POSITION = "controls.personnel_info.columns.role";
        public static final String PERSONNEL_GENDER = "controls.personnel_info.columns.gender";
        public static final String PERSONNEL_PHONE = "controls.personnel_info.columns.phone";
        public static final String PERSONNEL_EMAIL = "controls.personnel_info.columns.email";
        public static final String PERSONNEL_AGE = "controls.personnel_info.columns.age";
        public static final String PERSONNEL_CS_TRAINING = "controls.personnel_info.columns.has_cs_training";
        public static final String PERSONNEL_ED_LEVEL = "controls.personnel_info.columns.education_level";
        public static final String PERSONNEL_COMPUTER_LEVEL = "controls.personnel_info.columns.pc_knowledge";
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

    @SuppressWarnings({"rawtypes", "unchecked"})
    public static Category fosaFieldSettingsCategory(FieldMappingSource fieldFinder) {
        final var fieldMap = FXCollections.<String, Property>observableHashMap();
        final var allFields = FXCollections.<String>observableArrayList();
        fieldFinder.findAllFields(allFields::setAll);
        Function<String, ListProperty<String>> binder = key -> new SimpleListProperty<>(allFields);

//        Function<String, Setting> settingFactory = k -> Setting.of(k, binder.apply(k), (ObjectProperty<String>) fieldMap.computeIfAbsent(k, kk -> new SimpleObjectProperty<String>()));
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
                                        if (Objects.equals(otherProperty.getValue(), f)) return false;
                                    }
                                    return f.contains(nv);
                                });
                            }
                        });
                    }
                }), fieldMap.get(k));
        return Category.of("fosa.form.title")
                .subCategories(Category.of("mapper.base_fields.title",
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
                        )
                );
    }
}
