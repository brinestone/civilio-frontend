package fr.civipol.civilio.controller.chefferie;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.structure.Section;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.entity.PersonnelInfo;

import fr.civipol.civilio.forms.field.GeoPointField;
import jakarta.inject.Inject;
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
        spPersonalStatusContainer(ts);


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
        final var classificationOptions = FXCollections.observableArrayList(
                "1ier degré ou Lamidat",
                "2e degré"
        );
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

                                Field.ofSingleSelectionType(classificationOptions)
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
        final var fonctionOptions = FXCollections.observableArrayList(
                "Oui, Officier d’état civi",
                "Oui, Secrétaire d’état civil",
                "Non"
        );
        final var benefit = new SimpleListProperty<>();
        final var benefitOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var conservation_place = new SimpleListProperty<>();
        final var conservation_placeOptions = FXCollections.observableArrayList(
                "Dans une salle réservée",
                "Dans le domicile du chef",
                "Autres (A préciser)"
        );
        final var training = new SimpleListProperty<>();
        final var trainingOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var waiting_room= new SimpleListProperty<>();
        final var waiting_roomOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var reception_location = new SimpleListProperty<>();
        final var reception_locationOptions = FXCollections.observableArrayList(
                "Dans une salle réservée",
                "Dans le domicile du chef",
                "Autres (A préciser)"
        );
        final var toilets_accessible = new SimpleListProperty<>();
        final var toilets_accessibleOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var form = Form.of(
                Section.of(
                        Field.ofSingleSelectionType(fonctionOptions)
                                .label("chefferie.form.fields.fonction.title")
                                .tooltip("chefferie.form.fields.fonction.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(benefitOptions)
                                .label("chefferie.form.fields.benefit.title")
                                .tooltip("chefferie.form.fields.benefit.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(conservation_placeOptions)
                                .label("chefferie.form.fields.conservation_place.title")
                                .tooltip("chefferie.form.fields.conservation_place.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(trainingOptions)
                                .label("chefferie.form.fields.training.title")
                                .tooltip("chefferie.form.fields.training.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(waiting_roomOptions)
                                .label("chefferie.form.fields.waiting_room.title")
                                .tooltip("chefferie.form.fields.waiting_room.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(reception_locationOptions)
                                .label("chefferie.form.fields.reception_location.title")
                                .tooltip("chefferie.form.fields.reception_location.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(toilets_accessibleOptions)
                                .label("chefferie.form.fields.toilets_accessible.title")
                                .tooltip("chefferie.form.fields.toilets_accessible.description")
                                .span(ColSpan.HALF)
                )
                ).i18n(ts);
        spServiceContainer.setContent(new FormRenderer(form));
    }

    private void spEquipmentContainer(ResourceBundleService ts) {
        final var structure = new SimpleListProperty<>();
        final var structureOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var connexion = new SimpleListProperty<>();
        final var connexionOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var typeConnexion = new SimpleListProperty<>();
        final var  typeConnexionOptions = FXCollections.observableArrayList(
                "2G",
                "3G",
                "4G",
                "ADSL (téléphone filaire)",
                "Fibre optique"
        );
        final var eneoConnexion = new SimpleListProperty<>();
        final var eneoConnexionOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var waterAcces = new SimpleListProperty<>();
        final var waterAccesOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var waterType = new SimpleListProperty<>();
        final var waterTypeOptions = FXCollections.observableArrayList(
                "CAMWATER",
                "Puit aménagé/Forage",
                "Puit non aménagé/Traditionnel ",
                "Cour d’eau",
                "Autres (A préciser)"
        );
        final var  extinguisher= new SimpleListProperty<>();
        final var extinguisherOptions = FXCollections.observableArrayList(
                "Oui",
                "Non"
        );
        final var form = Form.of(
                Section.of(
                        Field.ofStringType("")
                                .label("chefferie.form.fields.equipment_question.title")
                                .editable(false)
                                .span(ColSpan.HALF), // Utilisez ColSpan.HALF ici
                        Field.ofIntegerType(0)
                                .label("chefferie.form.fields.equipment_quantity.computers")
                                .tooltip("chefferie.form.fields.equipment_quantity.computers.description")
                                .span(ColSpan.HALF),
                        Field.ofIntegerType(0)
                                .label("chefferie.form.fields.equipment_quantity.tablets")
                                .tooltip("chefferie.form.fields.equipment_quantity.tablets.description")
                                .span(ColSpan.HALF),
                        Field.ofIntegerType(0)
                                .label("chefferie.form.fields.equipment_quantity.printers")
                                .tooltip("chefferie.form.fields.equipment_quantity.printers.description")
                                .span(ColSpan.HALF),
                        Field.ofIntegerType(0)
                                .label("chefferie.form.fields.equipment_quantity.cars")
                                .tooltip("chefferie.form.fields.equipment_quantity.cars.description")
                                .span(ColSpan.HALF),
                        Field.ofIntegerType(0)
                                .label("chefferie.form.fields.equipment_quantity.motorcycles")
                                .tooltip("chefferie.form.fields.equipment_quantity.motorcycles.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(structureOptions)
                                .label("chefferie.form.fields.structure.title")
                                .tooltip("chefferie.form.fields.structure.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(connexionOptions)
                                .label("chefferie.form.fields.connexion.title")
                                .tooltip("chefferie.form.fields.connexion.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(typeConnexionOptions)
                                .label("chefferie.form.fields.typeConnexion.title")
                                .tooltip("chefferie.form.fields.typeConnexion.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(eneoConnexionOptions)
                                .label("chefferie.form.fields.eneoConnexion.title")
                                .tooltip("chefferie.form.fields.eneoConnexion.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(waterAccesOptions)
                                .label("chefferie.form.fields.waterAcces.title")
                                .tooltip("chefferie.form.fields.waterAcces.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(waterTypeOptions)
                                .label("chefferie.form.fields.waterType.title")
                                .tooltip("chefferie.form.fields.waterType.description")
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(extinguisherOptions)
                                .label("chefferie.form.fields.extinguisher.title")
                                .tooltip("chefferie.form.fields.extinguisher.description")
                                .span(ColSpan.HALF)
                )
        ).i18n(ts);

        spEquipmentContainer.setContent(new FormRenderer(form));
    }

    private void spPersonalStatusContainer(ResourceBundleService ts) {
        final var personnel = Collections.<PersonnelInfo>emptyList();
        final var employer = new SimpleListProperty<>();
        final var form = Form.of(
                Section.of(
                        Field.ofIntegerType(0)
                                .label("chefferie.form.fields.employer.title")
                                .tooltip("chefferie.form.fields.employer.description")
                                .span(ColSpan.HALF)

                )
        ).i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
    }

}




















