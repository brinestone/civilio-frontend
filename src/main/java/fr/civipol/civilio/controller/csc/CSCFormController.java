package fr.civipol.civilio.controller.csc;

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
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.controller.FormFooterController;
import fr.civipol.civilio.controller.FormHeaderController;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.form.CSCFormModel;
import fr.civipol.civilio.form.FieldKeys;
import fr.civipol.civilio.form.FormModel;
import fr.civipol.civilio.form.field.GeoPointField;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.PhotoField;
import fr.civipol.civilio.form.renderer.FormRenderer;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.BooleanBinding;
import javafx.beans.property.*;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tab;
import javafx.scene.paint.Color;
import javafx.util.converter.LocalDateStringConverter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kordamp.ikonli.javafx.FontIcon;

import java.net.URL;
import java.time.LocalDate;
import java.time.format.FormatStyle;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class CSCFormController extends FormController implements Initializable, OptionSource {
    private boolean optionsLoaded = false;
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;
    @Getter(AccessLevel.PROTECTED)
    private FormModel model;
    private ResourceBundle resources;
    private final Map<String, Collection<Option>> allOptions = new HashMap<>();
    private Form vitalStatsForm, respondentForm, identificationForm, accessibilityForm, infrastructureForm, areasForm, equipmentForm, digitizationForm, recordProcurementForm, archivingForm, deedForm, statusOfArchivedRecordsForm, personnelInfoForm;
    @FXML
    private Tab tRespondent,
            tIdentification,
            tAccessibility,
            tInfra,
            tAreas,
            tEquipment,
            tDigitization,
            tProcurement,
            tStats,
            tDeeds,
            tStatusOfArchives,
            tEmployees;

    @FXML
    @Getter(AccessLevel.PROTECTED)
    @SuppressWarnings("unused")
    private FormHeaderController headerManagerController;

    @FXML
    @Getter(AccessLevel.PROTECTED)
    @SuppressWarnings("unused")
    private FormFooterController footerManagerController;

    @Override
    protected void loadOptions() {
        if (optionsLoaded) {
            log.debug("Options already loaded, skipping.");
            return;
        }

        executorService.submit(() -> {
            try {
                final var options = formService.findFormOptions(FormType.CSC);
                final var optionCount = options.values().stream()
                        .map(List::size)
                        .mapToInt(i -> i)
                        .sum();
                Optional.of(options)
                        .filter(Predicate.not(Map::isEmpty))
                        .ifPresent(map -> {
                            CSCFormController.this.allOptions.clear();
                            CSCFormController.this.allOptions.putAll(options);
                            log.debug("Loaded {} options", optionCount);
                        });
            } catch (Throwable t) {
                log.error("Could not load options", t);
            }
        });
        optionsLoaded = true;
        log.debug("Options loading initiated.");
    }

    @Override
    protected void doSubmit() throws Exception {
        formService.updateSubmission(
                submissionIndex.getValue(),
                FormType.CSC,
                this::extractFieldKey,
                model.getPendingUpdates().toArray(FieldChange[]::new)
        );
    }

    @Override
    protected Map<String, String> loadSubmissionData() throws Exception {
        return formService.findSubmissionData(submissionIndex.get(), FormType.CSC, this::keyMaker);
    }

    @Override
    public Collection<Option> findOptions(String group, String parent) {
        if (!allOptions.containsKey(group)) return Collections.emptyList();
        return allOptions.get(group).stream()
                .filter(o -> Objects.equals(o.parent(), parent))
                .toList();
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        this.resources = resources;
        TranslationService ts = new ResourceBundleService(resources);
        model = new CSCFormModel(this::valueLoader,
                this::keyMaker,
                this::extractFieldKey,
                this
        );
        initializeController();
        model.trackFieldChanges();
        configureForms(ts);
        BooleanBinding canSubmit = Bindings.and(
                respondentForm.validProperty()
                        .and(identificationForm.validProperty())
//                        .and(accessibilityForm.validProperty())
//                        .and(infrastructureForm.validProperty())
//                        .and(areasForm.validProperty())
//                        .and(equipmentForm.validProperty())
//                        .and(digitizationForm.validProperty())
//                        .and(recordProcurementForm.validProperty())
//                        .and(vitalStatsForm.validProperty())
//                        .and(archivingForm.validProperty())
//                        .and(deedForm.validProperty())
//                        .and(statusOfArchivedRecordsForm.validProperty())
//                        .and(personnelInfoForm.validProperty()),
                , Bindings.not(model.pristine())
        ).and(submittingProperty().not());
        footerManagerController.canSubmitProperty().bind(canSubmit);
        footerManagerController.canDiscardProperty().bind(submittingProperty().not());
        headerManagerController.canGoNextProperty().bind(canSubmit.not());
        headerManagerController.canGoPrevProperty().bind(canSubmit.not());
        headerManagerController.formTypeProperty().setValue(FormType.CSC);
        setupEventHandlers();
    }

    private void setupEventHandlers() {
        footerManagerController.setOnDiscard(e -> handleDiscardEvent(e, resources.getString("msg.discard_msg.txt")));
        footerManagerController.setOnSubmit(this::handleSubmitEvent);
    }

    @SuppressWarnings("DuplicatedCode")
    private void configureForms(TranslationService ts) {
        setupRespondent(ts);
        setupIdentification(ts);
        Stream.of(tRespondent,
                tAccessibility,
                tIdentification,
                tAccessibility,
                tInfra,
                tAreas,
                tEquipment,
                tDigitization,
                tProcurement,
                tStats,
                tDeeds,
                tStatusOfArchives,
                tEmployees
        ).forEach(tab -> {
            final var form = (Form) tab.getUserData();
            if (form == null) return;
            Supplier<Node> graphicProvider = () -> {
                final var icon = new FontIcon("fth-alert-circle");
                icon.setIconColor(Color.RED);
                return icon;
            };
            form.validProperty().addListener((ob, ov, nv) -> tab.setGraphic(nv ? null : graphicProvider.get()));
            tab.setGraphic(form.isValid() ? null : graphicProvider.get());
        });
    }

    @SuppressWarnings("unchecked")
    private void setupIdentification(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var structureIsSecondary = model.isStructureSecondary();
        final var primaryStructure = model.isStructurePrimary();
        final var nonFunctionalStructure = model.structureIsNonFunctional();
        final var nonFunctionReasonIsUnknown = Bindings.and(model.nonFunctionalReasonIsUnknown(), nonFunctionalStructure);
        final var isChiefdom = model.structureIsChiefdom();
        final var structureIsSpecialized = model.structureIsSpecialized();
        final var structureIsOrdered = Bindings.or(structureIsSpecialized, structureIsSecondary);
        final var structureHasAppointedOfficer = model.structureOfficerAppointed();

        final var form = Form.of(
                Group.of(
                        Field.ofSingleSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.DIVISION), (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.DIVISION))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.DIVISION)
                                .valueDescription("csc.form.sections.identification.fields.division.description")
//                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.DIVISION))),
                        Field.ofSingleSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.MUNICIPALITY), (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.MUNICIPALITY))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.MUNICIPALITY)
                                .valueDescription("csc.form.sections.identification.fields.municipality.description")
