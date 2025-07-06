package fr.civipol.civilio.controller.fosa;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.structure.Section;
import com.dlsc.formsfx.model.util.BindingMode;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.view.controls.SimpleComboBoxControl;
import com.dlsc.formsfx.view.controls.SimpleDateControl;
import com.dlsc.formsfx.view.controls.SimpleTextControl;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.controller.FormFooterController;
import fr.civipol.civilio.controller.FormHeaderController;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.converter.OptionConverter;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.FOSAFormDataManager;
import fr.civipol.civilio.form.FieldKeys;
import fr.civipol.civilio.form.FormDataManager;
import fr.civipol.civilio.form.control.MultiComboBoxControl;
import fr.civipol.civilio.form.field.GeoPointField;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.PersonnelInfoField;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.BooleanBinding;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tab;
import javafx.scene.paint.Color;
import javafx.util.converter.LocalDateStringConverter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;
import org.kordamp.ikonli.javafx.FontIcon;

import java.net.URL;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.FormatStyle;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Function;
import java.util.stream.Stream;

@Slf4j
public class FOSAFormController extends FormController implements Initializable {
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;
    private ResourceBundle resources;

    @Inject
    public FOSAFormController(
            @SuppressWarnings("CdiInjectionPointsInspection") ExecutorService executorService,
            FormService formService) {
        this.formService = formService;
        this.executorService = executorService;
    }

    private Form respondentForm, structureIdForm, eventRegistrationForm, equipmentForm, personnelForm;
    @FXML
    private ScrollPane spCSERegContainer;

    @FXML
    private ScrollPane spEquipmentContainer;

    @FXML
    private ScrollPane spPersonalStatusContainer;

    @FXML
    private ScrollPane spRespondentContainer;

    @FXML
    private ScrollPane spStructureIdContainer;

    @FXML
    private Tab tEvents;

    @FXML
    private Tab tIdentification;

    @FXML
    private Tab tInfrastructure;

    @FXML
    private Tab tPersonnel;

    @FXML
    private Tab tRespondent;

    @Getter(AccessLevel.PROTECTED)
    private FormDataManager model;

    @FXML
    @Getter(AccessLevel.PROTECTED)
    @SuppressWarnings("unused")
    private FormHeaderController headerManagerController;

    @FXML
    @SuppressWarnings("unused")
    private FormFooterController footerManagerController;

    @Override
    protected final void doSubmit() throws SQLException {
        final var dropped = formService.updateSubmission(
                submissionId.getValue(),
                FormType.FOSA,
                this::extractFieldKey,
                this::extractFieldIdentifiers,
                model.getPendingUpdates().toArray(FieldChange[]::new));
        if (dropped.isEmpty())
            return;
        log.debug("Dropped {} updates", dropped.size());
        log.debug(dropped.toString());
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        this.resources = resources;
        final var ts = new ResourceBundleService(resources);
        model = new FOSAFormDataManager(
                this::valueLoader,
                this::findPersonnelInfo,
                this::keyMaker,
                this::extractFieldKey,
                this::findOptionsFor);
        initializeController();
        model.trackFieldChanges();
        configureForms(ts);
        BooleanBinding canSubmit = Bindings.and(
                respondentForm.validProperty().and(structureIdForm.validProperty())
                        .and(eventRegistrationForm.validProperty())
                        .and(equipmentForm.validProperty()).and(personnelForm.validProperty()),
                Bindings.not(model.pristine())).and(submittingProperty().not());
        footerManagerController.canSubmitProperty().bind(canSubmit);
        footerManagerController.canDiscardProperty().bind(submittingProperty().not());
        headerManagerController.canGoNextProperty().bind(canSubmit.not());
        headerManagerController.canGoPrevProperty().bind(canSubmit.not());
        headerManagerController.formTypeProperty().setValue(FormType.FOSA);
        setEventHandlers();
    }

