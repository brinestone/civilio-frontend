package fr.civipol.civilio.controller.fosa;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.structure.Section;
import com.dlsc.formsfx.model.util.BindingMode;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.view.controls.SimpleComboBoxControl;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import com.fasterxml.jackson.core.JsonProcessingException;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.domain.converter.OptionConverter;
import fr.civipol.civilio.form.FOSAFormModel;
import fr.civipol.civilio.form.FormModel;
import fr.civipol.civilio.form.control.MultiComboBoxControl;
import fr.civipol.civilio.form.field.GeoPointField;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.PersonnelInfoField;
import fr.civipol.civilio.form.field.VitalStatsField;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.beans.binding.Bindings;
import javafx.collections.MapChangeListener;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.ScrollPane;
import javafx.util.StringConverter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.net.URL;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;
import java.util.function.Function;

@Slf4j
public class FOSAFormController extends FormController implements Initializable {
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;

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
    private Button btnFinish;

    @Getter(AccessLevel.PROTECTED)
    private FormModel model;

    @FXML
    private void onDiscardButtonClicked(ActionEvent event) {
        handleDiscardEvent(event);
    }

    @FXML
    private void onSubmitButtonClicked(ActionEvent event) {
        handleSubmitEvent(event);
    }

    @Override
    protected final void doSubmit() {
        // TODO: Perform actual data submission
    }


    @Override
    public void initialize(URL location, ResourceBundle resources) {
        final var ts = new ResourceBundleService(resources);
        model = new FOSAFormModel(submissionData::get, this::findOptionsFor, submissionData.keySet()::stream);
        configureForms(ts);
        btnFinish.disableProperty().bind(
                Bindings.not(
                        respondentForm.validProperty()
                                .and(structureIdForm.validProperty())
                                .and(eventRegistrationForm.validProperty())
                                .and(equipmentForm.validProperty())
                                .and(personnelForm.validProperty())));
        setChangeListeners();
    }

    private void setChangeListeners() {
        submissionData.addListener(
                (MapChangeListener<String, Object>) change -> model.updateValue(change.getKey()));
    }

    protected final Map<String, Object> loadSubmissionData() throws SQLException, JsonProcessingException {
        return formService.findFosaSubmissionData(submissionId.get());
    }

    private void configureForms(TranslationService ts) {
        setRespondentSection(ts);
        setStructureIdContainer(ts);
        setCSERegContainer(ts);
        setEquipmentContainer(ts);
        setPersonnelStatusContainer(ts);
    }

    private void setPersonnelStatusContainer(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var form = Form.of(Group.of(
                        Field.ofIntegerType(model.personnelCountProperty())
                                .label("fosa.form.fields.key_personnel_count.title")
                                .tooltip("fosa.form.fields.key_personnel_count.description")
                                .validate(IntegerRangeValidator.atLeast(0,
                                        "fosa.form.msg.value_out_of_range"))
                                .span(ColSpan.THIRD),
                        PersonnelInfoField.personnelInfoField(model.personnelInfoProperty(), ts)
                                .computerKnowledgeLevels(model.computerKnowledgeLevelsProperty())
                                .educationLevels(model.educationLevelsProperty())
                                .genders(model.gendersProperty())
                                .label("fosa.form.fields.personnel_status.title")))
                .i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
        personnelForm = form;
        form.binding(BindingMode.CONTINUOUS);
    }