//                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.MUNICIPALITY))),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Identification.QUARTER))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.QUARTER)
//                                .span(ColSpan.THIRD)
                                .render(bindAutoCompletionWrapper(FieldKeys.CSC.Identification.QUARTER, FormType.CSC)),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Identification.FACILITY_NAME))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.FACILITY_NAME)
                                .span(ColSpan.TWO_THIRD),
                        Field.ofSingleSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.CATEGORY), (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.CATEGORY))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.THIRD)
                                .label(FieldKeys.CSC.Identification.CATEGORY)
                                .render(createOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.CATEGORY))),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.Identification.IS_CHIEFDOM))
                                .span(ColSpan.THIRD)
                                .required("forms.validation.msg.field_required")
                                .visibility(structureIsSecondary, false)
                                .label(FieldKeys.CSC.Identification.IS_CHIEFDOM),
                        Field.ofSingleSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.CHIEFDOM_DEGREE), (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.CHIEFDOM_DEGREE))
//                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.TWO_THIRD)
                                .render(createOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.CHIEFDOM_DEGREE)))
                                .visibility(isChiefdom)
                                .label(FieldKeys.CSC.Identification.CHIEFDOM_DEGREE),
                        Field.ofSingleSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.TOWN_SIZE), (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.TOWN_SIZE))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.TOWN_SIZE)))
                                .label(FieldKeys.CSC.Identification.TOWN_SIZE)
                                .visibility(primaryStructure),
                        Field.ofSingleSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.MILIEU), (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.MILIEU))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.MILIEU)))
                                .label(FieldKeys.CSC.Identification.MILIEU),
                        Field.ofIntegerType((IntegerProperty) model.getPropertyFor(FieldKeys.CSC.Identification.ATTACHED_CENTERS))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .label(FieldKeys.CSC.Identification.ATTACHED_CENTERS)
                                .visibility(primaryStructure)
                                .validate(IntegerRangeValidator.between(1, 50, "fosa.form.msg.value_out_of_range"))
                                .labelDescription("min = 1, max = 50"),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.Identification.IS_FUNCTIONAL))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.IS_FUNCTIONAL)
                                .span(ColSpan.THIRD),
                        Field.ofMultiSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.NON_FUNCTION_REASON), (ListProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.NON_FUNCTION_REASON))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.NON_FUNCTION_REASON)
                                .span(ColSpan.THIRD)
                                .render(createMultiOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.NON_FUNCTION_REASON)))
                                .visibility(nonFunctionalStructure),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Identification.OTHER_NON_FUNCTION_REASON))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.OTHER_NON_FUNCTION_REASON)
                                .span(ColSpan.THIRD)
                                .visibility(nonFunctionReasonIsUnknown),
                        Field.ofSingleSelectionType(model.getOptionsFor(FieldKeys.CSC.Identification.NON_FUNCTION_DURATION), (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Identification.NON_FUNCTION_DURATION))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.NON_FUNCTION_DURATION)
                                .span(ColSpan.TWO_THIRD)
                                .render(createOptionComboBox(ts, model.getOptionsFor(FieldKeys.CSC.Identification.NON_FUNCTION_REASON)))
                                .visibility(nonFunctionalStructure),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Identification.SECONDARY_CREATION_ORDER))
                                .label(FieldKeys.CSC.Identification.SECONDARY_CREATION_ORDER)