    private Collection<PersonnelInfo> findPersonnelInfo() {
        final var personnelInfoFields = submissionData.keySet().stream()
                .filter(k -> Arrays.stream(FieldKeys.Fosa.PERSONNEL_FIELDS).anyMatch(k::startsWith))
                .toList();
        final var map = new HashMap<String, PersonnelInfo>();
        for (var key : personnelInfoFields) {
            final var meta = extractFieldIdentifiers(key);
            final var ordinal = meta[0];
            final var id = extractFieldKey(key);
            final var entry = map.computeIfAbsent(ordinal, k -> PersonnelInfo.builder().parentIndex((String) submissionData.get(keyMaker(FieldKeys.Fosa.INDEX, 0))).build());
            final var isNameField = id.equals(FieldKeys.Fosa.PERSONNEL_NAME);
            final var isPositionField = id.equals(FieldKeys.Fosa.PERSONNEL_POSITION);
            final var isGenderField = id.equals(FieldKeys.Fosa.PERSONNEL_GENDER);
            final var isPhoneField = id.equals(FieldKeys.Fosa.PERSONNEL_PHONE);
            final var isAgeField = id.equals(FieldKeys.Fosa.PERSONNEL_AGE);
            final var isCSTrainingField = id.equals(FieldKeys.Fosa.PERSONNEL_CS_TRAINING);
            final var isEdLevelField = id.equals(FieldKeys.Fosa.PERSONNEL_ED_LEVEL);
            final var isComputerLevelField = id.equals(FieldKeys.Fosa.PERSONNEL_COMPUTER_LEVEL);
            final var isEmailField = id.equals(FieldKeys.Fosa.PERSONNEL_EMAIL);

            final var stringValue = (String) submissionData.get(key);

            if (stringValue.matches("^\\d+$") && isAgeField) {
                entry.setAge(Integer.parseInt(stringValue));
            } else if (isNameField)
                entry.setNames(stringValue);
            else if (isPositionField)
                entry.setRole(stringValue);
            else if (isPhoneField)
                entry.setPhone(stringValue);
            else if (isCSTrainingField)
                entry.setCivilStatusTraining("1".equals(stringValue));
            else if (isEdLevelField)
                entry.setEducationLevel(stringValue);
            else if (isGenderField)
                entry.setGender(stringValue);
            else if (isComputerLevelField)
                entry.setComputerKnowledgeLevel(stringValue);
            else if (isEmailField)
                entry.setEmail(stringValue);
        }
        return map.values();
    }

    private void setEventHandlers() {
        footerManagerController
                .setOnDiscard(e -> handleDiscardEvent(e, resources.getString("fosa.form.msg.discard")));
        footerManagerController.setOnSubmit(this::handleSubmitEvent);
    }

    protected final Map<String, String> loadSubmissionData() throws SQLException {
        return formService.findSubmissionData(submissionId.get(), FormType.FOSA, this::keyMaker);
    }

    private void configureForms(TranslationService ts) {
        setRespondentSection(ts);
        setStructureIdContainer(ts);
        setCSERegContainer(ts);
        setEquipmentContainer(ts);
        setPersonnelStatusContainer(ts);

        Stream.of(tRespondent, tIdentification, tEvents, tInfrastructure, tPersonnel)
                .forEach(tab -> {
                    final var form = (Form) tab.getUserData();
                    form.validProperty().addListener((ob, ov, nv) -> {
                        if (nv) {
                            tab.setGraphic(null);
                        } else {
                            final var graphic = new FontIcon("fth-alert-circle");
                            graphic.setIconColor(Color.RED);
                            tab.setGraphic(graphic);
                        }
                    });

                    if (!form.validProperty().get()) {
                        final var graphic = new FontIcon("fth-alert-circle");
                        graphic.setIconColor(Color.RED);
                        tab.setGraphic(graphic);
                    }
                });
    }

    private void setPersonnelStatusContainer(TranslationService ts) {
        final var model = (FOSAFormDataManager) this.model;
        final var form = Form.of(Group.of(
                        Field.ofIntegerType(model.personnelCountProperty())
                                .label("fosa.form.fields.key_personnel_count.title")
                                .tooltip("fosa.form.fields.key_personnel_count.description")
                                .validate(IntegerRangeValidator.atLeast(0,
                                        "fosa.form.msg.value_out_of_range"))
                                .span(ColSpan.THIRD),
                        PersonnelInfoField
                                .personnelInfoField(model.personnelInfoProperty(), ts,
                                        model::updateTrackedPersonnelFields)
                                .computerKnowledgeLevels(model.computerKnowledgeLevelsProperty())
                                .educationLevels(model.educationLevelsProperty())
                                .genders(model.gendersProperty())
                                .label("fosa.form.fields.personnel_status.title")))
                .i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
        personnelForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tPersonnel.setUserData(form);
    }