    private void setEquipmentContainer(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var emergencyPowerSource = Field.ofMultiSelectionType(model.emergencyPowerSourceTypesProperty(), model.emergencyPowerSourcesProperty())
                .label("fosa.form.fields.alternative_power.title")
                .span(ColSpan.THIRD)
                .render(createMultiOptionCombobox(ts, v -> model.emergencyPowerSourceTypesProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)));
        emergencyPowerSource.editableProperty().bind(model.emergencyPowerSourceAvailableProperty());
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
                                Field.ofMultiSelectionType(model.waterSourceTypesProperty(), model.waterSourcesProperty())
                                        .label("fosa.form.fields.water_source.title")
                                        .render(createMultiOptionCombobox(ts, v -> model.waterSourceTypesProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)))
                                        .span(ColSpan.THIRD)),
                        Section.of(
                                Field.ofIntegerType(model.pcCountProperty())
                                        .label("fosa.form.fields.pc_count.title")
                                        .span(ColSpan.HALF)
                                        .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range")),
                                Field.ofIntegerType(model.printerCountProperty())
                                        .label("fosa.form.fields.printer_count.title")
                                        .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"))
                                        .span(ColSpan.HALF),
                                Field.ofIntegerType(model.tabletCountProperty())
                                        .label("fosa.form.fields.tablet_count.title")
                                        .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"))
                                        .span(ColSpan.HALF),
                                Field.ofIntegerType(model.carCountProperty())
                                        .label("fosa.form.fields.car_count.title")
                                        .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"))
                                        .span(ColSpan.HALF),
                                Field.ofIntegerType(model.bikeCountProperty())
                                        .label("fosa.form.fields.bike_count.title")
                                        .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"))
                                        .span(ColSpan.HALF)
                        ).title("fosa.form.fields.inventory.title"))
                .i18n(ts);
        spEquipmentContainer.setContent(new FormRenderer(form));
        equipmentForm = form;
        form.binding(BindingMode.CONTINUOUS);
    }

    private void setCSERegContainer(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var form = Form.of(Group.of(
                        Field.ofBooleanType(model.dihs2UsageProperty())
                                .label("fosa.form.fields.dhis2_usage.title")
                                .tooltip("fosa.form.fields.dhis2_usage.description")
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType(model.bunecBirthFormUsageProperty())
                                .label("fosa.form.fields.uses_bunec_birth_form.title")
                                .tooltip("fosa.form.fields.uses_bunec_birth_form.description")
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType(model.dihs2FormsUsageProperty())
                                .label("fosa.form.fields.uses_dhis2_form.title")
                                .tooltip("fosa.form.fields.uses_dhis2_form.description")
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType(model.birthDeclarationToCscProperty())
                                .label("fosa.form.fields.birth_declaration_transmission_to_csc.title")
                                .tooltip("fosa.form.fields.birth_declaration_transmission_to_csc.description")
                                .span(ColSpan.THIRD),
                        Field.ofMultiSelectionType(
                                        model.eventRegistrationTypesProperty(),
                                        model.registeredEventTypesProperty()
                                )
                                .render(createMultiOptionCombobox(ts, v -> model.eventRegistrationTypesProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)))
                                .label("fosa.form.fields.csc_event_reg_type.title")
                                .tooltip("fosa.form.fields.csc_event_reg_type.description")
                                .span(ColSpan.TWO_THIRD),
                        VitalStatsField.statsField(model.vitalCSCStatsValueProperty(), model.vitalCSCStatsValueProperty())
                                .label("fosa.form.fields.stats.title")
                                .span(12)))
                .i18n(ts);
        spCSERegContainer.setContent(new FormRenderer(form));
        eventRegistrationForm = form;
        form.binding(BindingMode.CONTINUOUS);
    }

    private SimpleComboBoxControl<Option> createOptionComboBox(TranslationService ts, Function<String, Option> optionSource) {
        return new SimpleComboBoxControl<>() {
            @Override
            public void initializeParts() {
                super.initializeParts();
                comboBox.setConverter(new OptionConverter(ts, optionSource));
            }
        };
    }

    private MultiComboBoxControl<Option> createMultiOptionCombobox(TranslationService ts, Function<String, Option> optionSource) {
        return new MultiComboBoxControl<>(new OptionConverter(ts, optionSource));
    }

    private void setStructureIdContainer(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var form = Form.of(
                        Section.of(
                                        Field.ofSingleSelectionType(model.regionsProperty(),
                                                        model.regionProperty())
                                                .label("fosa.form.fields.region.title")
                                                .render(createOptionComboBox(ts, v -> model.regionsProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)))
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.divisionsProperty(),
                                                        model.divisionProperty())
                                                .label("fosa.form.fields.department.title")
                                                .tooltip("fosa.form.fields.department.description")
                                                .render(createOptionComboBox(ts, v -> model.divisionsProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)))
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.municipalitiesProperty(),
                                                        model.municipalityProperty())
                                                .label("fosa.form.fields.communes.title")
                                                .render(createOptionComboBox(ts, v -> model.municipalitiesProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)))
                                                .span(ColSpan.HALF),
                                        Field.ofStringType(model.quarterProperty())
                                                .label("fosa.form.fields.quarter.title")
                                                .span(ColSpan.HALF),
                                        Field.ofStringType(model.localityProperty())
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
                                                .render(createOptionComboBox(ts, v -> model.districtsProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null))),
                                        Field.ofSingleSelectionType(model.healthAreasProperty(),
                                                        model.healthAreaProperty())
                                                .label("fosa.form.fields.health_area.title")
                                                .span(ColSpan.HALF)
                                                .render(createOptionComboBox(ts, v -> model.healthAreasProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null))),
                                        Field.ofSingleSelectionType(model.environmentTypesProperty(),
                                                        model.environmentTypeProperty())
                                                .label("fosa.form.fields.environment.title")
                                                .span(ColSpan.HALF)
                                                .render(createOptionComboBox(ts, v -> model.environmentTypesProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null))),
                                        Field.ofSingleSelectionType(model.fosaTypesProperty(),
                                                        model.fosaTypeProperty())
                                                .label("fosa.form.fields.fosa_type.title")
                                                .render(createOptionComboBox(ts, v -> model.fosaTypesProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)))
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.fosaStatusTypesProperty(),
                                                        model.fosaStatusTypeProperty())
                                                .render(createOptionComboBox(ts, v -> model.fosaStatusTypesProperty().stream().filter(o -> o.value().equals(v)).findFirst().orElse(null)))
                                                .label("fosa.form.fields.fosa_status.title")
                                                .span(ColSpan.HALF),
                                        Field.ofBooleanType(model.maternityAvailableProperty())
                                                .label("fosa.form.fields.has_maternity.title")
                                                .tooltip("fosa.form.fields.has_maternity.description")
                                                .span(ColSpan.HALF),
                                        Field.ofStringType(model.attachedCscProperty())
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
                                        GeoPointField.gpsField(model.geoPointProperty()))
                                .title("fosa.form.sections.geo_point.title")
                                .collapse(true))
                .i18n(ts);
        spStructureIdContainer.setContent(new FormRenderer(form));
        structureIdForm = form;
        form.binding(BindingMode.CONTINUOUS);
    }

    private void setRespondentSection(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var form = Form.of(
                        Group.of(
                                Field.ofStringType(model.respondentNamesProperty())
                                        .label("fosa.form.fields.names.title"),
                                Field.ofStringType(model.positionProperty())
                                        .span(ColSpan.HALF)
                                        .tooltip("fosa.form.fields.position.description")
                                        .label("fosa.form.fields.position.title"),
                                Field.ofStringType(model.phoneProperty())
                                        .span(ColSpan.HALF)
                                        .label("fosa.form.fields.phone.title")
                                        .tooltip("fosa.form.fields.phone.description"),
                                Field.ofStringType(model.emailProperty())
                                        .span(ColSpan.HALF)
                                        .label("fosa.form.fields.email.title")
                                        .tooltip("fosa.form.fields.email.description"),
                                Field.ofDate(model.creationDateProperty())
                                        .label("fosa.form.fields.creation_date.title")
                                        .valueDescription(
                                                "fosa.form.fields.creation_date.description")
                                        .format(new StringConverter<>() {

                                            @Override
                                            public String toString(LocalDate object) {
                                                return Optional.ofNullable(object)
                                                        .map(o -> object.format(
                                                                DateTimeFormatter
                                                                        .ofPattern("dd/MM/yyyy")))
                                                        .orElse("");
                                            }

                                            @Override
                                            public LocalDate fromString(String s) {
                                                if (!StringUtils.isNotBlank(s))
                                                    return null;
                                                try {
                                                    return LocalDate.from(DateTimeFormatter
                                                            .ofPattern("dd/MM/yyyy")
                                                            .parse(s));
                                                } catch (DateTimeParseException ignored) {
                                                    return null;
                                                }
                                            }
                                        })
                                        .span(ColSpan.HALF)))
                .i18n(ts);
        spRespondentContainer.setContent(new FormRenderer(form));
        respondentForm = form;
        form.binding(BindingMode.CONTINUOUS);
    }
}