//                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.TWO_THIRD)
                                .visibility(structureIsOrdered),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.Identification.IS_OFFICER_APPOINTED))
                                .label(FieldKeys.CSC.Identification.IS_OFFICER_APPOINTED)
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.THIRD)
                                .visibility(structureIsOrdered, false),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Identification.OFFICER_APPOINTMENT_ORDER))
                                .label(FieldKeys.CSC.Identification.OFFICER_APPOINTMENT_ORDER)
                                .visibility(structureHasAppointedOfficer),
                        PhotoField.create((StringProperty) model.getPropertyFor(FieldKeys.CSC.Identification.PHOTO_URL))
                                .label(FieldKeys.CSC.Identification.PHOTO_URL)
                ),
                Section.of(
                        GeoPointField.gpsField((ObjectProperty<GeoPoint>) model.getPropertyFor(FieldKeys.CSC.Identification.GPS_COORDS), model::updateGpsCoords)
                                .label(FieldKeys.CSC.Identification.GPS_COORDS)
                ).title("csc.form.sections.identification.fields.gps.section.title")
        ).i18n(ts);
        form.binding(BindingMode.CONTINUOUS);
        identificationForm = form;
        tIdentification.setUserData(form);
        tIdentification.setContent(wrapForm(form));
    }

    @SuppressWarnings("unchecked")
    private void setupRespondent(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var today = LocalDate.now();
        final var localDateStringConverter = new LocalDateStringConverter(FormatStyle.MEDIUM);
        final var form = Form.of(
                Group.of(
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Respondent.NAME))
                                .label(FieldKeys.CSC.Respondent.NAME)
                                .required("forms.validation.msg.field_required"),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Respondent.POSITION))
                                .label(FieldKeys.CSC.Respondent.POSITION)
                                .valueDescription("csc.form.sections.respondent.fields.position.description")
                                .required("forms.validation.msg.field_required")
                                .render(bindAutoCompletionWrapper(FieldKeys.CSC.Respondent.POSITION, FormType.CSC)),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Respondent.PHONE))
                                .label(FieldKeys.CSC.Respondent.PHONE)
                                .span(ColSpan.HALF)
                                .valueDescription("csc.form.sections.respondent.fields.phone.description")
                                .validate(RegexValidator.forPattern(
                                        "^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$",
                                        "forms.msg.invalid_value")),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Respondent.EMAIL))
                                .label(FieldKeys.CSC.Respondent.EMAIL)
                                .span(ColSpan.HALF)
                                .valueDescription("csc.form.sections.respondent.fields.email.description")
                                .validate(RegexValidator.forPattern(
                                        "^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})?$",
                                        "forms.msg.invalid_value")),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.Respondent.KNOWS_CREATION_DATE))
                                .label(FieldKeys.CSC.Respondent.KNOWS_CREATION_DATE)
                                .valueDescription("csc.form.sections.respondent.fields.knows_creation_date.description")
                                .span(ColSpan.THIRD),
                        Field.ofDate((ObjectProperty<LocalDate>) model.getPropertyFor(FieldKeys.CSC.Respondent.CREATION_DATE))
                                .label(FieldKeys.CSC.Respondent.CREATION_DATE)
                                .visibility((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.Respondent.KNOWS_CREATION_DATE))
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
                                .span(ColSpan.TWO_THIRD)
                )
        ).i18n(ts);

        respondentForm = form;
        tRespondent.setContent(wrapForm(form));
        form.binding(BindingMode.CONTINUOUS);
        tRespondent.setUserData(form);
    }

    private ScrollPane wrapForm(Form form) {
        final var container = new ScrollPane(new FormRenderer(form));
        container.setFitToWidth(true);
        return container;
    }
}