    private void setEquipmentContainer(TranslationService ts) {
        final var model = (FOSAFormDataManager) this.model;
        final var emergencyPowerSource = Field
                .ofMultiSelectionType(model.emergencyPowerSourceTypesProperty(),
                        model.emergencyPowerSourcesProperty())
                .label("fosa.form.fields.alternative_power.title")
                .span(ColSpan.THIRD)
                .render(createMultiOptionCombobox(ts, v -> model.emergencyPowerSourceTypesProperty()
                        .stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)));
        emergencyPowerSource.editableProperty().bind(model.emergencyPowerSourceAvailableProperty());
        model.emergencyPowerSourceAvailableProperty().addListener((ob, ov, nv) -> {
            if (!nv)
                model.emergencyPowerSourcesProperty().clear();
        });
        final var form = Form.of(Group.of(
                                Field.ofBooleanType(model.toiletAvailableProperty())
                                        .label("fosa.form.fields.toilet_present.title")
                                        .tooltip("fosa.form.fields.toilet_resent.description"),
                                Field.ofBooleanType(model.eneoConnectionProperty())
                                        .label("fosa.form.fields.has_eneo_connection.title")
                                        .tooltip("fosa.form.fields.has_eneo_connection.description"),
                                Field.ofBooleanType(model.emergencyPowerSourceAvailableProperty())
                                        .label("fosa.form.fields.has_power_source.title")
                                        .tooltip("fosa.form.fields.has_power_source.description"),
                                emergencyPowerSource,
                                Field.ofBooleanType(model.internetConnectionAvailableProperty())
                                        .label("fosa.form.fields.internet_conn.title"),
                                Field.ofMultiSelectionType(model.waterSourceTypesProperty(),
                                                model.waterSourcesProperty())
                                        .label("fosa.form.fields.water_source.title")
                                        .render(createMultiOptionCombobox(
                                                ts,
                                                v -> model.waterSourceTypesProperty().stream().filter(
                                                                o -> o.value().equals(v)).findFirst()
                                                        .orElse(null)))
                                        .span(ColSpan.THIRD)),
                        Section.of(
                                        Field.ofIntegerType(model.pcCountProperty())
                                                .label("fosa.form.fields.pc_count.title")
                                                .span(ColSpan.HALF)
                                                .validate(IntegerRangeValidator.atLeast(0,
                                                        "fosa.form.msg.value_out_of_range")),
                                        Field.ofIntegerType(model.printerCountProperty())
                                                .label("fosa.form.fields.printer_count.title")
                                                .validate(IntegerRangeValidator.atLeast(0,
                                                        "fosa.form.msg.value_out_of_range"))
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType(model.tabletCountProperty())
                                                .label("fosa.form.fields.tablet_count.title")
                                                .validate(IntegerRangeValidator.atLeast(0,
                                                        "fosa.form.msg.value_out_of_range"))
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType(model.carCountProperty())
                                                .label("fosa.form.fields.car_count.title")
                                                .validate(IntegerRangeValidator.atLeast(0,
                                                        "fosa.form.msg.value_out_of_range"))
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType(model.bikeCountProperty())
                                                .label("fosa.form.fields.bike_count.title")
                                                .validate(IntegerRangeValidator.atLeast(0,
                                                        "fosa.form.msg.value_out_of_range"))
                                                .span(ColSpan.HALF))
                                .title("fosa.form.fields.inventory.title"))
                .i18n(ts);
        spEquipmentContainer.setContent(new FormRenderer(form));
        equipmentForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tInfrastructure.setUserData(form);
    }

    private void setCSERegContainer(TranslationService ts) {
        final var model = (FOSAFormDataManager) this.model;
        final var form = Form.of(Group.of(
                                Field.ofBooleanType(model.dhis2UsageProperty())
                                        .label("fosa.form.fields.dhis2_usage.title")
                                        .tooltip("fosa.form.fields.dhis2_usage.description")
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType(model.bunecBirthFormUsageProperty())
                                        .label("fosa.form.fields.uses_bunec_birth_form.title")
                                        .tooltip("fosa.form.fields.uses_bunec_birth_form.description")
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType(model.dhis2FormUsageProperty())
                                        .label("fosa.form.fields.uses_dhis2_form.title")
                                        .tooltip("fosa.form.fields.uses_dhis2_form.description")
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType(model.birthDeclarationToCscProperty())
                                        .label("fosa.form.fields.birth_declaration_transmission_to_csc.title")
                                        .tooltip("fosa.form.fields.birth_declaration_transmission_to_csc.description")
                                        .span(ColSpan.THIRD),
                                Field.ofMultiSelectionType(
                                                model.eventRegistrationTypesProperty(),
                                                model.registeredEventTypesProperty())
                                        .render(createMultiOptionCombobox(ts,
                                                v -> model.eventRegistrationTypesProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null)))
                                        .label("fosa.form.fields.csc_event_reg_type.title")
                                        .tooltip("fosa.form.fields.csc_event_reg_type.description")
                                        .span(ColSpan.TWO_THIRD),
                                Field.ofIntegerType(model.statsYear1Property())
                                        .label(FieldKeys.Fosa.STATS_YEAR_1)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.birthCount1Property())
                                        .label(FieldKeys.Fosa.STATS_BIRTH_COUNT_1)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.deathCount1Property())
                                        .label(FieldKeys.Fosa.STATS_DEATH_COUNT_1)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.statsYear2Property())
                                        .label(FieldKeys.Fosa.STATS_YEAR_2)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.birthCount2Property())
                                        .label(FieldKeys.Fosa.STATS_BIRTH_COUNT_2)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.deathCount2Property())
                                        .label(FieldKeys.Fosa.STATS_DEATH_COUNT_2)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.statsYear3Property())
                                        .label(FieldKeys.Fosa.STATS_YEAR_3)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.birthCount3Property())
                                        .label(FieldKeys.Fosa.STATS_BIRTH_COUNT_3)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.deathCount3Property())
                                        .label(FieldKeys.Fosa.STATS_DEATH_COUNT_3)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.statsYear4Property())
                                        .label(FieldKeys.Fosa.STATS_YEAR_4)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.birthCount4Property())
                                        .label(FieldKeys.Fosa.STATS_BIRTH_COUNT_4)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.deathCount4Property())
                                        .label(FieldKeys.Fosa.STATS_DEATH_COUNT_4)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.statsYear5Property())
                                        .label(FieldKeys.Fosa.STATS_YEAR_5)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.birthCount5Property())
                                        .label(FieldKeys.Fosa.STATS_BIRTH_COUNT_5)
                                        .span(ColSpan.THIRD),
                                Field.ofIntegerType(model.deathCount5Property())
                                        .label(FieldKeys.Fosa.STATS_DEATH_COUNT_5)
                                        .span(ColSpan.THIRD)
                        )
                )
                .i18n(ts);
        spCSERegContainer.setContent(new FormRenderer(form));
        eventRegistrationForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tEvents.setUserData(form);
    }

    private SimpleComboBoxControl<Option> createOptionComboBox(TranslationService ts,
                                                               Function<String, Option> optionSource) {
        return new SimpleComboBoxControl<>() {
            @Override
            public void initializeParts() {
                super.initializeParts();
                comboBox.setConverter(new OptionConverter(ts, optionSource));
            }
        };
    }

    private MultiComboBoxControl<Option> createMultiOptionCombobox(TranslationService ts,
                                                                   Function<String, Option> optionSource) {
        return new MultiComboBoxControl<>(new OptionConverter(ts, optionSource));
    }

    private <T> SimpleTextControl bindAutoCompletionWrapper(String targetField, Function<String, T> deserializer) {
        return new SimpleTextControl() {
            private final ObservableList<T> suggestions = FXCollections.observableArrayList();

            @Override
            public void initializeParts() {
                super.initializeParts();
                final var binding = TextFields.bindAutoCompletion(editableField, param -> suggestions);
                binding.setDelay(500);
            }

            @Override
            public void setupValueChangedListeners() {
                super.setupValueChangedListeners();
                editableField.textProperty().addListener((ob, ov, nv) -> {
                    if (StringUtils.isBlank(nv)) {
                        suggestions.clear();
                        return;
                    }
                    populateAutoCompletionOptions(targetField, nv.trim(), deserializer,
                            suggestions);
                });
            }
        };
    }

    private <T> void populateAutoCompletionOptions(String field, String query, Function<String, T> deserializer,
                                                   ObservableList<T> destination) {
        executorService.submit(() -> {
            try {
                final var result = formService.findAutoCompletionValuesFor(field, FormType.FOSA, query, 5,
                        deserializer);
                Platform.runLater(() -> destination.setAll(result));
            } catch (Throwable t) {
                log.error("error while loading auto-completion options", t);
            }
        });
    }

    private void setStructureIdContainer(TranslationService ts) {
        final var model = (FOSAFormDataManager) this.model;
        final var form = Form.of(
                        Section.of(
//                                        Field.ofSingleSelectionType(model.regionsProperty(),
//                                                        model.regionProperty())
//                                                .label("fosa.form.fields.region.title")
//                                                .render(createOptionComboBox(ts, v -> model
//                                                        .regionsProperty().stream()
//                                                        .filter(o -> o.value().equals(v))
//                                                        .findFirst().orElse(null)))
//                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.divisionsProperty(),
                                                        model.divisionProperty())
                                                .label("fosa.form.fields.department.title")
                                                .tooltip("fosa.form.fields.department.description")
                                                .render(createOptionComboBox(ts, v -> model
                                                        .divisionsProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null)))
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.municipalitiesProperty(),
                                                        model.municipalityProperty())
                                                .label("fosa.form.fields.communes.title")
                                                .render(createOptionComboBox(ts, v -> model
                                                        .municipalitiesProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null)))
                                                .span(ColSpan.HALF),
                                        Field.ofStringType(model.quarterProperty())
                                                .label("fosa.form.fields.quarter.title")
                                                .render(bindAutoCompletionWrapper(
                                                        FieldKeys.Fosa.QUARTER,
                                                        String::valueOf))
                                                .span(ColSpan.HALF),
                                        Field.ofStringType(model.localityProperty())
                                                .render(bindAutoCompletionWrapper(
                                                        FieldKeys.Fosa.LOCALITY,
                                                        String::valueOf))
                                                .label("fosa.form.fields.locality.title")
                                                .span(ColSpan.HALF),
                                        Field.ofStringType(model.officeNameProperty())
                                                .label("fosa.form.fields.fosa_name.title")
                                                .tooltip("fosa.form.fields.fosa_name.description")
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.districtsProperty(),
                                                        model.districtProperty())
                                                .label("fosa.form.fields.district.title")
                                                .tooltip("fosa.form.fields.district.description")
                                                .span(ColSpan.HALF)
                                                .render(createOptionComboBox(ts, v -> model
                                                        .districtsProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null))),
                                        Field.ofSingleSelectionType(model.healthAreasProperty(),
                                                        model.healthAreaProperty())
                                                .label("fosa.form.fields.health_area.title")
                                                .span(ColSpan.HALF)
                                                .render(createOptionComboBox(ts, v -> model
                                                        .healthAreasProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null))),
                                        Field.ofSingleSelectionType(model.environmentTypesProperty(),
                                                        model.environmentTypeProperty())
                                                .label("fosa.form.fields.environment.title")
                                                .span(ColSpan.HALF)
                                                .render(createOptionComboBox(ts, v -> model
                                                        .environmentTypesProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null))),
                                        Field.ofSingleSelectionType(model.fosaTypesProperty(),
                                                        model.fosaTypeProperty())
                                                .label("fosa.form.fields.fosa_type.title")
                                                .render(createOptionComboBox(ts, v -> model
                                                        .fosaTypesProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null)))
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.fosaStatusTypesProperty(),
                                                        model.fosaStatusTypeProperty())
                                                .render(createOptionComboBox(ts, v -> model
                                                        .fosaStatusTypesProperty().stream()
                                                        .filter(o -> o.value().equals(v))
                                                        .findFirst().orElse(null)))
                                                .label("fosa.form.fields.fosa_status.title")
                                                .span(ColSpan.HALF),
                                        Field.ofBooleanType(model.maternityAvailableProperty())
                                                .label("fosa.form.fields.has_maternity.title")
                                                .tooltip("fosa.form.fields.has_maternity.description")
                                                .span(ColSpan.HALF),
                                        Field.ofStringType(model.attachedCscProperty())
                                                .render(bindAutoCompletionWrapper(
                                                        FieldKeys.Fosa.ATTACHED_CSC,
                                                        String::valueOf))
                                                .label("fosa.form.fields.csc_reg.title")
                                                .tooltip("fosa.form.fields.csc_reg.description")
                                                .span(ColSpan.HALF),
                                        Field.ofDoubleType(model.cscDistanceProperty())
                                                .label("fosa.form.fields.distance_csc.title")
                                                .tooltip("fosa.form.fields.distance_csc.description")
                                                .span(ColSpan.HALF))
                                .title("fosa.form.sections.structure_identification.title")
                                .collapse(false),
                        Section.of(
                                        GeoPointField.gpsField(model.geoPointProperty(),
                                                model::updateGeoPointUpdates))
                                .title("fosa.form.sections.geo_point.title")
                                .collapse(true))
                .i18n(ts);
        spStructureIdContainer.setContent(new FormRenderer(form));
        structureIdForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tIdentification.setUserData(form);
    }

    private void setRespondentSection(TranslationService ts) {
        final var model = (FOSAFormDataManager) this.model;
        final var today = LocalDate.now();
        final var localDateStringConverter = new LocalDateStringConverter(FormatStyle.MEDIUM);
        final var form = Form.of(
                        Group.of(
                                Field.ofSingleSelectionType(model.deviceOptionsProperty(), model.deviceProperty())
                                        .label(FieldKeys.Fosa.RESPONDING_DEVICE)
                                        .render(createOptionComboBox(ts, v -> model
                                                .deviceOptionsProperty().stream()
                                                .filter(o -> o.value().equals(v))
                                                .findFirst().orElse(null)))
                                        .required("settings.msg.value_required"),
                                Field.ofStringType(model.respondentNamesProperty())
                                        .label(FieldKeys.Fosa.RESPONDENT_NAME)
                                        .required("settings.msg.value_required"),
                                Field.ofStringType(model.positionProperty())
                                        .span(ColSpan.HALF)
                                        .required("settings.msg.value_required")
                                        .render(bindAutoCompletionWrapper(
                                                FieldKeys.Fosa.POSITION,
                                                String::valueOf))
                                        .tooltip("fosa.form.fields.position.description")
                                        .label("fosa.form.fields.position.title"),
                                Field.ofStringType(model.phoneProperty())
                                        .span(ColSpan.HALF)
                                        .required("settings.msg.value_required")
                                        .validate(RegexValidator.forPattern(
                                                "^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$",
                                                "fosa.form.msg.invalid_value"))
                                        .label("fosa.form.fields.phone.title")
                                        .tooltip("fosa.form.fields.phone.description"),
                                Field.ofStringType(model.emailProperty())
                                        .span(ColSpan.HALF)
                                        .validate(RegexValidator.forPattern(
                                                "^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})?$",
                                                "fosa.form.msg.invalid_value"))
                                        .label("fosa.form.fields.email.title")
                                        .tooltip("fosa.form.fields.email.description"),
                                Field.ofDate(model.creationDateProperty())
                                        .label("fosa.form.fields.creation_date.title")
                                        .validate(CustomValidator.forPredicate(
                                                d -> d == null || today.isEqual(d)
                                                     || today.isAfter(d),
                                                "fosa.form.msg.value_out_of_range"))
                                        .format(localDateStringConverter,
                                                "fosa.form.msg.invalid_value")
                                        .render(new SimpleDateControl() {
                                            @Override
                                            public void initializeParts() {
                                                super.initializeParts();
                                                picker.setConverter(
                                                        localDateStringConverter);
                                            }
                                        })
                                        .span(ColSpan.HALF)))
                .i18n(ts);
        spRespondentContainer.setContent(new FormRenderer(form));
        respondentForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tRespondent.setUserData(form);
    }
}
