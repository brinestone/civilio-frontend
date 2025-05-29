package fr.civipol.civilio.controller.fosa;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.structure.Section;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.view.controls.SimpleComboBoxControl;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import com.fasterxml.jackson.core.JsonProcessingException;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.domain.converter.OptionConverter;
import fr.civipol.civilio.entity.InventoryEntry;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.FOSAFormModel;
import fr.civipol.civilio.form.FormModel;
import fr.civipol.civilio.form.control.MultiComboBoxControl;
import fr.civipol.civilio.form.field.*;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleListProperty;
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
import java.util.*;
import java.util.concurrent.ExecutorService;

@Slf4j
public class FOSAFormController extends FormController implements AppController, Initializable {
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
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

    private void findOptionsFor(String form, String name, String parent, List<Option> dest) {
        getExecutorService().submit(() -> {
            try {
                final var result = formService.findOptionsFor(name, parent, form);
                Platform.runLater(() -> {
                    dest.clear();
                    dest.addAll(result);
                });
            } catch (Throwable t) {
                log.error("error while loading options list", t);
                showErrorAlert(t.getLocalizedMessage());
            }
        });
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        final var ts = new ResourceBundleService(resources);
        model = new FOSAFormModel(submissionData::get, this::findOptionsFor);
        setForms(ts);
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
        return formService.findSubmissionData(submissionId.get());
    }

    private void setForms(TranslationService ts) {
        setRespondentSection(ts);
        setStructureIdContainer(ts);
        setCSERegContainer(ts);
        setEquipmentContainer(ts);
        setPersonnelStatusContainer(ts);
    }

    private void setPersonnelStatusContainer(TranslationService ts) {
        final var personnel = Collections.<PersonnelInfo>emptyList();
        final var form = Form.of(Group.of(
                        Field.ofIntegerType(0)
                                .id("fosa.form.fields.personnel_count")
                                .label("fosa.form.fields.personnel_count.title")
                                .tooltip("fosa.form.fields.personnel_count.description")
                                .validate(IntegerRangeValidator.atLeast(0,
                                        "fosa.form.msg.value_out_of_range"))
                                .span(ColSpan.TWO_THIRD),
                        FOSAPersonnelInfoField.personnelInfoField(personnel)
                                .label("fosa.form.fields.personnel_status.title")))
                .i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
        personnelForm = form;
    }

    private void setEquipmentContainer(TranslationService ts) {
        final var hasPowerSource = new SimpleBooleanProperty(false);
        final var powerSourceTypes = new SimpleListProperty<>();
        final var inventory = Collections.<InventoryEntry>emptyList();
        final var waterSources = new SimpleListProperty<>();
        final var form = Form.of(Group.of(
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.toilet_present.title")
                                .tooltip("fosa.form.fields.toilet_resent.description"),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.has_eneo_connection.title")
                                .tooltip("fosa.form.fields.has_eneo_connection.description"),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.has_power_source.title")
                                .tooltip("fosa.form.fields.has_power_source.description")
                                .bind(hasPowerSource),
                        Field.ofSingleSelectionType(powerSourceTypes)
                                .label("fosa.form.fields.alternative_power.title")
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.internet_conn.title"),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.has_water_source.title")
                                .tooltip("fosa.form.fields.has_water_source.description"),
                        Field.ofSingleSelectionType(waterSources)
                                .label("fosa.form.fields.water_source.title")
                                .span(ColSpan.THIRD),
                        FOSAInventoryField.inventoryField(inventory)
                                .label("fosa.form.fields.inventory.title")))
                .i18n(ts);
        spEquipmentContainer.setContent(new FormRenderer(form));
        equipmentForm = form;
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
                        Field.ofMultiSelectionType(model.eventRegistrationTypesProperty(),
                                        model.getRegisteredEventTypeIndices())
                                .render(createMultiOptionCombobox(ts))
                                .label("fosa.form.fields.csc_event_reg_type.title")
                                .tooltip("fosa.form.fields.csc_event_reg_type.description")
                                .span(ColSpan.TWO_THIRD),
                        VitalStatsField.statsField(model.vitalCscStats(), model.vitalCSCStatsValueProperty())
                                .label("fosa.form.fields.stats.title")
                                .span(12)))
                .i18n(ts);
        spCSERegContainer.setContent(new FormRenderer(form));
        eventRegistrationForm = form;
    }

    private SimpleComboBoxControl<Option> createOptionComboBox(TranslationService ts) {
        return new SimpleComboBoxControl<>() {
            @Override
            public void initializeParts() {
                super.initializeParts();
                comboBox.setConverter(new OptionConverter(ts));
            }
        };
    }

    private MultiComboBoxControl<Option> createMultiOptionCombobox(TranslationService ts) {
        return new MultiComboBoxControl<>(new OptionConverter(ts));
    }

    private void setStructureIdContainer(TranslationService ts) {
        final var model = (FOSAFormModel) this.model;
        final var form = Form.of(
                        Section.of(
                                        Field.ofSingleSelectionType(model.regionsProperty(),
                                                        model.regionProperty())
                                                .label("fosa.form.fields.region.title")
                                                .render(createOptionComboBox(ts))
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.divisionsProperty(),
                                                        model.divisionProperty())
                                                .label("fosa.form.fields.department.title")
                                                .tooltip("fosa.form.fields.department.description")
                                                .render(createOptionComboBox(ts))
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(model.municipalitiesProperty(),
                                                        model.municipalityProperty())
                                                .label("fosa.form.fields.communes.title")
                                                .render(createOptionComboBox(ts))
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
                                                if (!StringUtils.isNotBlank(s)) return null;
                                                return LocalDate.from(DateTimeFormatter.ofPattern("dd/MM/yyyy").parse(s));
                                            }
                                        })
                                        .span(ColSpan.HALF)))
                .i18n(ts);
        spRespondentContainer.setContent(new FormRenderer(form));
        respondentForm = form;
    }
}
