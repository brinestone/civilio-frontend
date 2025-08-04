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
import com.dlsc.formsfx.view.controls.SimpleDateControl;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.controller.FormFooterController;
import fr.civipol.civilio.controller.FormHeaderController;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.FOSAFormModel;
import fr.civipol.civilio.form.FieldKeys;
import fr.civipol.civilio.form.FormModel;
import fr.civipol.civilio.form.field.gps.GeoPointField;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.PersonnelInfoField;
import fr.civipol.civilio.services.FormService;
import fr.civipol.civilio.services.PingService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.BooleanBinding;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tab;
import javafx.scene.paint.Color;
import javafx.util.converter.LocalDateStringConverter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.kordamp.ikonli.javafx.FontIcon;

import java.net.URL;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.FormatStyle;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FOSAFormController extends FormController implements Initializable, OptionSource {
    private static final String PING_DOMAIN = "tile.openstreetmap.org";
    private boolean optionsLoaded = false;
    private final Map<String, Collection<Option>> allOptions = new HashMap<>();
    private Form respondentForm, structureIdForm, eventRegistrationForm, equipmentForm, personnelForm;
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;
    private final PingService pingService;
    private ResourceBundle resources;
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
    private FormModel model;
    @FXML
    @Getter(AccessLevel.PROTECTED)
    @SuppressWarnings("unused")
    private FormHeaderController headerManagerController;

    @FXML
    @SuppressWarnings("unused")
    private FormFooterController footerManagerController;

    @Override
    protected final void doSubmit() throws SQLException {
        formService.updateSubmission(
                submissionIndex.getValue(),
                FormType.FOSA,
                this::extractFieldKey,
                model.getPendingUpdates().toArray(FieldChange[]::new));
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        this.resources = resources;
        final var ts = new ResourceBundleService(resources);
        model = new FOSAFormModel(
                this::valueLoader,
                this::findPersonnelInfo,
                this::keyMaker,
                this::extractFieldKey,
                this
        );
        initializeController();
        configureForms(ts);
        BooleanBinding canSubmit = Bindings.and(
                respondentForm.validProperty()
                        .and(structureIdForm.validProperty())
                        .and(eventRegistrationForm.validProperty())
                        .and(equipmentForm.validProperty())
                        .and(personnelForm.validProperty()),
                Bindings.not(model.pristine())).and(submittingProperty().not());
        footerManagerController.canSubmitProperty().bind(canSubmit);
        footerManagerController.canDiscardProperty().bind(submittingProperty().not());
        headerManagerController.canGoNextProperty().bind(canSubmit.not());
        headerManagerController.canGoPrevProperty().bind(canSubmit.not());
        headerManagerController.formTypeProperty().setValue(FormType.FOSA);
        setupEventHandlers();
    }

    @SuppressWarnings("DuplicatedCode")
    private Collection<PersonnelInfo> findPersonnelInfo() {
        final var personnelInfoFields = submissionData.keySet().stream()
                .filter(k -> Arrays.stream(FieldKeys.PersonnelInfo.ALL_FIELDS).anyMatch(k::startsWith))
                .toList();
        final var map = new HashMap<String, PersonnelInfo>();
        for (var key : personnelInfoFields) {
            final var meta = extractFieldIdentifiers(key);
            final var ordinal = meta[0];
            final var id = extractFieldKey(key);
            final var entry = map.computeIfAbsent(ordinal, k -> PersonnelInfo.builder().parentIndex((String) submissionData.get(keyMaker(FieldKeys.Fosa.INDEX, 0))).build());
            final var isNameField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_NAME);
            final var isPositionField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_POSITION);
            final var isGenderField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_GENDER);
            final var isPhoneField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_PHONE);
            final var isAgeField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_AGE);
            final var isCSTrainingField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING);
            final var isEdLevelField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL);
            final var isComputerLevelField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL);
            final var isEmailField = id.equals(FieldKeys.PersonnelInfo.PERSONNEL_EMAIL);

            final var stringValue = (String) submissionData.get(key);
            if (StringUtils.isBlank(stringValue)) return Collections.emptyList();

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

    private void setupEventHandlers() {
        footerManagerController
                .setOnDiscard(e -> handleDiscardEvent(e, resources.getString("msg.discard_msg.txt")));
        footerManagerController.setOnSubmit(this::handleSubmitEvent);
    }

    protected final Map<String, String> loadSubmissionData() throws SQLException {
        return formService.findSubmissionData(submissionIndex.get(), FormType.FOSA, this::keyMaker);
    }

    @Override
    public Collection<Option> findOptions(String group, String parent) {
        return allOptions.getOrDefault(group, Collections.emptyList()).stream()
                .filter(o -> Objects.equals(o.parent(), parent))
                .toList();
    }

    @SuppressWarnings("DuplicatedCode")
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
        final var model = (FOSAFormModel) this.model;
        final var form = Form.of(Group.of(
                        Field.ofIntegerType(model.personnelCountProperty())
                                .label("fosa.form.fields.key_personnel_count.title")
                                .valueDescription("fosa.form.fields.key_personnel_count.description")
                                .validate(IntegerRangeValidator.atLeast(0,
                                        "fosa.form.msg.value_out_of_range"))
                                .span(ColSpan.THIRD),
                        PersonnelInfoField
                                .personnelInfoField(model.personnelInfoProperty(), ts,
                                        model::updateTrackedPersonnelFields)
                                .bindKnowledgeLevels(model.computerKnowledgeLevelsProperty())
                                .bindEducationLevels(model.educationLevelsProperty())
                                .bindGenders(model.gendersProperty())
                                .label("fosa.form.fields.personnel_status.title")))
                .i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
        personnelForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tPersonnel.setUserData(form);
    }

    private void setEquipmentContainer(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var emergencyPowerSource = Field
                .ofMultiSelectionType(model.emergencyPowerSourceTypesProperty(),
                        model.emergencyPowerSourcesProperty())
                .label("fosa.form.fields.alternative_power.title")
                .span(ColSpan.THIRD)
                .render(createMultiOptionComboBox(ts, model.emergencyPowerSourceTypesProperty()));
        emergencyPowerSource.editableProperty().bind(model.emergencyPowerSourceAvailableProperty());
        model.emergencyPowerSourceAvailableProperty().addListener((ob, ov, nv) -> {
            if (!nv)
                model.emergencyPowerSourcesProperty().clear();
        });
        final var form = Form.of(Group.of(
                                Field.ofBooleanType(model.toiletAvailableProperty())
                                        .label("fosa.form.fields.toilet_present.title")
                                        .valueDescription("fosa.form.fields.toilet_resent.description"),
                                Field.ofBooleanType(model.eneoConnectionProperty())
                                        .label("fosa.form.fields.has_eneo_connection.title")
                                        .valueDescription("fosa.form.fields.has_eneo_connection.description"),
                                Field.ofBooleanType(model.emergencyPowerSourceAvailableProperty())
                                        .label("fosa.form.fields.has_power_source.title")
                                        .valueDescription("fosa.form.fields.has_power_source.description"),
                                emergencyPowerSource,
                                Field.ofBooleanType(model.internetConnectionAvailableProperty())
                                        .label("fosa.form.fields.internet_conn.title"),
                                Field.ofMultiSelectionType(model.waterSourceTypesProperty(),
                                                model.waterSourcesProperty())
                                        .label("fosa.form.fields.water_source.title")
                                        .render(createMultiOptionComboBox(
                                                ts,
                                                model.waterSourceTypesProperty()))
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
        final var model = (FOSAFormModel) this.model;
        final var form = Form.of(Group.of(
                                Field.ofBooleanType(model.dhis2UsageProperty())
                                        .label("fosa.form.fields.dhis2_usage.title")
                                        .valueDescription("fosa.form.fields.dhis2_usage.description")
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType(model.bunecBirthFormUsageProperty())
                                        .label("fosa.form.fields.uses_bunec_birth_form.title")
                                        .valueDescription("fosa.form.fields.uses_bunec_birth_form.description")
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType(model.dhis2FormUsageProperty())
                                        .label("fosa.form.fields.uses_dhis2_form.title")
                                        .valueDescription("fosa.form.fields.uses_dhis2_form.description")
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType(model.birthDeclarationToCscProperty())
                                        .label("fosa.form.fields.birth_declaration_transmission_to_csc.title")
                                        .valueDescription("fosa.form.fields.birth_declaration_transmission_to_csc.description")
                                        .span(ColSpan.THIRD),
                                Field.ofMultiSelectionType(
                                                model.eventRegistrationTypesProperty(),
                                                model.registeredEventTypesProperty())
                                        .render(createMultiOptionComboBox(ts, model.eventRegistrationTypesProperty()))
                                        .label("fosa.form.fields.csc_event_reg_type.title")
                                        .valueDescription("fosa.form.fields.csc_event_reg_type.description")
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


    private void setStructureIdContainer(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var connectionAvailable = new SimpleBooleanProperty(true);
        pingService.observe(PING_DOMAIN, v -> Platform.runLater(() -> connectionAvailable.setValue(v)));
        final var form = Form.of(
                Group.of(
                        Field.ofSingleSelectionType(model.divisionsProperty(),
                                        model.divisionProperty())
                                .label("fosa.form.fields.department.title")
                                .valueDescription("fosa.form.fields.department.description")
                                .render(createOptionComboBox(ts))
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(model.municipalitiesProperty(),
                                        model.municipalityProperty())
                                .label("fosa.form.fields.communes.title")
                                .render(createOptionComboBox(ts))
                                .span(ColSpan.HALF),
                        Field.ofStringType(model.quarterProperty())
                                .label("fosa.form.fields.quarter.title")
                                .render(bindAutoCompletionWrapper(
                                        FieldKeys.Fosa.QUARTER,
                                        FormType.FOSA))
                                .span(ColSpan.HALF),
                        Field.ofStringType(model.localityProperty())
                                .render(bindAutoCompletionWrapper(
                                        FieldKeys.Fosa.LOCALITY,
                                        FormType.FOSA))
                                .label("fosa.form.fields.locality.title")
                                .span(ColSpan.HALF),
                        Field.ofStringType(model.officeNameProperty())
                                .label("fosa.form.fields.fosa_name.title")
                                .valueDescription("fosa.form.fields.fosa_name.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(model.districtsProperty(),
                                        model.districtProperty())
                                .label("fosa.form.fields.district.title")
                                .valueDescription("fosa.form.fields.district.description")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts)),
                        Field.ofSingleSelectionType(model.healthAreasProperty(),
                                        model.healthAreaProperty())
                                .label("fosa.form.fields.health_area.title")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts)),
                        Field.ofSingleSelectionType(model.environmentTypesProperty(),
                                        model.environmentTypeProperty())
                                .label("fosa.form.fields.environment.title")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts)),
                        Field.ofSingleSelectionType(model.fosaTypesProperty(),
                                        model.fosaTypeProperty())
                                .label("fosa.form.fields.fosa_type.title")
                                .render(createOptionComboBox(ts))
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(model.fosaStatusTypesProperty(),
                                        model.fosaStatusTypeProperty())
                                .render(createOptionComboBox(ts))
                                .label("fosa.form.fields.fosa_status.title")
                                .span(ColSpan.HALF),
                        Field.ofBooleanType(model.maternityAvailableProperty())
                                .label("fosa.form.fields.has_maternity.title")
                                .valueDescription("fosa.form.fields.has_maternity.description")
                                .span(ColSpan.HALF),
                        Field.ofStringType(model.attachedCscProperty())
                                .render(bindAutoCompletionWrapper(
                                        FieldKeys.Fosa.ATTACHED_CSC,
                                        FormType.FOSA))
                                .label("fosa.form.fields.csc_reg.title")
                                .valueDescription("fosa.form.fields.csc_reg.description")
                                .span(ColSpan.HALF),
                        Field.ofDoubleType(model.cscDistanceProperty())
                                .label("fosa.form.fields.distance_csc.title")
                                .valueDescription("fosa.form.fields.distance_csc.description")
                                .span(ColSpan.HALF))

        ).i18n(ts);
        spStructureIdContainer.setContent(new FormRenderer(form));
        structureIdForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tIdentification.setUserData(form);
    }

    private void setRespondentSection(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var today = LocalDate.now();
        final var localDateStringConverter = new LocalDateStringConverter(FormatStyle.MEDIUM);
        final var form = Form.of(
                        Group.of(
                                Field.ofSingleSelectionType(model.deviceOptionsProperty(), model.deviceProperty())
                                        .label(FieldKeys.Fosa.RESPONDING_DEVICE)
                                        .render(createOptionComboBox(ts))
                                        .required("settings.msg.value_required"),
                                Field.ofStringType(model.respondentNamesProperty())
                                        .label(FieldKeys.Fosa.RESPONDENT_NAME)
                                        .required("settings.msg.value_required"),
                                Field.ofStringType(model.positionProperty())
                                        .span(ColSpan.HALF)
                                        .required("settings.msg.value_required")
                                        .render(bindAutoCompletionWrapper(
                                                FieldKeys.Fosa.POSITION,
                                                FormType.FOSA))
                                        .valueDescription("fosa.form.fields.position.description")
                                        .label("fosa.form.fields.position.title"),
                                Field.ofStringType(model.phoneProperty())
                                        .span(ColSpan.HALF)
                                        .required("settings.msg.value_required")
                                        .validate(RegexValidator.forPattern(
                                                "^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$",
                                                "forms.msg.invalid_value"))
                                        .label("fosa.form.fields.phone.title")
                                        .valueDescription("fosa.form.fields.phone.description"),
                                Field.ofStringType(model.emailProperty())
                                        .span(ColSpan.HALF)
                                        .validate(RegexValidator.forPattern(
                                                "^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})?$",
                                                "forms.msg.invalid_value"))
                                        .label("fosa.form.fields.email.title")
                                        .valueDescription("fosa.form.fields.email.description"),
                                Field.ofDate(model.creationDateProperty())
                                        .label("fosa.form.fields.creation_date.title")
                                        .validate(CustomValidator.forPredicate(
                                                d -> d == null || today.isEqual(d)
                                                        || today.isAfter(d),
                                                "fosa.form.msg.value_out_of_range"))
                                        .format(localDateStringConverter,
                                                "forms.msg.invalid_value")
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

    @Override
    protected void loadOptions() {
        if (optionsLoaded) {
            log.debug("Options already loaded, skipping.");
            return;
        }
        executorService.submit(() -> {
            try {
                final var options = formService.findFormOptions(FormType.FOSA);
                if (options != null && !options.isEmpty()) {
                    Platform.runLater(() -> {
                        FOSAFormController.this.allOptions.clear();
                        FOSAFormController.this.allOptions.putAll(options);
                        log.debug("Loaded {} options", options.size());
                    });
                }
            } catch (Throwable t) {
                log.error("Could not load options", t);
            }
        });
        optionsLoaded = true;
        log.debug("Options loading initiated.");
    }

    @Override
    public void onClose() {
        pingService.unobserve(PING_DOMAIN);
    }
}
