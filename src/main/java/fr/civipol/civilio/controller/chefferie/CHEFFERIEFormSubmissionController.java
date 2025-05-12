package fr.civipol.civilio.controller.chefferie;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.structure.Section;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.view.controls.SimpleRadioButtonControl;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.entity.InventoryEntry;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.forms.field.CHEFFERIEInventoryField;
import fr.civipol.civilio.forms.field.FOSAInventoryField;
import fr.civipol.civilio.forms.field.FOSAPersonnelInfoField;
import fr.civipol.civilio.forms.field.GeoPointField;
import jakarta.inject.Inject;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.ScrollPane;
import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;

import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.function.Consumer;

public class CHEFFERIEFormSubmissionController implements AppController, Initializable , FormController{

    public ScrollPane spPersonalStatusContainer;
    public ScrollPane spStructureIdContainer;

  public ScrollPane spServiceContainer;

    public ScrollPane spEquipmentContainer;
    private Consumer<String> submissionCallback;

    public ScrollPane spRespondentContainer;

    @Inject
    public  CHEFFERIEFormSubmissionController(){

    }
    @FXML
    public void onSubmitButtonClicked(ActionEvent ignored) {


    }
@FXML
    public void onDiscardButtonClicked(ActionEvent ignored)

    {
    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        setForms(resourceBundle);
    }

    @Override
    public void setOnSubmit(Consumer<String> callback) {
        this.submissionCallback = callback;
    }

    private void setForms(ResourceBundle resources) {
        final var ts = new ResourceBundleService(resources);
        setRespondentSection(ts);
        setStructureIdContainer(ts);
        spServiceContainer(ts);
        spEquipmentContainer(ts);


    }



    private void setRespondentSection(TranslationService ts) {
        final var form = Form.of(
                        Group.of(
                                Field.ofStringType("")
                                        .label("chefferie.form.fields.names.title")
                                        .required("chefferie.form.msg.field_required"),
                                Field.ofStringType("")
                                        .span(ColSpan.HALF)
                                        .tooltip("chefferie.form.fields.position.description")
                                        .label("chefferie.form.fields.position.title"),
                                Field.ofStringType("")
                                        .span(ColSpan.HALF)
                                        .label("chefferie.form.fields.phone.title")
                                        .tooltip("chefferie.form.fields.phone.description"),
                                Field.ofStringType("")
                                        .span(ColSpan.HALF)
                                        .label("chefferie.form.fields.email.title")
                                        .validate(RegexValidator.forEmail("chefferie.form.msg.invalid_value"))
                                        .tooltip("chefferie.form.fields.email.description"),
                                Field.ofDate((LocalDate) null)
                                        .label("chefferie.form.fields.creation_date.title")
                                        .valueDescription("chefferie.form.fields.creation_date.description")
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




    private void setStructureIdContainer(TranslationService ts) {
        final var departments = new SimpleListProperty<>();
        final var communes = new SimpleListProperty<>();
        final var classification = new SimpleListProperty<>();
        final var regions = new SimpleListProperty<>();
        final var gpsLocation = GeoPoint.builder()
                .latitude(5.4811225f)
                .longitude(10.4087592f)
                .build();
        final var form = Form.of(
                Section.of(
                                Field.ofSingleSelectionType(regions)
                                        .label("chefferie.form.fields.region.title")
                                        .span(ColSpan.HALF),
                                Field.ofSingleSelectionType(departments)
                                        .label("chefferie.form.fields.department.title")
                                        .tooltip("chefferie.form.fields.department.description")
                                        .span(ColSpan.HALF),
                                Field.ofSingleSelectionType(communes)
                                        .label("chefferie.form.fields.communes.title")
                                        .span(ColSpan.HALF),
                                Field.ofStringType("")
                                        .label("chefferie.form.fields.quarter.title")
                                        .span(ColSpan.HALF),
                                Field.ofStringType("")
                                        .label("chefferie.form.fields.name.title")
                                        .span(ColSpan.HALF),

                                Field.ofSingleSelectionType(classification)
                                        .label("chefferie.form.fields.classification.title")
                                        .tooltip("chefferie.form.fields.classification.description")
                                        .span(ColSpan.HALF),
                                Field.ofStringType("")
                                        .label("chefferie.form.fields.distance.title")
                                        .span(ColSpan.HALF)

                        ).title("chefferie.form.sections.structure_identification.title")
                        .collapse(false),
                Section.of(
                                GeoPointField.gpsField(gpsLocation)
                        ).title("chefferie.form.sections.geo_point.title")
                        .collapse(true)
        ).i18n(ts);
        spStructureIdContainer.setContent(new FormRenderer(form));
    }



    private void spServiceContainer(ResourceBundleService ts) {
        final var fonction = new SimpleListProperty<>();
        final var benefit = new SimpleListProperty<>();
        final var conservation_place = new SimpleListProperty<>();
        final var training = new SimpleListProperty<>();
        final var waiting_room= new SimpleListProperty<>();
        final var reception_location = new SimpleListProperty<>();
        final var toilets_accessible = new SimpleListProperty<>();

        final var form = Form.of(
                Section.of(
                        Field.ofSingleSelectionType(fonction)
                                .label("chefferie.form.fields.fonction.title")
                                .tooltip("chefferie.form.fields.fonction.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(benefit)
                                .label("chefferie.form.fields.benefit.title")
                                .tooltip("chefferie.form.fields.benefit.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(conservation_place)
                                .label("chefferie.form.fields.conservation_place.title")
                                .tooltip("chefferie.form.fields.conservation_place.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(training)
                                .label("chefferie.form.fields.training.title")
                                .tooltip("chefferie.form.fields.training.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(waiting_room)
                                .label("chefferie.form.fields.waiting_room.title")
                                .tooltip("chefferie.form.fields.waiting_room.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(reception_location)
                                .label("chefferie.form.fields.reception_location.title")
                                .tooltip("chefferie.form.fields.reception_location.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(toilets_accessible)
                                .label("chefferie.form.fields.toilets_accessible.title")
                                .tooltip("chefferie.form.fields.toilets_accessible.description")
                                .span(ColSpan.HALF)
                )
                ).i18n(ts);
        spServiceContainer.setContent(new FormRenderer(form));
    }

    private void spEquipmentContainer(ResourceBundleService ts) {




    }

}




















