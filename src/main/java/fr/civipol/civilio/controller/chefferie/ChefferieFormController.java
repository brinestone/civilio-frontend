package fr.civipol.civilio.controller.chefferie;

import static fr.civipol.civilio.form.FieldKeys.Chiefdom.BIKE_COUNT;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.CAR_COUNT;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.CLASSIFICATION;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.CS_REG_LOCATION;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.DIVISION;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.EMPLOYEE_COUNT;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.EXTRA_INFO;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.GPS_COORDS;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.HAS_ENEO_CONNECTION;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.HAS_EXTINGUISHER;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.HAS_INTERNET;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.INTERNET_TYPE;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.IS_CHIEFDOM_CHIEF_RESIDENCE;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.IS_CHIEF_CS_OFFICER;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.MUNICIPALITY;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.OTHER_WATER_SOURCE;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.PRINTER_COUNT;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.WATER_ACCESS;
import static fr.civipol.civilio.form.FieldKeys.Chiefdom.WATER_SOURCES;

import java.net.URL;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Supplier;
import java.util.stream.Stream;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.form.ChefferieFormModel;
import fr.civipol.civilio.form.FormModel;
import org.apache.commons.lang3.StringUtils;
import org.kordamp.ikonli.javafx.FontIcon;

import com.dlsc.formsfx.model.structure.BooleanField;
import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.structure.MultiSelectionField;
import com.dlsc.formsfx.model.structure.Section;
import com.dlsc.formsfx.model.structure.StringField;
import com.dlsc.formsfx.model.util.BindingMode;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;

