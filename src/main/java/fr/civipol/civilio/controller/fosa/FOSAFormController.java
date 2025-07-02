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
import fr.civipol.civilio.domain.converter.OptionConverter;
import fr.civipol.civilio.entity.DataUpdate;
import fr.civipol.civilio.form.FOSAFormDataManager;
import fr.civipol.civilio.form.FieldKeys;
import fr.civipol.civilio.form.FormDataManager;
import fr.civipol.civilio.form.control.MultiComboBoxControl;
import fr.civipol.civilio.form.field.GeoPointField;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.PersonnelInfoField;
import fr.civipol.civilio.form.field.VitalStatsField;
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
import java.util.Map;
import java.util.ResourceBundle;
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
                final var dropped = formService.updateSubmission(submissionId.getValue(),
                                model.getPendingUpdates().toArray(DataUpdate[]::new));
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
                setEventHandlers();
        }

        private void setEventHandlers() {
                footerManagerController
                                .setOnDiscard(e -> handleDiscardEvent(e, resources.getString("fosa.form.msg.discard")));
                footerManagerController.setOnSubmit(this::handleSubmitEvent);
        }

        protected final Map<String, String> loadSubmissionData() throws SQLException {
                return formService.findSubmissionData(submissionId.get(), "fosa", this::keyMaker);
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
                                VitalStatsField.statsField(model.vitalCSCStatsValueProperty().getValue(),
                                                model.vitalCSCStatsValueProperty(), model::updateTrackedCSCStatsFields)
                                                .label("fosa.form.fields.stats.title")
                                                .span(12)))
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
                                final var result = formService.findAutoCompletionValuesFor(field, "fosa", query, 5,
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
                                                Field.ofSingleSelectionType(model.regionsProperty(),
                                                                model.regionProperty())
                                                                .label("fosa.form.fields.region.title")
                                                                .render(createOptionComboBox(ts, v -> model
                                                                                .regionsProperty().stream()
                                                                                .filter(o -> o.value().equals(v))
                                                                                .findFirst().orElse(null)))
                                                                .span(ColSpan.HALF),
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
                                                Field.ofStringType(model.respondentNamesProperty())
                                                                .label(FieldKeys.Fosa.RESPONDENT_NAME)
                                                                .required(true),
                                                Field.ofStringType(model.positionProperty())
                                                                .span(ColSpan.HALF)
                                                                .required(true)
                                                                .render(bindAutoCompletionWrapper(
                                                                                FieldKeys.Fosa.POSITION,
                                                                                String::valueOf))
                                                                .tooltip("fosa.form.fields.position.description")
                                                                .label("fosa.form.fields.position.title"),
                                                Field.ofStringType(model.phoneProperty())
                                                                .span(ColSpan.HALF)
                                                                .required(true)
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
