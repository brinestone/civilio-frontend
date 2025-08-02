package fr.civipol.civilio.form;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.preferencesfx.PreferencesFx;
import com.dlsc.preferencesfx.formsfx.view.controls.SimpleTextControl;
import com.dlsc.preferencesfx.model.Category;
import com.dlsc.preferencesfx.model.Group;
import com.dlsc.preferencesfx.model.Setting;
import com.dlsc.preferencesfx.util.StorageHandler;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.domain.FieldMappingSource;
import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.property.Property;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList;
import javafx.scene.image.Image;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.prefs.Preferences;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FieldMapper implements StorageHandler, FieldMappingSource {
    private static final String WINDOW_POS_X = "WINDOW_POS_X";
    private static final String WINDOW_POS_Y = "WINDOW_POS_Y";
    private static final String WINDOW_HEIGHT = "WINDOW_HEIGHT";
    private static final String WINDOW_WIDTH = "WINDOW_WIDTH";
    private static final String DIVIDER_POSITION = "DIVIDER_POSITION";
    private static final String SELECTED_CATEGORY = "SELECTED_CATEGORY";
    private final FormService formService;
    private final ExecutorService executorService;
    private final Preferences prefs = Preferences.userRoot().node(Constants.FIELD_MAPPER_PREFS_NODE_PATH);

    public PreferencesFx makePrefsForm() {
        final var ts = new ResourceBundleService(ResourceBundle.getBundle("messages"));
        return PreferencesFx.of(this,
                        fosaFieldSettingsCategory(this),
                        chiefdomFieldSettingsCategory(this),
                        cscFieldSettingsCategory(this)
                ).i18n(ts)
                .dialogIcon(new Image(Objects.requireNonNull(FieldMapper.class.getResourceAsStream("/img/Logo32x32.png"))))
                .dialogTitle(ts.translate("field_mapper.title"))
                .instantPersistent(true);
    }

    @Override
    public void saveSelectedCategory(String breadcrumb) {
        prefs.put(SELECTED_CATEGORY, breadcrumb);
    }

    @Override
    public String loadSelectedCategory() {
        return prefs.get(SELECTED_CATEGORY, null);
    }

    @Override
    public void saveDividerPosition(double dividerPosition) {
        prefs.putDouble(DIVIDER_POSITION, dividerPosition);
    }

    @Override
    public double loadDividerPosition() {
        return prefs.getDouble(DIVIDER_POSITION, .2);
    }

    @Override
    public void saveWindowWidth(double windowWidth) {
        prefs.putDouble(WINDOW_WIDTH, windowWidth);
    }

    @Override
    public double loadWindowWidth() {
        return prefs.getDouble(WINDOW_WIDTH, 1000);
    }

    @Override
    public void saveWindowHeight(double windowHeight) {
        prefs.putDouble(WINDOW_HEIGHT, windowHeight);
    }

    @Override
    public double loadWindowHeight() {
        return prefs.getDouble(WINDOW_HEIGHT, 640);
    }

    @Override
    public void saveWindowPosX(double windowPosX) {
        prefs.putDouble(WINDOW_POS_X, windowPosX);
    }

    @Override
    public double loadWindowPosX() {
        return prefs.getDouble(WINDOW_POS_X, 700);
    }

    @Override
    public void saveWindowPosY(double windowPosY) {
        prefs.putDouble(WINDOW_POS_Y, windowPosY);
    }

    @Override
    public double loadWindowPosY() {
        return prefs.getDouble(WINDOW_POS_Y, 500);
    }

    private String extractKey(String breadcrumb) {
        final var segments = breadcrumb.split("#");
        return segments[segments.length - 1];
    }

    private FormType extractForm(String breadcrumb) {
        String prefix = breadcrumb.substring(0, breadcrumb.indexOf("."));
        if (prefix.equals("data_personnel")) return FormType.FOSA;
        else if (prefix.equals("data_chefferie_personnel")) return FormType.CHIEFDOM;
        return FormType.fromString(prefix);
    }

    @Override
    public void saveObject(String breadcrumb, Object object) {
        final var key = extractKey(breadcrumb);
        final var form = extractForm(key);
        executorService.submit(() -> {
            try {
                var acceptableValue = object;
                if (object instanceof String s && StringUtils.isBlank(s)) {
                    acceptableValue = null;
                }
                assert acceptableValue instanceof String;
                formService.updateFieldMapping(form, key, key, (String) acceptableValue);
            } catch (Throwable t) {
                log.error("error while updating object: " + breadcrumb, t);
            }
        });
    }

    @Override
    public Object loadObject(String breadcrumb, Object defaultObject) {
        final var key = extractKey(breadcrumb);
        final var form = extractForm(key);
        try {
            return formService.findFieldMapping(form, key)
                    .map(FieldMapping::dbColumn)
                    .map(Object.class::cast)
                    .orElse(defaultObject == null ? "" : defaultObject);
        } catch (Exception ex) {
            log.error("error while loading object with key: {}", key, ex);
        }
        return defaultObject;
    }

    @Override
    public <T> T loadObject(String breadcrumb, Class<T> type, T defaultObject) {
        final var key = extractKey(breadcrumb);
        final var form = extractForm(key);
        try {
            return formService.findFieldMapping(form, key)
                    .map(FieldMapping::dbColumn)
                    .map(type::cast)
                    .orElse(defaultObject);
        } catch (Exception ex) {
            log.error("error while loading object with key: {}", key, ex);
        }
        return defaultObject;
    }

    @Override
    @SuppressWarnings("rawtypes")
    public ObservableList loadObservableList(String breadcrumb, ObservableList defaultObservableList) {
        return FXCollections.observableArrayList();
    }

    @Override
    public <T> ObservableList<T> loadObservableList(String breadcrumb, Class<T> type, ObservableList<T> defaultObservableList) {
        return FXCollections.observableArrayList();
    }

    @Override
    public boolean clearPreferences() {
        return true;
    }

    @Override
    public void findAllDbColumns(FormType form, Consumer<Collection<String>> callback) {
        executorService.submit(() -> {
            try {
                final var result = new ArrayList<>(formService.getFormColumnNames(form));
                Platform.runLater(() -> callback.accept(result));
            } catch (Throwable t) {
                log.error("error while finding fields", t);
            }
        });
    }

    @Override
    public void findConfiguredMappings(FormType form, Consumer<Collection<FieldMapping>> callback) {
        executorService.submit(() -> {
            try {
                final var result = formService.findFieldMappings(form);
                Platform.runLater(() -> callback.accept(result));
            } catch (Throwable t) {
                log.error("error while finding field mappings for form: {}", form, t);
            }
        });
    }

    @SuppressWarnings("rawtypes")
    public static Category cscFieldSettingsCategory(FieldMappingSource fieldMappingSource) {
        final var fieldMap = FXCollections.<String, Property>observableHashMap();
        final var allFields = FXCollections.<String>observableArrayList();
        fieldMappingSource.findAllDbColumns(FormType.CSC, allFields::setAll);
        final Function<String, Setting> settingFactory = k -> createSetting(k, k, allFields, fieldMap);
        final BiFunction<String, String[], Group> groupFactory = (d, a) -> Group.of(d, Stream.of(a).map(settingFactory).toArray(Setting[]::new));
        return Category.of("shell.menu.forms.csc",
                Group.of(
                        settingFactory.apply(FieldKeys.CSC.INDEX),
                        settingFactory.apply(FieldKeys.CSC.VALIDATION_CODE)
                ),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.respondent.title", FieldKeys.CSC.Respondent.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.identification.title", FieldKeys.CSC.Identification.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.accessibility.title", FieldKeys.CSC.Accessibility.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.infrastructure.title", FieldKeys.CSC.Infrastructure.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.areas.title", FieldKeys.CSC.Areas.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.equipment.title", FieldKeys.CSC.Equipment.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.digitization.title", FieldKeys.CSC.Digitization.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.record_procurement.title", FieldKeys.CSC.RecordProcurement.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.stats.title", FieldKeys.CSC.VitalStats.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.archiving.title", FieldKeys.CSC.Archiving.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.deeds.title", FieldKeys.CSC.Deeds.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.records.title", FieldKeys.CSC.StatusOfArchivedRecords.ALL_FIELDS),
                groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.comments.title", FieldKeys.CSC.Comments.ALL_FIELDS)
        ).subCategories(
                Category.of("mapper.categories.forms.csc.base_fields.sections.accessibility.sub_forms.villages.title", groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.accessibility.sub_forms.villages.title", FieldKeys.CSC.Accessibility.Villages.ALL_FIELDS)),
                Category.of("mapper.categories.forms.csc.base_fields.sections.areas.sub_forms.rooms.title", groupFactory.apply("mapper.categories.forms.csc.base_fields.sections.areas.sub_forms.rooms.title", FieldKeys.CSC.Areas.Rooms.ALL_FIELDS))
        );
    }

    @SuppressWarnings("rawtypes")
    private static Setting createSetting(String key, String i18nKey, ObservableList<String> allDbColumns, Map<String, Property> fieldMap) {
        return Setting.of(
                i18nKey,
                Field.ofStringType((StringProperty) fieldMap.computeIfAbsent(key, kk -> new SimpleStringProperty()))
                        .validate(CustomValidator.forPredicate(v -> allDbColumns.stream().anyMatch(s -> s.equals(v)), "forms.msg.invalid_value"))
                        .render(new SimpleTextControl() {
                            private final FilteredList<String> suggestions = allDbColumns.filtered(StringUtils::isNotBlank);

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
                                                if (entry.getKey().equals(key) || entry.getValue() == null)
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
                fieldMap.get(key));

    }

    @SuppressWarnings("rawtypes")
    public static Category chiefdomFieldSettingsCategory(FieldMappingSource fieldMappingSource) {
        final var fieldMap = FXCollections.<String, Property>observableHashMap();
        final var allFields = FXCollections.<String>observableArrayList();
        fieldMappingSource.findAllDbColumns(FormType.CHIEFDOM, allFields::setAll);
        final Function<String, Setting> settingFactory = k -> createSetting(k, k, allFields, fieldMap);
        return Category.of("shell.menu.forms.chefferie",
                        Group.of(
                                "mapper.categories.forms.chefferie.base_fields.title",
                                settingFactory.apply(FieldKeys.Chiefdom.INDEX),
                                settingFactory.apply(FieldKeys.Chiefdom.VALIDATION_CODE),
                                settingFactory.apply(FieldKeys.Chiefdom.RESPONDENT_NAME),
                                settingFactory.apply(FieldKeys.Chiefdom.POSITION),
                                settingFactory.apply(FieldKeys.Chiefdom.PHONE),
                                settingFactory.apply(FieldKeys.Chiefdom.EMAIL),
                                // settingFactory.apply(Chefferie.CREATION_DATE),
                                settingFactory.apply(FieldKeys.Chiefdom.DIVISION),
                                settingFactory.apply(FieldKeys.Chiefdom.MUNICIPALITY),
                                settingFactory.apply(FieldKeys.Chiefdom.QUARTER),
                                settingFactory.apply(FieldKeys.Chiefdom.FACILITY_NAME),
                                settingFactory.apply(FieldKeys.Chiefdom.CLASSIFICATION),
                                settingFactory.apply(FieldKeys.Chiefdom.HEALTH_CENTER_PROXIMITY),
                                settingFactory.apply(FieldKeys.Chiefdom.GPS_COORDS),
                                settingFactory.apply(FieldKeys.Chiefdom.CHIEF_OATH),
                                // settingFactory.apply(Chefferie.OTHER_RECEPTION_AREA),
                                settingFactory.apply(FieldKeys.Chiefdom.IS_CHIEF_CS_OFFICER),
                                settingFactory.apply(FieldKeys.Chiefdom.CS_REG_LOCATION),
                                settingFactory.apply(FieldKeys.Chiefdom.OTHER_CS_REG_LOCATION),
                                settingFactory.apply(FieldKeys.Chiefdom.CS_OFFICER_TRAINED),
                                settingFactory.apply(FieldKeys.Chiefdom.WAITING_ROOM),
                                settingFactory.apply(FieldKeys.Chiefdom.OTHER_WAITING_ROOM),
                                // settingFactory.apply(Chefferie.RECEPTION_AREA),
                                settingFactory.apply(FieldKeys.Chiefdom.TOILETS_ACCESSIBLE),
                                settingFactory.apply(FieldKeys.Chiefdom.INTERNET_TYPE),
                                settingFactory.apply(FieldKeys.Chiefdom.WATER_SOURCES),
                                settingFactory.apply(FieldKeys.Chiefdom.OTHER_WATER_SOURCE),
                                settingFactory.apply(FieldKeys.Chiefdom.PC_COUNT),
                                settingFactory.apply(FieldKeys.Chiefdom.TABLET_COUNT),
                                settingFactory.apply(FieldKeys.Chiefdom.PRINTER_COUNT),
                                settingFactory.apply(FieldKeys.Chiefdom.CAR_COUNT),
                                settingFactory.apply(FieldKeys.Chiefdom.BIKE_COUNT),
                                settingFactory.apply(FieldKeys.Chiefdom.IS_CHIEFDOM_CHIEF_RESIDENCE),
                                settingFactory.apply(FieldKeys.Chiefdom.HAS_INTERNET),
                                settingFactory.apply(FieldKeys.Chiefdom.HAS_ENEO_CONNECTION),
                                settingFactory.apply(FieldKeys.Chiefdom.WATER_ACCESS),
                                settingFactory.apply(FieldKeys.Chiefdom.HAS_EXTINGUISHER),
                                settingFactory.apply(FieldKeys.Chiefdom.EMPLOYEE_COUNT),
                                settingFactory.apply(FieldKeys.Chiefdom.EXTRA_INFO)))
                .subCategories(
                        Category.of("mapper.categories.forms.chefferie.sub_forms.data_personnel.title",
                                Group.of(
                                        "mapper.categories.forms.FieldKeys.Fosa.sub_forms.data_personnel.title",
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_NAME),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_POSITION),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_GENDER),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_PHONE),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_EMAIL),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_AGE),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL))));
    }

    @SuppressWarnings("rawtypes")
    public static Category fosaFieldSettingsCategory(FieldMappingSource fieldMappingSource) {
        final var fieldMap = FXCollections.<String, Property>observableHashMap();
        final var allFields = FXCollections.<String>observableArrayList();
        fieldMappingSource.findAllDbColumns(FormType.FOSA, allFields::setAll);
        final Function<String, Setting> settingFactory = k -> createSetting(k, k, allFields, fieldMap);
        return Category.of("shell.menu.forms.fosa",
                        Group.of("mapper.categories.forms.fosa.base_fields.title",
                                settingFactory.apply(FieldKeys.Fosa.INDEX),
                                settingFactory.apply(FieldKeys.Fosa.VALIDATION_CODE),
                                settingFactory.apply(FieldKeys.Fosa.RESPONDING_DEVICE),
                                settingFactory.apply(FieldKeys.Fosa.RESPONDENT_NAME),
                                settingFactory.apply(FieldKeys.Fosa.POSITION),
                                settingFactory.apply(FieldKeys.Fosa.PHONE),
                                settingFactory.apply(FieldKeys.Fosa.MAIL),
                                settingFactory.apply(FieldKeys.Fosa.CREATION_DATE),
                                settingFactory.apply(FieldKeys.Fosa.DIVISION),
                                settingFactory.apply(FieldKeys.Fosa.MUNICIPALITY),
                                settingFactory.apply(FieldKeys.Fosa.QUARTER),
                                settingFactory.apply(FieldKeys.Fosa.LOCALITY),
                                settingFactory.apply(FieldKeys.Fosa.OFFICE_NAME),
                                settingFactory.apply(FieldKeys.Fosa.DISTRICT),
                                settingFactory.apply(FieldKeys.Fosa.HEALTH_AREA),
                                settingFactory.apply(FieldKeys.Fosa.ENVIRONMENT_TYPE),
                                settingFactory.apply(FieldKeys.Fosa.FACILITY_TYPE),
                                settingFactory.apply(FieldKeys.Fosa.STATUS),
                                settingFactory.apply(FieldKeys.Fosa.HAS_MATERNITY),
                                settingFactory.apply(FieldKeys.Fosa.ATTACHED_CSC),
                                settingFactory.apply(FieldKeys.Fosa.CSC_DISTANCE),
                                settingFactory.apply(FieldKeys.Fosa.GEO_POINT),
                                settingFactory.apply(FieldKeys.Fosa.USES_DHIS),
                                settingFactory.apply(FieldKeys.Fosa.USES_BUNEC_BIRTH_FORM),
                                settingFactory.apply(FieldKeys.Fosa.USES_DHIS_FORMS),
                                settingFactory.apply(FieldKeys.Fosa.SEND_BIRTH_DECLARATIONS_TO_CSC),
                                settingFactory.apply(FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS),
                                settingFactory.apply(FieldKeys.Fosa.HAS_TOILET_FIELD),
                                settingFactory.apply(FieldKeys.Fosa.HAS_ENEO_CONNECTION),
                                settingFactory.apply(FieldKeys.Fosa.HAS_BACKUP_POWER_SOURCE),
                                settingFactory.apply(FieldKeys.Fosa.BACKUP_POWER_SOURCES),
                                settingFactory.apply(FieldKeys.Fosa.HAS_INTERNET_CONNECTION),
                                settingFactory.apply(FieldKeys.Fosa.HAS_WATER_SOURCES),
                                settingFactory.apply(FieldKeys.Fosa.WATER_SOURCES),
                                settingFactory.apply(FieldKeys.Fosa.PC_COUNT),
                                settingFactory.apply(FieldKeys.Fosa.PRINTER_COUNT),
                                settingFactory.apply(FieldKeys.Fosa.TABLET_COUNT),
                                settingFactory.apply(FieldKeys.Fosa.CAR_COUNT),
                                settingFactory.apply(FieldKeys.Fosa.BIKE_COUNT),
                                settingFactory.apply(FieldKeys.Fosa.PERSONNEL_COUNT)))
                .subCategories(
                        Category.of("mapper.categories.forms.fosa.sub_forms.title",
                                Group.of(
                                        "mapper.categories.forms.FieldKeys.Fosa.sub_forms.data_personnel.title",
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_NAME),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_POSITION),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_GENDER),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_PHONE),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_EMAIL),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_AGE),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL),
                                        settingFactory.apply(FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_0.title",
                                        settingFactory.apply(FieldKeys.Fosa.STATS_YEAR_1),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_BIRTH_COUNT_1),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_DEATH_COUNT_1)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_1.title",
                                        settingFactory.apply(FieldKeys.Fosa.STATS_YEAR_2),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_BIRTH_COUNT_2),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_DEATH_COUNT_2)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_2.title",
                                        settingFactory.apply(FieldKeys.Fosa.STATS_YEAR_3),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_BIRTH_COUNT_3),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_DEATH_COUNT_3)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_3.title",
                                        settingFactory.apply(FieldKeys.Fosa.STATS_YEAR_4),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_BIRTH_COUNT_4),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_DEATH_COUNT_4)),
                                Group.of(
                                        "mapper.categories.forms.fosa.sub_forms.stats_4.title",
                                        settingFactory.apply(FieldKeys.Fosa.STATS_YEAR_5),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_BIRTH_COUNT_5),
                                        settingFactory.apply(FieldKeys.Fosa.STATS_DEATH_COUNT_5))));
    }
}