import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.controller.FormFooterController;
import fr.civipol.civilio.controller.FormHeaderController;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.FieldKeys;
import fr.civipol.civilio.form.field.GeoPointField;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.PersonnelInfoField;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.BooleanBinding;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.IntegerProperty;
import javafx.beans.property.ListProperty;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.StringProperty;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tab;
import javafx.scene.paint.Color;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ChefferieFormController extends FormController implements Initializable, OptionSource {
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;

    private ResourceBundle resources;
    public ScrollPane spPersonalStatusContainer;
    public ScrollPane spStructureIdContainer;
    public ScrollPane spServiceContainer;
    public ScrollPane spEquipmentContainer;
    public ScrollPane spRespondentContainer;
    public ScrollPane spExtra;
    @Getter(AccessLevel.PROTECTED)
    private FormModel model;
    @FXML
    @SuppressWarnings("unused")
    @Getter(AccessLevel.PROTECTED)
    private FormHeaderController headerManagerController;
    @FXML
    @SuppressWarnings("unused")
    @Getter(AccessLevel.PROTECTED)
    private FormFooterController footerManagerController;
    @FXML
    private Tab tabRespondent;
    @FXML
    private Tab tabStructureId;
    @FXML
    private Tab tabServices;
    @FXML
    private Tab tabInfra;
    @FXML
    private Tab tabPersonnel;
    @FXML
    private Tab tabExtra;
    private Form extrasForm, respondentForm, structureIdForm, serviceForm, equipmentForm, personnelForm;
    private final Map<String, Collection<Option>> optionsCache = new HashMap<>();
    private boolean optionsLoaded = false;

    @Override
    protected void loadOptions() {
        if (optionsLoaded) {
            log.debug("Options already loaded, skipping.");
            return;
        }
        executorService.submit(() -> {
            try {
                final var options = formService.findFormOptions(FormType.CHIEFDOM);
                if (options != null && !options.isEmpty()) {
                    Platform.runLater(() -> {
                        ChefferieFormController.this.optionsCache.clear();
                        ChefferieFormController.this.optionsCache.putAll(options);
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
    protected void doSubmit() throws Exception {
        formService.updateSubmission(submissionIndex.getValue(), FormType.CHIEFDOM, this::extractFieldKey,
                model.getPendingUpdates().toArray(FieldChange[]::new));
    }

    @Override
    protected Map<String, String> loadSubmissionData() throws Exception {
        return formService.findSubmissionData(submissionIndex.get(), FormType.CHIEFDOM, this::keyMaker);
    }

    @Override
    public Collection<Option> findOptions(String group, String parent) {
        return optionsCache.getOrDefault(group, Collections.emptyList()).stream()
                .filter(o -> Objects.equals(o.parent(), parent))
                .toList();
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
            final var entry = map.computeIfAbsent(ordinal,
                    k -> PersonnelInfo.builder().parentIndex(
                                    (String) submissionData.get(keyMaker(FieldKeys.Fosa.INDEX, 0)))
                            .build());
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
            if (StringUtils.isBlank(stringValue))
                return Collections.emptyList();

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

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        this.resources = resourceBundle;
        final var ts = new ResourceBundleService(resourceBundle);
        model = new ChefferieFormModel(
                this::valueLoader,
                this::keyMaker,
                this::extractFieldKey,
                this::findPersonnelInfo,
                this
        );
        initializeController();
        model.trackFieldChanges();
        configureForms(ts);
        BooleanBinding canSubmit = Bindings.and(
                respondentForm.validProperty()
                        .and(structureIdForm.validProperty())
                        .and(serviceForm.validProperty())
                        .and(equipmentForm.validProperty())
                        .and(personnelForm.validProperty())
                        .and(extrasForm.validProperty()),
                Bindings.not(model.pristine())).and(submittingProperty().not());
        footerManagerController.canSubmitProperty().bind(canSubmit);
        footerManagerController.canDiscardProperty().bind(submittingProperty().not());
        headerManagerController.canGoNextProperty().bind(canSubmit.not());
        headerManagerController.canGoPrevProperty().bind(canSubmit.not());
        headerManagerController.formTypeProperty().setValue(FormType.CHIEFDOM);
        setupEventHandlers();
    }

    private void setupEventHandlers() {
        footerManagerController
                .setOnDiscard(e -> handleDiscardEvent(e, resources.getString("msg.discard_msg.txt")));
        footerManagerController.setOnSubmit(this::handleSubmitEvent);
    }

    @SuppressWarnings("DuplicatedCode")
    private void configureForms(TranslationService ts) {
        setRespondentSection(ts);
        configureStructureIdContainer(ts);
        spServiceContainer(ts);
        spEquipmentContainer(ts);
        spPersonalStatusContainer(ts);
        setExtraSection(ts);

        Stream.of(tabRespondent, tabExtra, tabStructureId, tabInfra, tabPersonnel, tabServices)
                .forEach(tab -> {
                    final var form = (Form) tab.getUserData();
                    Supplier<Node> graphicProvider = () -> {
                        final var icon = new FontIcon("fth-alert-circle");
                        icon.setIconColor(Color.RED);
                        return icon;
                    };
                    form.validProperty().addListener((ob, ov, nv) -> tab
                            .setGraphic(nv ? null : graphicProvider.get()));
                    tab.setGraphic(form.isValid() ? null : graphicProvider.get());
                });
    }

    private void setExtraSection(TranslationService ts) {
        final var form = Form.of(
                        Group.of(
                                Field.ofStringType((StringProperty) model.getPropertyFor(EXTRA_INFO))
                                        .label(EXTRA_INFO)
                                        .multiline(true)
                                        .valueDescription("chefferie.form.fields.extra_info.description")))
                .i18n(ts);

        extrasForm = form;
        spExtra.setContent(new FormRenderer(form));
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tabExtra.setUserData(form);
    }

    private void setRespondentSection(TranslationService ts) {
        // final var today = LocalDate.now();
        // final var localDateStringConverter = new
        // LocalDateStringConverter(FormatStyle.MEDIUM);
        final var form = Form.of(
                        Group.of(
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.Chiefdom.RESPONDENT_NAME))
                                        .label(FieldKeys.Chiefdom.RESPONDENT_NAME)
                                        .span(ColSpan.HALF)
                                        .required("forms.validation.msg.field_required"),
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.Chiefdom.POSITION))
                                        .span(ColSpan.HALF)
                                        .required("forms.validation.msg.field_required")
                                        .valueDescription("chefferie.form.fields.position.description")
                                        .label(FieldKeys.Chiefdom.POSITION),
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.Chiefdom.PHONE))
                                        .span(ColSpan.HALF)
                                        .label(FieldKeys.Chiefdom.PHONE)
                                        .valueDescription("chefferie.form.fields.phone.description")
                                        .validate(RegexValidator.forPattern(
                                                "^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$",
                                                "forms.msg.invalid_value")),
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.Chiefdom.EMAIL))
                                        .span(ColSpan.HALF)
                                        .label(FieldKeys.Chiefdom.EMAIL)
                                        .validate(RegexValidator.forPattern(
                                                "^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})?$",
                                                "forms.msg.invalid_value"))
                                        .valueDescription("chefferie.form.fields.email.description")
                                // Field.ofDate((ObjectProperty<LocalDate>)
                                // model.getPropertyFor(FieldKeys.Chefferie.CREATION_DATE))
                                // .label("fosa.form.fields.creation_date.title")
                                // .required("forms.validation.msg.field_required")
                                // .validate(CustomValidator.forPredicate(
                                // d -> d == null || today.isEqual(d)
                                // || today.isAfter(d),
                                // "fosa.form.msg.value_out_of_range"))
                                // .format(localDateStringConverter,
                                // "forms.msg.invalid_value")
                                // .render(new SimpleDateControl() {
                                // @Override
                                // public void initializeParts() {
                                // super.initializeParts();
                                // picker.setConverter(
                                // localDateStringConverter);
                                // }
                                // })
                                // .span(ColSpan.HALF)
                        ))
                .i18n(ts);
        spRespondentContainer.setContent(new FormRenderer(form));
        respondentForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tabRespondent.setUserData(form);
    }

    @SuppressWarnings("unchecked")
    private void configureStructureIdContainer(TranslationService ts) {
        final var model = (ChefferieFormModel) this.model;
        final var form = Form.of(
                        Section.of(
                                        Field.ofSingleSelectionType(
                                                        model.getOptionsFor(FieldKeys.Chiefdom.DIVISION),
                                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                                FieldKeys.Chiefdom.DIVISION))
                                                .label(FieldKeys.Chiefdom.DIVISION)
                                                .render(createOptionComboBox(ts,
                                                        model.getOptionsFor(DIVISION)))
                                                .required("forms.validation.msg.field_required")
                                                .valueDescription("chefferie.form.fields.department.description")
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(
                                                        model.getOptionsFor(FieldKeys.Chiefdom.MUNICIPALITY),
                                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                                FieldKeys.Chiefdom.MUNICIPALITY))
                                                .render(createOptionComboBox(ts,
                                                        model.getOptionsFor(MUNICIPALITY)))
                                                .label(FieldKeys.Chiefdom.MUNICIPALITY)
                                                .required("forms.validation.msg.field_required")
                                                .span(ColSpan.HALF),
                                        Field.ofStringType((StringProperty) model
                                                        .getPropertyFor(FieldKeys.Chiefdom.QUARTER))
                                                .label(FieldKeys.Chiefdom.QUARTER)
                                                .required("forms.validation.msg.field_required")
                                                .span(ColSpan.HALF),
                                        Field.ofStringType((StringProperty) model
                                                        .getPropertyFor(FieldKeys.Chiefdom.FACILITY_NAME))
                                                .label(FieldKeys.Chiefdom.FACILITY_NAME)
                                                .required("forms.validation.msg.field_required")
                                                .span(ColSpan.HALF),
                                        Field.ofSingleSelectionType(
                                                        model.getOptionsFor(FieldKeys.Chiefdom.CLASSIFICATION),
                                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                                FieldKeys.Chiefdom.CLASSIFICATION))
                                                .label(FieldKeys.Chiefdom.CLASSIFICATION)
                                                .render(createOptionComboBox(ts,
                                                        model.getOptionsFor(CLASSIFICATION)))
                                                .required("forms.validation.msg.field_required")
                                                .valueDescription("chefferie.form.fields.classification.description")
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType((IntegerProperty) model.getPropertyFor(
                                                        FieldKeys.Chiefdom.HEALTH_CENTER_PROXIMITY))
                                                .label(FieldKeys.Chiefdom.HEALTH_CENTER_PROXIMITY)
                                                .required("forms.validation.msg.field_required")
                                                .span(ColSpan.HALF)

                                ).title("chefferie.form.sections.structure_identification.title")
                                .collapse(false),
                        Section.of(
                                        GeoPointField.gpsField(
                                                (ObjectProperty<GeoPoint>) model
                                                        .getPropertyFor(GPS_COORDS),
                                                model::updateGeoPointUpdates))
                                .title(GPS_COORDS)
                                .collapse(true))
                .i18n(ts);
        spStructureIdContainer.setContent(new FormRenderer(form));
        structureIdForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tabStructureId.setUserData(form);
    }

    @SuppressWarnings("unchecked")
    private void spServiceContainer(TranslationService ts) {
        final var model = (ChefferieFormModel) this.model;
        final var oathAvailable = model.oathAvailable();
        final var otherCsRegLocationAvailable = model.otherCsRegLocationAvailable();
        // final var otherReceptionAreaAvailable =
        // model.otherWaitingRoomAvailableProperty();

        BooleanField oathControl = Field
                .ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.Chiefdom.CHIEF_OATH))
                .label(FieldKeys.Chiefdom.CHIEF_OATH)
                .valueDescription("chefferie.form.fields.benefit.description");
        oathControl.editableProperty().bind(oathAvailable);
        oathAvailable.addListener((ob, ov, nv) -> oathControl
                .required(nv ? "forms.validation.msg.field_required" : null));

        StringField otherCsRegLocationControl = Field.ofStringType(
                        (StringProperty) model.getPropertyFor(FieldKeys.Chiefdom.OTHER_CS_REG_LOCATION))
                .label(FieldKeys.Chiefdom.OTHER_CS_REG_LOCATION);

        otherCsRegLocationAvailable.addListener((ob, ov, nv) -> otherCsRegLocationControl
                .required(nv ? "forms.validation.msg.field_required" : null));
        otherCsRegLocationControl.editableProperty().bind(otherCsRegLocationAvailable);

        // StringField otherReceptionArea = Field.ofStringType((StringProperty)
        // model.getPropertyFor(OTHER_RECEPTION_AREA))
        // .label(OTHER_RECEPTION_AREA)
        // .span(ColSpan.HALF);

        // otherReceptionAreaAvailable.addListener((ob, ov, nv) ->
        // otherReceptionArea.required(nv ? "forms.validation.msg.field_required" :
        // null));
        // otherReceptionArea.editableProperty().bind(otherReceptionAreaAvailable);

        final var form = Form.of(
                        Group.of(
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.Chiefdom.IS_CHIEF_CS_OFFICER),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.Chiefdom.IS_CHIEF_CS_OFFICER))
                                        .label(FieldKeys.Chiefdom.IS_CHIEF_CS_OFFICER)
                                        .render(createOptionComboBox(ts,
                                                model.getOptionsFor(
                                                        IS_CHIEF_CS_OFFICER)))
                                        .required("forms.validation.msg.field_required")
                                        .valueDescription("chefferie.form.fields.fonction.description"),
                                oathControl,
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(FieldKeys.Chiefdom.CS_REG_LOCATION),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.Chiefdom.CS_REG_LOCATION))
                                        .required("forms.validation.msg.field_required")
                                        .label(FieldKeys.Chiefdom.CS_REG_LOCATION)
                                        .render(createOptionComboBox(ts,
                                                model.getOptionsFor(CS_REG_LOCATION)))
                                        .valueDescription("chefferie.form.fields.conservation_place.description"),
                                otherCsRegLocationControl,
                                Field.ofBooleanType((BooleanProperty) model
                                                .getPropertyFor(FieldKeys.Chiefdom.CS_OFFICER_TRAINED))
                                        .label(FieldKeys.Chiefdom.CS_OFFICER_TRAINED)
                                        .valueDescription("chefferie.form.fields.training.description"),
                                Field.ofBooleanType((BooleanProperty) model
                                                .getPropertyFor(FieldKeys.Chiefdom.WAITING_ROOM))
                                        .label(FieldKeys.Chiefdom.WAITING_ROOM)
                                        .valueDescription("chefferie.form.fields.waiting_room.description"),
                                // Field.ofSingleSelectionType(model.getOptionsFor(RECEPTION_AREA),
                                // (ObjectProperty<Option>) model.getPropertyFor(RECEPTION_AREA))
                                // .label(RECEPTION_AREA)
                                // .render(createOptionComboBox(ts,
                                // model.getOptionsFor(RECEPTION_AREA)))
                                // .required("forms.validation.msg.field_required")
                                // .valueDescription("chefferie.form.fields.reception_location.description")
                                // .span(ColSpan.HALF),
                                // otherReceptionArea,
                                Field.ofBooleanType((BooleanProperty) model
                                                .getPropertyFor(FieldKeys.Chiefdom.TOILETS_ACCESSIBLE))
                                        .label(FieldKeys.Chiefdom.TOILETS_ACCESSIBLE)
                                        // .required("forms.validation.msg.field_required")
                                        .valueDescription("chefferie.form.fields.toilets_accessible.description")))
                .i18n(ts);
        spServiceContainer.setContent(new FormRenderer(form));
        serviceForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tabServices.setUserData(form);
    }

    @SuppressWarnings("unchecked")
    private void spEquipmentContainer(TranslationService ts) {
        final var model = (ChefferieFormModel) this.model;
        final var internetTypeAvailable = model.internetTypeAvailable();
        final var waterSourcesAvailable = model.waterSourcesAvailable();
        final var otherWaterSourceAvailable = model.otherWaterSourceAvailable();

        final var naturalNumberValidator = CustomValidator.<Integer>forPredicate(i -> i == null || i >= 0,
                "fosa.form.msg.value_out_of_range");
        final var internetTypeControl = Field
                .ofMultiSelectionType(model.getOptionsFor(INTERNET_TYPE),
                        (ListProperty<Option>) model.getPropertyFor(INTERNET_TYPE))
                .label(INTERNET_TYPE)
                .render(createMultiOptionComboBox(ts, model.getOptionsFor(INTERNET_TYPE)))
                .valueDescription("chefferie.form.fields.typeConnexion.description")
                .span(ColSpan.HALF);
        internetTypeAvailable.addListener((ob, ov, nv) -> internetTypeControl
                .required(nv ? "forms.validation.msg.field_required" : null));
        internetTypeControl.editableProperty().bind(internetTypeAvailable);

        MultiSelectionField<Option> waterSourcesControl = Field.ofMultiSelectionType(
                        model.getOptionsFor(WATER_SOURCES),
                        (ListProperty<Option>) model.getPropertyFor(WATER_SOURCES))
                .label(WATER_SOURCES)
                .valueDescription("chefferie.form.fields.waterType.description")
                .render(createMultiOptionComboBox(ts, model.getOptionsFor(WATER_SOURCES)))
                .span(ColSpan.THIRD);

        final var otherWaterSourceControl = Field
                .ofStringType(((StringProperty) model.getPropertyFor(OTHER_WATER_SOURCE)))
                .label(OTHER_WATER_SOURCE)
                .span(ColSpan.THIRD);
        otherWaterSourceAvailable.addListener((ob, ov, nv) -> otherWaterSourceControl
                .required(nv ? "forms.validation.msg.field_required" : null));
        otherWaterSourceControl.editableProperty().bind(otherWaterSourceAvailable);

        final var form = Form.of(
                        Section.of(
                                        Field.ofIntegerType((IntegerProperty) model
                                                        .getPropertyFor(FieldKeys.Chiefdom.PC_COUNT))
                                                .label(FieldKeys.Chiefdom.PC_COUNT)
                                                .valueDescription("chefferie.form.fields.equipment_quantity.computers.description")
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType((IntegerProperty) model
                                                        .getPropertyFor(FieldKeys.Chiefdom.TABLET_COUNT))
                                                .label(FieldKeys.Chiefdom.TABLET_COUNT)
                                                .valueDescription("chefferie.form.fields.equipment_quantity.tablets.description")
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType(
                                                        (IntegerProperty) model.getPropertyFor(PRINTER_COUNT))
                                                .label(PRINTER_COUNT)
                                                .valueDescription("chefferie.form.fields.equipment_quantity.printers.description")
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType((IntegerProperty) model.getPropertyFor(CAR_COUNT))
                                                .label(CAR_COUNT)
                                                .validate(naturalNumberValidator)
                                                .valueDescription("chefferie.form.fields.equipment_quantity.cars.description")
                                                .span(ColSpan.HALF),
                                        Field.ofIntegerType((IntegerProperty) model.getPropertyFor(BIKE_COUNT))
                                                .label(BIKE_COUNT)
                                                .valueDescription("chefferie.form.fields.equipment_quantity.motorcycles.description")
                                                .span(ColSpan.HALF))
                                .collapsible(false)
                                .title("chefferie.form.sections.equipment.sections.equipment.title"),
                        Section.of(
                                        Field.ofBooleanType((BooleanProperty) model
                                                        .getPropertyFor(IS_CHIEFDOM_CHIEF_RESIDENCE))
                                                .label(IS_CHIEFDOM_CHIEF_RESIDENCE)
                                                // .valueDescription("chefferie.form.fields.structure.description")
                                                .span(ColSpan.HALF),
                                        Field.ofBooleanType(
                                                        (BooleanProperty) model.getPropertyFor(HAS_INTERNET))
                                                .label(HAS_INTERNET)
                                                .valueDescription("chefferie.form.fields.connexion.description")
                                                .span(ColSpan.HALF),
                                        internetTypeControl,
                                        Field.ofBooleanType((BooleanProperty) model
                                                        .getPropertyFor(HAS_ENEO_CONNECTION))
                                                .label("chefferie.form.fields.eneoConnexion.title")
                                                .valueDescription("chefferie.form.fields.eneoConnexion.description")
                                                .span(ColSpan.HALF),
                                        Field.ofBooleanType(
                                                        (BooleanProperty) model.getPropertyFor(WATER_ACCESS))
                                                .label(WATER_ACCESS)
                                                .valueDescription("chefferie.form.fields.waterAcces.description")
                                                .span(ColSpan.THIRD),
                                        waterSourcesControl,
                                        otherWaterSourceControl,
                                        Field.ofBooleanType((BooleanProperty) model
                                                        .getPropertyFor(HAS_EXTINGUISHER))
                                                .label(HAS_EXTINGUISHER)
                                                .valueDescription("chefferie.form.fields.extinguisher.description")
                                                .span(ColSpan.HALF))
                                .collapsible(false)
                                .title("chefferie.form.sections.equipment.structure_info.title"))
                .i18n(ts);
        spEquipmentContainer.setContent(new FormRenderer(form));
        equipmentForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tabInfra.setUserData(form);
    }

    private void spPersonalStatusContainer(TranslationService ts) {
        final var model = (ChefferieFormModel) this.model;
        final var form = Form.of(
                Group.of(
                        Field.ofIntegerType(
                                        (IntegerProperty) model.getPropertyFor(EMPLOYEE_COUNT))
                                .label(EMPLOYEE_COUNT)
                                .valueDescription("chefferie.form.fields.employer.description")
                                .span(ColSpan.HALF),
                        PersonnelInfoField
                                .personnelInfoField(model.personnelInfoProperty(), ts,
                                        model::updateTrackedPersonnelFields)
                                .bindEducationLevels(model.getOptionsFor(
                                        FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL))
                                .bindGenders(model.getOptionsFor(
                                        FieldKeys.PersonnelInfo.PERSONNEL_GENDER))
                                .bindKnowledgeLevels(model.getOptionsFor(
                                        FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL))
                                .label("fosa.form.fields.personnel_status.title")

                )).i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
        personnelForm = form;
        form.binding(BindingMode.CONTINUOUS);
        form.getFields().forEach(f -> f.editableProperty().bind(submittingProperty().not()));
        tabPersonnel.setUserData(form);
    }

}