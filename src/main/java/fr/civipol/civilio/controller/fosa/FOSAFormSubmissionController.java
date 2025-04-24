package fr.civipol.civilio.controller.fosa;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.view.controls.SimpleRadioButtonControl;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.forms.field.FOSAStatsField;
import fr.civipol.civilio.entity.InventoryEntry;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.forms.field.FOSAPersonnelInfoField;
import fr.civipol.civilio.forms.field.FOSAInventoryField;
import jakarta.inject.Inject;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.ScrollPane;
import javafx.util.StringConverter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.function.Consumer;

@Slf4j
public class FOSAFormSubmissionController implements AppController, Initializable, FormController {
    private Consumer<String> submissionCallback;
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

    @FXML
    private Button btnDiscard;

    @Inject
    public FOSAFormSubmissionController() {
    }

    @FXML
    void onDiscardButtonClicked(ActionEvent ignored) {

    }

    @FXML
    void onSubmitButtonClicked(ActionEvent ignored) {

    }

    @Override
    public void setOnSubmit(Consumer<String> callback) {
        this.submissionCallback = callback;
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        setForms(resources);
    }

    private void setForms(ResourceBundle resources) {
        final var ts = new ResourceBundleService(resources);
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
                        .label("fosa.form.fields.personnel_count.title")
                        .tooltip("fosa.form.fields.personnel_count.description")
                        .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"))
                        .span(ColSpan.HALF),
                FOSAPersonnelInfoField.personnelInfoField(personnel)
                        .label("fosa.form.fields.personnel_status.title")
        )).i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
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
                        .label("fosa.form.fields.inventory.title")
        )).i18n(ts);
        spEquipmentContainer.setContent(new FormRenderer(form));
    }

    private void setCSERegContainer(TranslationService ts) {
        final var eventRegistrationTypes = new SimpleListProperty<>();
        final var form = Form.of(Group.of(
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.dhis2_usage.title")
                                .tooltip("fosa.form.fields.dhis2_usage.description")
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.uses_bunec_birth_form.title")
                                .tooltip("fosa.form.fields.uses_bunec_birth_form.description")
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.uses_dhis2_form.title")
                                .tooltip("fosa.form.fields.uses_dhis2_form.description")
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.birth_declaration_transmission_to_csc.title")
                                .tooltip("fosa.form.fields.birth_declaration_transmission_to_csc.description")
                                .span(ColSpan.THIRD),
                        Field.ofSingleSelectionType(eventRegistrationTypes)
                                .label("fosa.form.fields.csc_event_reg_type.title")
                                .tooltip("fosa.form.fields.csc_event_reg_type.description")
                                .span(ColSpan.TWO_THIRD),
                        FOSAStatsField.statsField(Collections.emptyList())
                                .label("fosa.form.fields.stats.title")
                                .span(12)
                ))
                .i18n(ts);
        spCSERegContainer.setContent(new FormRenderer(form));
    }

    private void setStructureIdContainer(TranslationService ts) {
        final var departments = new SimpleListProperty<>();
        final var communes = new SimpleListProperty<>();
        final var districts = new SimpleListProperty<>();
        final var healthAreas = new SimpleListProperty<>();
        final var environmentTypes = new SimpleListProperty<>(FXCollections.observableArrayList(
                ts.translate("fosa.form.fields.environment.options.urban.title"),
                ts.translate("fosa.form.fields.environment.options.rural.title")
        ));
        final var fosaTypes = new SimpleListProperty<>();
        final var fosaStatusTypes = new SimpleListProperty<>();
        final var regions = new SimpleListProperty<>();
        final var form = Form.of(
                Group.of(
                        Field.ofSingleSelectionType(regions)
                                .label("fosa.form.fields.region.title")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(departments)
                                .label("fosa.form.fields.department.title")
                                .tooltip("fosa.form.fields.department.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(communes)
                                .label("fosa.form.fields.communes.title")
                                .span(ColSpan.HALF),
                        Field.ofStringType("")
                                .label("fosa.form.fields.quarter.title")
                                .span(ColSpan.HALF),
                        Field.ofStringType("")
                                .label("fosa.form.fields.locality.title")
                                .span(ColSpan.HALF),
                        Field.ofStringType("")
                                .label("fosa.form.fields.fosa_name.title")
                                .tooltip("fosa.form.fields.fosa_name.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(districts)
                                .label("fosa.form.fields.district.title")
                                .tooltip("fosa.form.fields.district.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(healthAreas)
                                .label("fosa.form.fields.health_area.title")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(environmentTypes, 0)
                                .label("fosa.form.fields.environment.title")
                                .span(ColSpan.HALF)
                                .render(new SimpleRadioButtonControl<>()),
                        Field.ofSingleSelectionType(fosaTypes)
                                .label("fosa.form.fields.fosa_type.title")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(fosaStatusTypes)
                                .label("fosa.form.fields.fosa_status.title")
                                .span(ColSpan.HALF),
                        Field.ofBooleanType(false)
                                .label("fosa.form.fields.has_maternity.title")
                                .tooltip("fosa.form.fields.has_maternity.description")
                                .span(ColSpan.HALF),
                        Field.ofStringType("")
                                .label("fosa.form.fields.csc_reg.title")
                                .tooltip("fosa.form.fields.csc_reg.description")
                                .span(ColSpan.HALF),
                        Field.ofDoubleType(.5)
                                .label("fosa.form.fields.distance_csc.title")
                                .tooltip("fosa.form.fields.distance_csc.description")
                                .span(ColSpan.HALF)
                        // TODO: add a custom control for selecting lat/long coordinates.
                )
        ).i18n(ts);
        spStructureIdContainer.setContent(new FormRenderer(form));
    }

    private void setRespondentSection(TranslationService ts) {
        final var form = Form.of(
                        Group.of(
                                Field.ofStringType("")
                                        .label("fosa.form.fields.names.title")
                                        .required("fosa.form.msg.field_required"),
                                Field.ofStringType("")
                                        .span(ColSpan.HALF)
                                        .tooltip("fosa.form.fields.position.description")
                                        .label("fosa.form.fields.position.title"),
                                Field.ofStringType("")
                                        .span(ColSpan.HALF)
                                        .label("fosa.form.fields.phone.title")
                                        .tooltip("fosa.form.fields.phone.description"),
                                Field.ofStringType("")
                                        .span(ColSpan.HALF)
                                        .label("fosa.form.fields.email.title")
                                        .validate(RegexValidator.forEmail("fosa.form.msg.invalid_value"))
                                        .tooltip("fosa.form.fields.email.description"),
                                Field.ofDate((LocalDate) null)
                                        .label("fosa.form.fields.creation_date.title")
                                        .valueDescription("fosa.form.fields.creation_date.description")
                                        .format(new StringConverter<>() {
                                            @Override
                                            public String toString(LocalDate object) {
                                                return Optional.ofNullable(object)
                                                        .map(o -> o.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                                                        .orElse("");
                                            }

                                            @Override
                                            public LocalDate fromString(String string) {
                                                return Optional.ofNullable(string)
                                                        .filter(StringUtils::isNotBlank)
                                                        .map(LocalDate::parse)
                                                        .orElse(null);
                                            }
                                        })
                                        .span(ColSpan.HALF)
                        )
                )
                .i18n(ts);
        spRespondentContainer.setContent(new FormRenderer(form));
    }
}
