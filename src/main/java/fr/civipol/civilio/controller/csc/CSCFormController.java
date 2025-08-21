package fr.civipol.civilio.controller.csc;

import com.dlsc.formsfx.model.structure.*;
import com.dlsc.formsfx.model.util.BindingMode;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.formsfx.model.validators.DoubleRangeValidator;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.view.controls.SimpleDateControl;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.controller.FormFooterController;
import fr.civipol.civilio.controller.FormHeaderController;
import fr.civipol.civilio.domain.*;
import fr.civipol.civilio.domain.converter.OptionConverter;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.form.CSCFormModel;
import fr.civipol.civilio.form.FieldKeys;
import fr.civipol.civilio.form.FormModel;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.gps.GeoPointField;
import fr.civipol.civilio.form.field.table.ColumnDefinition;
import fr.civipol.civilio.form.field.table.TabularField;
import fr.civipol.civilio.services.FormService;
import fr.civipol.civilio.services.PingService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.BooleanBinding;
import javafx.beans.property.*;
import javafx.beans.value.ObservableBooleanValue;
import javafx.collections.ObservableList;
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
import org.apache.commons.lang3.StringUtils;
import org.kordamp.ikonli.javafx.FontIcon;

import java.io.File;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.FormatStyle;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class CSCFormController extends FormController implements Initializable, StorageHandler, SubFormDataLoader {
    private static final String PING_DOMAIN = "tile.openstreetmap.org";
    private boolean optionsLoaded = false;
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;
    @Getter(AccessLevel.PROTECTED)
    private FormModel model;
    private final PingService pingService;
    private ResourceBundle resources;
    private Form financialStatsForm, respondentForm, identificationForm, accessibilityForm, infrastructureForm,
            areasForm, scanningForm, equipmentForm, digitizationForm, recordProcurementForm, archivingForm,
            deedForm,
            staffForm,
            villagesForm,
            statusOfArchivedRecordsForm, personnelInfoForm, commentsForm;
    @FXML
    private Tab tRespondent,
            tIdentification,
            tArchiving,
            tAccessibility,
            tInfra,
            tAreas,
            tEquipment,
            tDigitization,
            tScanning,
            tProcurement,
            tStats,
            tArchivingParent,
            tDeeds,
            tStatusOfArchives,
            tAccessibilityParent,
            tVillages,
            tComments,
            tPersonnelParent,
            tStaff,
            tPersonnel;

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
                model.getPendingUpdates().toArray(FieldChange[]::new));
    }

    @Override
    protected Map<String, String> loadSubmissionData() throws Exception {
        return formService.findSubmissionData(submissionIndex.get(), FormType.CSC, this::keyMaker);
    }

    @FXML
    @Override
    public void initialize(URL location, ResourceBundle resources) {
        this.resources = resources;
        TranslationService ts = new ResourceBundleService(resources);
        model = new CSCFormModel(this::valueLoader,
                this::keyMaker,
                this::extractFieldKey,
                this,
                this);
        initializeController();
        model.trackFieldChanges();
        configureForms(ts);
        BooleanBinding canSubmit = Bindings.and(
                respondentForm.validProperty()
                        .and(identificationForm.validProperty())
                        .and(accessibilityForm.validProperty())
                        .and(infrastructureForm.validProperty())
                        .and(areasForm.validProperty())
                        .and(equipmentForm.validProperty())
                        .and(digitizationForm.validProperty())
                        .and(scanningForm.validProperty())
                        .and(recordProcurementForm.validProperty())
                        .and(financialStatsForm.validProperty())
                        .and(archivingForm.validProperty())
                        .and(deedForm.validProperty())
                        .and(statusOfArchivedRecordsForm.validProperty())
                        .and(villagesForm.validProperty())
                        .and(personnelInfoForm.validProperty())
                        .and(commentsForm.validProperty())
                        .and(staffForm.validProperty())
                , Bindings.not(model.pristine())).and(submittingProperty().not());
        footerManagerController.canSubmitProperty().bind(canSubmit);
        footerManagerController.canDiscardProperty().bind(submittingProperty().not());
        headerManagerController.canGoNextProperty().bind(canSubmit.not());
        headerManagerController.canGoPrevProperty().bind(canSubmit.not());
        headerManagerController.formTypeProperty().setValue(FormType.CSC);
        setupEventHandlers();
    }

    private void setupEventHandlers() {
        footerManagerController
                .setOnDiscard(e -> handleDiscardEvent(e, resources.getString("msg.discard_msg.txt")));
        footerManagerController.setOnSubmit(this::handleSubmitEvent);
    }

    @SuppressWarnings("DuplicatedCode")
    private void configureForms(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        setupRespondent(ts);
        setupIdentification(ts);
        setupAccessibility(ts);
        setupInfrastructure(ts);
        setupAreas(ts);
        setupEquipment(ts);
        setupDigitization(ts);
        setupScanning(ts);
        setupRecordProcurement(ts);
        setupFinancialStats(ts);
        setupArchiving(ts);
        setupStaff(ts);
        setupComments(ts);
        final var functionalBasedOptionalTabs = new Tab[]{
                tPersonnelParent, tInfra, tAreas, tEquipment,
                tDigitization, tScanning, tProcurement, tArchivingParent, tAccessibilityParent
        };
        final var statsBasedOptionalTabs = new Tab[]{tStats};
        prepareConditionalRendering(model.structureIsFunctional(), functionalBasedOptionalTabs);
        prepareConditionalRendering(model.centerCanHaveStats(), statsBasedOptionalTabs);

        Stream.of(tRespondent,
                tAccessibility,
                tIdentification,
                tAccessibility,
                tVillages,
                tInfra,
                tAreas,
                tEquipment,
                tArchiving,
                tDigitization,
                tProcurement,
                tStats,
                tDeeds,
                tStaff,
                tStatusOfArchives,
                tPersonnel).forEach(tab -> {
            final var form = (Form) tab.getUserData();
            if (form == null)
                return;
            Supplier<Node> graphicProvider = () -> {
                final var icon = new FontIcon("fth-alert-circle");
                icon.setIconColor(Color.RED);
                return icon;
            };
            form.validProperty().addListener((ob, ov, nv) -> tab
                    .setGraphic(nv ? null : graphicProvider.get()));
            tab.setGraphic(form.isValid() ? null : graphicProvider.get());
            form.getFields().forEach(f -> f.validProperty().addListener((ob, ov, nv) -> {
                if (nv == ov)
                    return;
                if (nv)
                    log.debug("\"{}\" is now valid", f.getLabel());
                else if (!ov)
                    log.debug("\"{}\" is now invalid", f.getLabel());
            }));
        });
    }

    private void setupComments(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var form = Form.of(Group.of(
                Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Comments.RELEVANT_INFO))
                        .label(FieldKeys.CSC.Comments.RELEVANT_INFO)
                        .multiline(true)
        )).binding(BindingMode.CONTINUOUS).i18n(ts);
        tComments.setContent(wrapForm(form));
        tComments.setUserData(form);
        commentsForm = form;
    }

    private void setupStaff(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final Function<String, IntegerField> integerFieldFactory = k -> Field.ofIntegerType((IntegerProperty) model.getPropertyFor(k))
                .label(k)
                .required("forms.validation.msg.field_required")
                .span(ColSpan.QUARTER)
                .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"));
        final var form = Form.of(Group.of(
                integerFieldFactory.apply(FieldKeys.CSC.PersonnelInfo.NON_OFFICER_MALE_COUNT),
                integerFieldFactory.apply(FieldKeys.CSC.PersonnelInfo.NON_OFFICER_FEMALE_COUNT),
                integerFieldFactory.apply(FieldKeys.CSC.PersonnelInfo.MALE_COUNT),
                integerFieldFactory.apply(FieldKeys.CSC.PersonnelInfo.FEMALE_COUNT)
        )).binding(BindingMode.CONTINUOUS).i18n(ts);
        tPersonnel.setContent(wrapForm(form));
        tPersonnel.setUserData(form);
        personnelInfoForm = form;
        setupPersonnel(ts);
    }

    private void setupPersonnel(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var personnelRoles = model.getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_POSITION);
        final var statusOptions = model.getOptionsFor(FieldKeys.CSC.PersonnelInfo.Officers.STATUS);
        final var genders = model.getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_GENDER);
        final var educationLevels = model.getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL);
        final var computerKnowledgeLevels = model.getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL);
        final var width = 200;
        final var form = Form.of(Group.of(
                TabularField.create(
                                model.getStaffData(),
                                HashMap::new
                        ).label("csc.form.sections.personnel_info.title")
                        .withColumns(
                                ColumnDefinition.<Map<String, Object>>ofStringType(FieldKeys.PersonnelInfo.PERSONNEL_NAME)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.<Map<String, Object>, Option>ofSingleSelectionType(OptionConverter.usingOptions(personnelRoles), personnelRoles, FieldKeys.PersonnelInfo.PERSONNEL_POSITION)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.<Map<String, Object>>ofStringType(FieldKeys.CSC.PersonnelInfo.Officers.OTHER_POSITION)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofSingleSelectionType(OptionConverter.usingOptions(statusOptions), statusOptions, FieldKeys.CSC.PersonnelInfo.Officers.STATUS)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofStringType(FieldKeys.CSC.PersonnelInfo.Officers.OTHER_STATUS)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofSingleSelectionType(OptionConverter.usingOptions(genders), genders, FieldKeys.PersonnelInfo.PERSONNEL_GENDER)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofStringType(FieldKeys.PersonnelInfo.PERSONNEL_PHONE)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofIntegerType(FieldKeys.PersonnelInfo.PERSONNEL_AGE)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofStringType(FieldKeys.PersonnelInfo.PERSONNEL_EMAIL)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofSingleSelectionType(OptionConverter.usingOptions(educationLevels), educationLevels, FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofSingleSelectionType(OptionConverter.usingOptions(computerKnowledgeLevels), computerKnowledgeLevels, FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofBooleanType(FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofBooleanType(FieldKeys.CSC.PersonnelInfo.HAS_ARCHIVING_TRAINING)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofBooleanType(FieldKeys.CSC.PersonnelInfo.HAS_COMPUTER_TRAINING)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.PersonnelInfo.Officers.CS_SENIORITY)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.PersonnelInfo.Officers.TOTAL_ALLOWANCE_2022)
                                        .width(width)
                                        .withValueProvider(model::provideStaffDataFieldProperty)
                        )
        )).binding(BindingMode.CONTINUOUS).i18n(ts);
        tStaff.setContent(wrapForm(form));
        tStaff.setUserData(form);
        staffForm = form;
    }

    private void setupArchiveStatus(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var width = 250;
        ListProperty<Option> yearOptions = model.getOptionsFor(FieldKeys.CSC.StatusOfArchivedRecords.YEAR);
        final var form = Form.of(Group.of(
                TabularField.create(model.getArchiveStatsData(), HashMap::new)
                        .withColumns(
                                ColumnDefinition.ofSingleSelectionType(OptionConverter.usingOptions(yearOptions), yearOptions, FieldKeys.CSC.StatusOfArchivedRecords.YEAR).width(75),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.StatusOfArchivedRecords.BIRTH_COUNT).width(width),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.StatusOfArchivedRecords.MARRIAGE_COUNT).width(width),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.StatusOfArchivedRecords.DEATH_COUNT).width(width)
                        ).label("csc.form.sections.status_of_archived_records.title")
        )).binding(BindingMode.CONTINUOUS).i18n(ts);
        tStatusOfArchives.setContent(wrapForm(form));
        tStatusOfArchives.setUserData(form);
        statusOfArchivedRecordsForm = form;
    }

    private void setupDeeds(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        ListProperty<Option> yearOptions = model.getOptionsFor(FieldKeys.CSC.Deeds.YEAR);
        final var width = 150;
        final var form = Form.of(Group.of(
                TabularField.create(model.getDeedsData(), HashMap::new)
                        .withColumns(
                                ColumnDefinition.ofSingleSelectionType(OptionConverter.usingOptions(yearOptions), yearOptions, FieldKeys.CSC.Deeds.YEAR)
                                        .withValueProvider(model::provideDeedFieldProperty)
                                        .width(75),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.Deeds.BIRTH_CERT_DRAWN)
                                        .withValueProvider(model::provideDeedFieldProperty)
                                        .width(width),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.Deeds.BIRTH_CERT_NOT_DRAWN)
                                        .withValueProvider(model::provideDeedFieldProperty)
                                        .width(width),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.Deeds.MARRIAGE_CERT_DRAWN)
                                        .withValueProvider(model::provideDeedFieldProperty)
                                        .width(width),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.Deeds.MARRIAGE_CERT_NOT_DRAWN)
                                        .withValueProvider(model::provideDeedFieldProperty)
                                        .width(width),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.Deeds.DEATH_CERT_DRAWN)
                                        .withValueProvider(model::provideDeedFieldProperty)
                                        .width(width),
                                ColumnDefinition.ofIntegerType(FieldKeys.CSC.Deeds.DEATH_CERT_NOT_DRAWN)
                                        .withValueProvider(model::provideDeedFieldProperty)
                                        .width(width)
                        ).label("csc.form.sections.deeds.title")
        )).i18n(ts).binding(BindingMode.CONTINUOUS);
        tDeeds.setContent(wrapForm(form));
        tDeeds.setUserData(form);
        deedForm = form;
    }

    @SuppressWarnings("unchecked")
    private void setupArchiving(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var structureIsPrimaryOrSecondary = model.structureIsPrimaryOrSecondary();
        final var centerUsesCustomArchivingType = model.centerUsesCustomArchivingType();
        final var centerIsNeitherPrimaryNorSecondary = model.centerIsNeitherPrimaryNorSecondary();
        final var centerHasBeenVandalized = model.centerHasBeenVandalized();
        final Function<String, BooleanField> booleanFieldFactory = k -> Field.ofBooleanType((BooleanProperty) model.getPropertyFor(k))
                .label(k)
                .span(ColSpan.QUARTER)
                .blockedLabel(true)
                .visibility(structureIsPrimaryOrSecondary);
        final var form = Form.of(Group.of(
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.HAS_ARCHIVING_ROOM),
                Field.ofSingleSelectionType(
                                model.getOptionsFor(FieldKeys.CSC.Archiving.ARCHIVE_ROOM_ELECTRIC_CONDITION),
                                (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Archiving.ARCHIVE_ROOM_ELECTRIC_CONDITION)
                        ).label(FieldKeys.CSC.Archiving.ARCHIVE_ROOM_ELECTRIC_CONDITION)
                        .required("forms.validation.msg.field_required")
                        .visibility(structureIsPrimaryOrSecondary)
                        .render(createOptionComboBox(ts))
                        .span(9),
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.HAS_FIRE_EXTINGUISHERS),
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.LOCKED_DOOR),
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.IS_ARCHIVE_ROOM_ACCESS_LIMITED),
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.ROOM_HAS_HUMIDITY)
                        .span(ColSpan.HALF)
                        .valueDescription("csc.form.sections.archiving.fields.room_has_humidity.description"),
                Field.ofMultiSelectionType(
                                model.getOptionsFor(FieldKeys.CSC.Archiving.REGISTER_ARCHIVING_TYPE),
                                (ListProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Archiving.REGISTER_ARCHIVING_TYPE)
                        ).label(FieldKeys.CSC.Archiving.REGISTER_ARCHIVING_TYPE)
                        .required("forms.validation.msg.field_required")
                        .span(ColSpan.HALF)
                        .render(createMultiOptionComboBox(ts))
                        .visibility(structureIsPrimaryOrSecondary),
                Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Archiving.OTHER_ARCHIVING_TYPE))
                        .required("forms.validation.msg.field_required")
                        .span(9)
                        .visibility(centerUsesCustomArchivingType)
                        .label(FieldKeys.CSC.Archiving.OTHER_ARCHIVING_TYPE),
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.WRITTEN_ARCHIVING_PLAN),
                Field.ofSingleSelectionType(
                                model.getOptionsFor(FieldKeys.CSC.Archiving.REGISTERS_DEPOSITED),
                                (ObjectProperty<Option>) model.getPropertyFor(FieldKeys.CSC.Archiving.REGISTERS_DEPOSITED)
                        ).label(FieldKeys.CSC.Archiving.REGISTERS_DEPOSITED)
                        .span(ColSpan.QUARTER)
                        .render(createOptionComboBox(ts))
                        .required("forms.validation.msg.field_required")
                        .visibility(structureIsPrimaryOrSecondary),
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.REGISTERS_DEPOSITED_SYSTEMATICALLY)
                        .visibility(centerIsNeitherPrimaryNorSecondary),
                booleanFieldFactory.apply(FieldKeys.CSC.Archiving.VANDALIZED)
                        .span(ColSpan.THIRD)
                        .valueDescription("csc.form.sections.archiving.fields.vandalized.description"),
                Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.Archiving.VANDALIZED_DATE))
                        .label(FieldKeys.CSC.Archiving.VANDALIZED_DATE)
                        .span(ColSpan.HALF)
                        .required("forms.validation.msg.field_required")
                        .visibility(centerHasBeenVandalized)
        )).i18n(ts).binding(BindingMode.CONTINUOUS);
        archivingForm = form;
        tArchiving.setUserData(form);
        tArchiving.setContent(wrapForm(form));

        setupDeeds(ts);
        setupArchiveStatus(ts);

        tArchivingParent.graphicProperty().bind(
                Bindings.createObjectBinding(() -> {
                    final var archivingGraphic = tArchiving.getGraphic();
                    final var deedGraphic = tDeeds.getGraphic();
                    final var archivingStatusGraphic = tStatusOfArchives.getGraphic();
                    return Stream.of(archivingGraphic, deedGraphic, archivingStatusGraphic)
                            .filter(Objects::nonNull)
                            .findFirst()
                            .map(FontIcon.class::cast)
                            .map(n -> {
                                final var clone = new FontIcon();
                                clone.setIconCode(n.getIconCode());
                                clone.setIconColor(n.getIconColor());
                                return clone;
                            }).orElse(null);
                }, tArchiving.graphicProperty(), tDeeds.graphicProperty(), tStatusOfArchives.graphicProperty())
        );
    }

    private void setupFinancialStats(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final Function<String, IntegerField> integerFieldFactory = k -> Field.ofIntegerType((IntegerProperty) model.getPropertyFor(k))
                .label(k)
                .required("forms.validation.msg.field_required")
                .span(ColSpan.THIRD)
                .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"));
        final var form = Form.of(Group.of(
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.BIRTH_CERT_COST),
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.BIRTH_CERT_COPY_COST),
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.MARRIAGE_CERT_COPY_COST),
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.DEATH_CERT_COPY_COST),
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.CELIBACY_CERT_COPY_COST),
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.NON_REGISTERED_CERTS),
                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.FinancialStats.RATES_UNDER_DELIBERATION))
                        .label(FieldKeys.CSC.FinancialStats.RATES_UNDER_DELIBERATION)
                        .span(ColSpan.THIRD),
                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.FinancialStats.PRICES_DISPLAYED))
                        .label(FieldKeys.CSC.FinancialStats.PRICES_DISPLAYED)
                        .span(ColSpan.THIRD),
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.MUNICIPALITY_BUDGET_2024),
                integerFieldFactory.apply(FieldKeys.CSC.FinancialStats.CS_BUDGET_2024)
        )).i18n(ts);
        tStats.setUserData(form);
        tStats.setContent(wrapForm(form));
        form.binding(BindingMode.CONTINUOUS);
        financialStatsForm = form;
    }

    @SuppressWarnings("unchecked")
    private void setupRecordProcurement(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var centerHasCustomRecordsProvider = model.centerHasCustomRecordsProvider();
        final Function<String, IntegerField> integerFieldFactory = k -> Field.ofIntegerType((IntegerProperty) model.getPropertyFor(k))
                .label(k)
                .span(ColSpan.THIRD)
                .required("forms.validation.msg.field_required")
                .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"));
        final var form = Form.of(Group.of(
                Field.ofMultiSelectionType(
                                model.getOptionsFor(FieldKeys.CSC.RecordProcurement.HAS_THERE_BEEN_LACK_OF_REGISTERS),
                                (ListProperty<Option>) model.getPropertyFor(FieldKeys.CSC.RecordProcurement.HAS_THERE_BEEN_LACK_OF_REGISTERS)
                        ).label(FieldKeys.CSC.RecordProcurement.HAS_THERE_BEEN_LACK_OF_REGISTERS)
                        .required("forms.validation.msg.field_required")
                        .render(createMultiOptionComboBox(ts))
                        .span(ColSpan.HALF),
                Field.ofMultiSelectionType(
                                model.getOptionsFor(FieldKeys.CSC.RecordProcurement.RECORDS_PROVIDER),
                                (ListProperty<Option>) model.getPropertyFor(FieldKeys.CSC.RecordProcurement.RECORDS_PROVIDER)
                        ).label(FieldKeys.CSC.RecordProcurement.RECORDS_PROVIDER)
                        .required("forms.validation.msg.field_required")
                        .render(createMultiOptionComboBox(ts))
                        .span(ColSpan.HALF),
                Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.RecordProcurement.OTHER_RECORDS_PROVIDER))
                        .label(FieldKeys.CSC.RecordProcurement.OTHER_RECORDS_PROVIDER)
                        .required("forms.validation.msg.field_required")
                        .span(ColSpan.HALF)
                        .visibility(centerHasCustomRecordsProvider),
                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.RecordProcurement.NON_COMPLIANT_REGISTERS_USED))
                        .blockedLabel(true)
                        .label(FieldKeys.CSC.RecordProcurement.NON_COMPLIANT_REGISTERS_USED)
                        .span(ColSpan.THIRD),
                integerFieldFactory.apply(FieldKeys.CSC.RecordProcurement.BLANK_REGISTRIES_COUNT),
                integerFieldFactory.apply(FieldKeys.CSC.RecordProcurement.BLANK_BIRTHS),
                integerFieldFactory.apply(FieldKeys.CSC.RecordProcurement.BLANK_MARRIAGES),
                integerFieldFactory.apply(FieldKeys.CSC.RecordProcurement.BLANK_DEATHS)
        )).i18n(ts);
        recordProcurementForm = form;
        form.binding(BindingMode.CONTINUOUS);
        tProcurement.setContent(wrapForm(form));
        tProcurement.setUserData(form);
    }

    @SuppressWarnings("unchecked")
    private void setupScanning(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var centerHasScannedDocuments = model.centerHasScannedDocuments();
        final var currentYear = Calendar.getInstance().get(Calendar.YEAR);
        final var centerIndexesData = model.centerIndexesData();
        final var centerUsesIndexedData = model.centerUsesIndexedData();
        final Function<String, IntegerField> integerFieldGenerator = k -> Field
                .ofIntegerType((IntegerProperty) model.getPropertyFor(k))
                .label(k)
                .visibility(centerHasScannedDocuments)
                .span(ColSpan.THIRD)
                .required("forms.validation.msg.field_required");
        final var form = Form.of(
                Group.of(
                        Field.ofBooleanType(
                                        (BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.RecordIndexing.RECORDS_SCANNED))
                                .label(FieldKeys.CSC.RecordIndexing.RECORDS_SCANNED)
                                .blockedLabel(true)
                                .span(ColSpan.THIRD),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                        FieldKeys.CSC.RecordIndexing.STAFF_TRAINED))
                                .label(FieldKeys.CSC.RecordIndexing.STAFF_TRAINED)
                                .blockedLabel(true)
                                .span(ColSpan.THIRD),
                        Field.ofIntegerType(
                                        (IntegerProperty) model.getPropertyFor(FieldKeys.CSC.RecordIndexing.DOCUMENT_SCAN_START_DATE)
                                )
                                .required("forms.validation.msg.field_required")
                                .visibility(centerHasScannedDocuments)
                                .label(FieldKeys.CSC.RecordIndexing.DOCUMENT_SCAN_START_DATE)
                                .valueDescription("range_1980_current_year")
                                .validate(IntegerRangeValidator.between(1980,
                                        currentYear,
                                        "fosa.form.msg.value_out_of_range"))
                                .span(ColSpan.THIRD),
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.RecordIndexing.DATA_INDEXED),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.RecordIndexing.DATA_INDEXED))
                                .label(FieldKeys.CSC.RecordIndexing.DATA_INDEXED)
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts))
                                .visibility(centerHasScannedDocuments),
                        integerFieldGenerator
                                .apply(FieldKeys.CSC.RecordIndexing.BIRTHS_SCANNED),
                        integerFieldGenerator
                                .apply(FieldKeys.CSC.RecordIndexing.MARRIAGES_SCANNED),
                        integerFieldGenerator
                                .apply(FieldKeys.CSC.RecordIndexing.DEATHS_SCANNED),
                        integerFieldGenerator.apply(FieldKeys.CSC.RecordIndexing.BIRTHS_INDEXED)
                                .visibility(centerIndexesData),
                        integerFieldGenerator
                                .apply(FieldKeys.CSC.RecordIndexing.MARRIAGES_INDEXED)
                                .visibility(centerIndexesData),
                        integerFieldGenerator.apply(FieldKeys.CSC.RecordIndexing.DEATHS_INDEXED)
                                .visibility(centerIndexesData),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(FieldKeys.CSC.RecordIndexing.IS_DATA_USED_BY_CSC))
                                .label(FieldKeys.CSC.RecordIndexing.IS_DATA_USED_BY_CSC)
                                .visibility(centerHasScannedDocuments)
                                .blockedLabel(true)
                                .span(ColSpan.THIRD),
                        Field.ofStringType((StringProperty) model.getPropertyFor(FieldKeys.CSC.RecordIndexing.DATA_USAGE))
                                .label(FieldKeys.CSC.RecordIndexing.DATA_USAGE)
                                .visibility(centerUsesIndexedData)
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.TWO_THIRD)
                )
        ).i18n(ts);
        tScanning.setContent(wrapForm(form));
        form.binding(BindingMode.CONTINUOUS);
        scanningForm = form;
        tScanning.setUserData(form);
    }

    @SuppressWarnings("unchecked")
    private void setupDigitization(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var today = LocalDate.now();
        final var converter = new LocalDateStringConverter(FormatStyle.MEDIUM);
        final var centerUsesComputerizedSystem = model.centerUsesComputerizedSystem();
        final var centerIsEquippedWithCSSoftware = model.centerIsEquippedWithCSSoftware();
        final var centerSoftwareIsNotFunctional = model.centerSoftwareIsNotFunctional();
        final var centerUsesCustomSponsor = model.centerUsesCustomSponsor();
        final var form = Form.of(
                        Group.of(
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.EXTERNAL_SERVICE_FROM_CR))
                                        .label(FieldKeys.CSC.Digitization.EXTERNAL_SERVICE_FROM_CR).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.EXTERNAL_CR_USES_INTERNET))
                                        .label(FieldKeys.CSC.Digitization.EXTERNAL_CR_USES_INTERNET).blockedLabel(true)
                                        .visibility(centerUsesComputerizedSystem)
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.HAS_CS_SOFTWARE))
                                        .label(FieldKeys.CSC.Digitization.HAS_CS_SOFTWARE).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofStringType((StringProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.CS_SOFTWARE_NAME))
                                        .label(FieldKeys.CSC.Digitization.CS_SOFTWARE_NAME)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF),
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Digitization.CS_SOFTWARE_LICENSE_SPONSOR),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Digitization.CS_SOFTWARE_LICENSE_SPONSOR))
                                        .label(FieldKeys.CSC.Digitization.CS_SOFTWARE_LICENSE_SPONSOR)
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .render(createOptionComboBox(ts)),
                                Field.ofStringType((StringProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.OTHER_CS_SOFTWARE_LICENSE_SPONSOR))
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF)
                                        .visibility(centerUsesCustomSponsor)
                                        .label(FieldKeys.CSC.Digitization.OTHER_CS_SOFTWARE_LICENSE_SPONSOR),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.USERS_RECEIVE_DIGITAL_ACTS))
                                        .label(FieldKeys.CSC.Digitization.USERS_RECEIVE_DIGITAL_ACTS)
                                        .visibility(centerIsEquippedWithCSSoftware).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofDate((ObjectProperty<LocalDate>) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.SOFTWARE_ACTIVATION_DATE))
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_ACTIVATION_DATE)
                                        .span(ColSpan.THIRD)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .validate(CustomValidator.forPredicate(
                                                d -> d == null || today.isEqual(d)
                                                        || today.isAfter(d),
                                                "fosa.form.msg.value_out_of_range"))
                                        .format(converter, "forms.msg.invalid_value")
                                        .render(new SimpleDateControl() {
                                            @Override
                                            public void initializeParts() {
                                                super.initializeParts();
                                                picker.setConverter(converter);
                                            }
                                        }),
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Digitization.SOFTWARE_FEEDBACK),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Digitization.SOFTWARE_FEEDBACK))
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_FEEDBACK)
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.THIRD)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .render(createOptionComboBox(ts)),
                                Field.ofIntegerType((IntegerProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.SOFTWARE_TRAINED_USER_COUNT))
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .validate(IntegerRangeValidator.atLeast(0,
                                                "fosa.form.msg.value_out_of_range"))
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_TRAINED_USER_COUNT),
                                Field.ofIntegerType((IntegerProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_BIRTHS_COUNT))
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .validate(IntegerRangeValidator.atLeast(0,
                                                "fosa.form.msg.value_out_of_range"))
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_BIRTHS_COUNT),
                                Field.ofIntegerType((IntegerProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_MARRIAGE_COUNT))
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .validate(IntegerRangeValidator.atLeast(0,
                                                "fosa.form.msg.value_out_of_range"))
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_MARRIAGE_COUNT),
                                Field.ofIntegerType((IntegerProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_DEATH_COUNT))
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF)
                                        .visibility(centerIsEquippedWithCSSoftware)
                                        .validate(IntegerRangeValidator.atLeast(0,
                                                "fosa.form.msg.value_out_of_range"))
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_DEATH_COUNT),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.SOFTWARE_IS_WORKING))
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_IS_WORKING)
                                        .visibility(centerIsEquippedWithCSSoftware).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofStringType((StringProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Digitization.SOFTWARE_DYSFUNCTION_REASON))
                                        .required("forms.validation.msg.field_required")
                                        .label(FieldKeys.CSC.Digitization.SOFTWARE_DYSFUNCTION_REASON)
                                        .visibility(centerSoftwareIsNotFunctional)
                                        .span(ColSpan.THIRD)))
                .i18n(ts);
        tDigitization.setContent(wrapForm(form));
        digitizationForm = form;
        form.binding(BindingMode.CONTINUOUS);
        tDigitization.setUserData(form);
    }

    private void setupEquipment(TranslationService ts) {
        final Function<String, IntegerField> fieldFactory = k -> Field
                .ofIntegerType((IntegerProperty) model.getPropertyFor(k))
                .label(k)
                .span(ColSpan.THIRD)
                .required("forms.validation.msg.field_required")
                .validate(IntegerRangeValidator.atLeast(0, "fosa.form.msg.value_out_of_range"));
        final var form = Form.of(
                        Group.of(
                                fieldFactory.apply(FieldKeys.CSC.Equipment.COMPUTER_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.SERVER_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.PRINTER_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.SCANNER_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.INVERTERS_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.FAN_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.PROJECTOR_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.OFFICE_TABLE_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.CHAIR_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.TABLET_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.AIR_CONDITIONER_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.CAR_COUNT),
                                fieldFactory.apply(FieldKeys.CSC.Equipment.BIKE_COUNT)))
                .i18n(ts);
        tEquipment.setContent(wrapForm(form));
        equipmentForm = form;
        form.binding(BindingMode.CONTINUOUS);
        tEquipment.setUserData(form);
    }

    private void prepareConditionalRendering(ObservableBooleanValue condition, Tab... tabs) {
        for (var tab : tabs) {
            tab.disableProperty().bind(Bindings.not(condition));
        }
    }

    private void setupAreas(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var centerHasDedicatedRooms = model.centerHasDedicatedRooms();
        final Function<ObservableList<Option>, OptionConverter> optionConverterProvider = list -> OptionConverter.usingOptions(ts, list);
        int columnWidth = 150;
        final var form = Form.of(
                        Group.of(
                                Field.ofBooleanType(
                                                (BooleanProperty) model.getPropertyFor(
                                                        FieldKeys.CSC.Areas.DEDICATED_CS_ROOMS))
                                        .label(FieldKeys.CSC.Areas.DEDICATED_CS_ROOMS)
                                        .span(ColSpan.THIRD).blockedLabel(true)
                                        .tooltip("csc.form.sections.areas.fields.office_count.description"),
                                Field.ofBooleanType((BooleanProperty) model
                                                .getPropertyFor(FieldKeys.CSC.Areas.MOVING))
                                        .label(FieldKeys.CSC.Areas.MOVING)
                                        .span(ColSpan.THIRD).blockedLabel(true)
                                        .visibility(centerHasDedicatedRooms),
                                TabularField.create(model.getRoomData(), HashMap::new)
                                        .label("csc.form.base_fields.sections.areas.sub_forms.rooms.title")
                                        .withColumns(
                                                ColumnDefinition.<Map<String, Object>>ofIntegerType(
                                                                FieldKeys.CSC.Areas.Rooms.NUMBER)
                                                        .width(columnWidth)
                                                        .withValueProvider(model::provideRoomDataFieldProperty),
                                                ColumnDefinition.<Map<String, Object>>ofStringType(FieldKeys.CSC.Areas.Rooms.NAME)
                                                        .width(columnWidth)
                                                        .withValueProvider(model::provideRoomDataFieldProperty),
                                                ColumnDefinition.<Map<String, Object>, Option>ofSingleSelectionType(
                                                                optionConverterProvider
                                                                        .apply(model.getOptionsFor(
                                                                                FieldKeys.CSC.Areas.Rooms.CONDITION)),
                                                                model.getOptionsFor(
                                                                        FieldKeys.CSC.Areas.Rooms.CONDITION),
                                                                FieldKeys.CSC.Areas.Rooms.CONDITION)
                                                        .withValueProvider(model::provideRoomDataFieldProperty)
                                                        .width(columnWidth),
                                                ColumnDefinition.<Map<String, Object>>ofFloatType(
                                                                FieldKeys.CSC.Areas.Rooms.AREA)
                                                        .withValueProvider(model::provideRoomDataFieldProperty)
                                                        .width(columnWidth),
                                                ColumnDefinition.<Map<String, Object>, Option>ofMultiSelectionType(
                                                                FieldKeys.CSC.Areas.Rooms.RENOVATION_NATURE,
                                                                model.getOptionsFor(
                                                                        FieldKeys.CSC.Areas.Rooms.RENOVATION_NATURE),
                                                                optionConverterProvider
                                                                        .apply(model.getOptionsFor(
                                                                                FieldKeys.CSC.Areas.Rooms.RENOVATION_NATURE)))
                                                        .withValueProvider(model::provideRoomDataFieldProperty)
                                                        .width(columnWidth))))
                .i18n(ts);
        areasForm = form;
        form.binding(BindingMode.CONTINUOUS);
        tAreas.setUserData(form);
        tAreas.setContent(wrapForm(form));
    }

    @SuppressWarnings("unchecked")
    private void setupInfrastructure(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var centerHasEneoConnection = model.centerHasEneoConnection();
        final var centerHasBackupPower = model.centerHasBackupPower();
        final var centerHasOtherBackupPower = model.centerHasOtherBackupPower();
        final var centerHasOtherNetworkType = model.centerHasOtherNetworkType();
        final var centerHasToilets = model.centerHasToilets();
        final var centerHasOtherInternetType = model.centerHasOtherInternetType();
        final var centerHasInternetConnection = model.centerHasInternetConnection();
        final var form = Form.of(
                        Group.of(
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Infrastructure.STATUS),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Infrastructure.STATUS))
                                        .label(FieldKeys.CSC.Infrastructure.STATUS)
                                        .span(ColSpan.THIRD)
                                        .required("forms.validation.msg.field_required")
                                        .valueDescription(
                                                "csc.form.sections.infra.fields.occupancy_status.description")
                                        .render(createOptionComboBox(ts)),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.ENEO_CONNECTION))
                                        .label(FieldKeys.CSC.Infrastructure.ENEO_CONNECTION).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.POWER_OUTAGES))
                                        .label(FieldKeys.CSC.Infrastructure.POWER_OUTAGES)
                                        .span(ColSpan.THIRD).blockedLabel(true)
                                        .visibility(centerHasEneoConnection),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.STABLE_POWER))
                                        .label(FieldKeys.CSC.Infrastructure.STABLE_POWER).blockedLabel(true)
                                        .span(ColSpan.THIRD)
                                        .visibility(centerHasEneoConnection),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES_AVAILABLE))
                                        .label(FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES_AVAILABLE).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofMultiSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES),
                                                (ListProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES))
                                        .label(FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES)
                                        .render(createMultiOptionComboBox(ts))
                                        .span(ColSpan.THIRD)
                                        .required("forms.validation.msg.field_required")
                                        .visibility(centerHasBackupPower),
                                Field.ofStringType((StringProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.OTHER_POWER_SOURCE))
                                        .label(FieldKeys.CSC.Infrastructure.OTHER_POWER_SOURCE)
                                        .required("forms.validation.msg.field_required")
                                        .visibility(centerHasOtherBackupPower)
                                        .span(ColSpan.THIRD),
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Infrastructure.WATER_SOURCES),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Infrastructure.WATER_SOURCES))
                                        .label(FieldKeys.CSC.Infrastructure.WATER_SOURCES)
                                        .render(createOptionComboBox(ts))
                                        .span(ColSpan.THIRD)
                                        .required("forms.validation.msg.field_required"),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.TOILETS_AVAILABLE))
                                        .label(FieldKeys.CSC.Infrastructure.TOILETS_AVAILABLE).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.SEPARATE_TOILETS_AVAILABLE))
                                        .label(FieldKeys.CSC.Infrastructure.SEPARATE_TOILETS_AVAILABLE).blockedLabel(true)
                                        .span(ColSpan.THIRD)
                                        .visibility(centerHasToilets),
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Infrastructure.HAS_FIBER_CONNECTION),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Infrastructure.HAS_FIBER_CONNECTION))
                                        .label(FieldKeys.CSC.Infrastructure.HAS_FIBER_CONNECTION)
                                        .span(ColSpan.THIRD)
                                        .render(createOptionComboBox(ts)),
                                Field.ofMultiSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Infrastructure.NETWORK_TYPE),
                                                (ListProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Infrastructure.NETWORK_TYPE))
                                        .label(FieldKeys.CSC.Infrastructure.NETWORK_TYPE)
                                        .span(ColSpan.THIRD)
                                        .render(createMultiOptionComboBox(ts))
                                        .required("forms.validation.msg.field_required"),
                                Field.ofStringType((StringProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.OTHER_NETWORK_TYPE))
                                        .label(FieldKeys.CSC.Infrastructure.OTHER_NETWORK_TYPE)
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.HALF)
                                        .visibility(centerHasOtherNetworkType),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.HAS_INTERNET))
                                        .label(FieldKeys.CSC.Infrastructure.HAS_INTERNET).blockedLabel(true)
                                        .span(ColSpan.THIRD),
                                Field.ofMultiSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Infrastructure.NETWORK_TYPE),
                                                (ListProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Infrastructure.INTERNET_TYPE))
                                        .label(FieldKeys.CSC.Infrastructure.INTERNET_TYPE)
                                        .span(ColSpan.THIRD)
                                        .required("forms.validation.msg.field_required")
                                        .visibility(centerHasInternetConnection)
                                        .render(createMultiOptionComboBox(ts)),
                                Field.ofStringType((StringProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Infrastructure.OTHER_INTERNET_TYPE))
                                        .label(FieldKeys.CSC.Infrastructure.OTHER_INTERNET_TYPE)
                                        .span(ColSpan.THIRD)
                                        .required("forms.validation.msg.field_required")
                                        .visibility(centerHasOtherInternetType),
                                Field.ofSingleSelectionType(
                                                model.getOptionsFor(
                                                        FieldKeys.CSC.Infrastructure.INTERNET_SPONSOR),
                                                (ObjectProperty<Option>) model.getPropertyFor(
                                                        FieldKeys.CSC.Infrastructure.INTERNET_SPONSOR))
                                        .label(FieldKeys.CSC.Infrastructure.INTERNET_SPONSOR)
                                        .required("forms.validation.msg.field_required")
                                        .span(ColSpan.THIRD)
                                        .render(createOptionComboBox(ts))
                                        .visibility(centerHasInternetConnection)))
                .i18n(ts);

        infrastructureForm = form;
        form.binding(BindingMode.CONTINUOUS);
        tInfra.setUserData(form);
        tInfra.setContent(wrapForm(form));
    }

    @SuppressWarnings("unchecked")
    private void setupAccessibility(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var centerHasTarredRoad = model.centerHasTarredRoad();
        final var form = Form.of(
                Group.of(
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.Accessibility.ROAD_TYPE),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Accessibility.ROAD_TYPE))
                                .span(ColSpan.HALF)
                                .label(FieldKeys.CSC.Accessibility.ROAD_TYPE)
                                .required("forms.validation.msg.field_required")
                                .render(createOptionComboBox(ts)),
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.Accessibility.ROAD_OBSTACLE),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Accessibility.ROAD_OBSTACLE))
                                .span(ColSpan.HALF)
                                .label(FieldKeys.CSC.Accessibility.ROAD_OBSTACLE)
                                .visibility(centerHasTarredRoad)
                                .required("forms.validation.msg.field_required")
                                .render(createOptionComboBox(ts)),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Accessibility.DOES_ROAD_DETERIORATE))
                                .span(ColSpan.HALF).blockedLabel(true)
                                .label(FieldKeys.CSC.Accessibility.DOES_ROAD_DETERIORATE),
                        Field.ofDoubleType((DoubleProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Accessibility.ATTACHED_VILLAGES_NUMBER))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .label(FieldKeys.CSC.Accessibility.ATTACHED_VILLAGES_NUMBER)
                                .validate(DoubleRangeValidator.between(0, 100,
                                        "fosa.form.msg.value_out_of_range"))
                                .valueDescription("range_0_100"),
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.Accessibility.COVER_RADIUS),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Accessibility.COVER_RADIUS))
                                .required("forms.validation.msg.field_required")
                                .render(createOptionComboBox(ts))
                                .label(FieldKeys.CSC.Accessibility.COVER_RADIUS)
                                .span(ColSpan.HALF)
                )
        ).i18n(ts);
        form.binding(BindingMode.CONTINUOUS);
        accessibilityForm = form;
        tAccessibility.setUserData(form);
        tAccessibility.setContent(wrapForm(form));
        setupVillages(ts);
        tAccessibilityParent.graphicProperty().bind(Bindings.createObjectBinding(() -> Stream.of(tAccessibility.getGraphic(), tVillages.getGraphic())
                .filter(Objects::nonNull)
                .findFirst()
                .map(FontIcon.class::cast)
                .map(n -> {
                    final var clone = new FontIcon();
                    clone.setIconCode(n.getIconCode());
                    clone.setIconColor(n.getIconColor());
                    return clone;
                }).orElse(null), tAccessibility.graphicProperty(), tVillages.graphicProperty()));
    }

    private void setupVillages(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var form = Form.of(Group.of(TabularField.create(
                        model.getVillageData(),
                        HashMap::new)
                .label("csc.form.base_fields.sections.accessibility.sub_forms.villages.title")
                .withColumns(
                        ColumnDefinition.<Map<String, Object>>ofStringType(FieldKeys.CSC.Accessibility.Villages.NAME)
                                .withValueProvider(model::provideVillageDataFieldProperty)
                                .width(150),
                        ColumnDefinition.<Map<String, Object>>ofFloatType(
                                        FieldKeys.CSC.Accessibility.Villages.DISTANCE
                                ).width(350)
                                .withValueProvider(model::provideVillageDataFieldProperty)
                                .editable(true),
                        ColumnDefinition.<Map<String, Object>>ofStringType(FieldKeys.CSC.Accessibility.Villages.OBSERVATIONS)
                                .withValueProvider(model::provideVillageDataFieldProperty)
                                .width(150)
                ))).i18n(ts).binding(BindingMode.CONTINUOUS);
        villagesForm = form;
        tVillages.setContent(wrapForm(form));
        tVillages.setUserData(form);
    }

    @SuppressWarnings("unchecked")
    private void setupIdentification(TranslationService ts) {
        final var model = (CSCFormModel) this.model;
        final var structureIsSecondary = model.isStructureSecondary();
        final var primaryStructure = model.isStructurePrimary();
        final var nonFunctionalStructure = model.structureIsNonFunctional();
        final var nonFunctionReasonIsUnknown = Bindings.and(model.nonFunctionalReasonIsUnknown(),
                nonFunctionalStructure);
        final var isChiefdom = model.structureIsChiefdom();
        final var structureIsSpecialized = model.structureIsSpecialized();
        final var structureIsOrdered = Bindings.or(structureIsSpecialized, structureIsSecondary);
        final var structureHasAppointedOfficer = model.structureOfficerAppointed();
        final var connectionAvailable = new SimpleBooleanProperty(true);
        final Consumer<Boolean> toggler = nv -> {
            if (nv) {
                pingService.observe(PING_DOMAIN, v -> Platform.runLater(() -> connectionAvailable.setValue(v)));
            } else {
                pingService.unobserve(PING_DOMAIN);
            }
        };
        tIdentification.selectedProperty().addListener((ob, ov, nv) -> toggler.accept(nv));

        final var form = Form.of(
                Group.of(
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.Identification.DIVISION),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.DIVISION))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.DIVISION)
                                .valueDescription(
                                        "csc.form.sections.identification.fields.division.description")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts)),
                        Field.ofSingleSelectionType(model.getOptionsFor(
                                                FieldKeys.CSC.Identification.MUNICIPALITY),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.MUNICIPALITY))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.MUNICIPALITY)
                                .valueDescription(
                                        "csc.form.sections.identification.fields.municipality.description")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts)),
                        Field.ofStringType((StringProperty) model
                                        .getPropertyFor(FieldKeys.CSC.Identification.QUARTER))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.QUARTER)
                                .span(ColSpan.HALF)
                                .render(bindAutoCompletionWrapper(
                                        FieldKeys.CSC.Identification.QUARTER,
                                        FormType.CSC)),
                        Field.ofStringType((StringProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.FACILITY_NAME))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.FACILITY_NAME)
                                .span(ColSpan.HALF),
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.Identification.CATEGORY),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.CATEGORY))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .label(FieldKeys.CSC.Identification.CATEGORY)
                                .render(createOptionComboBox(ts)),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.IS_CHIEFDOM))
                                .span(ColSpan.HALF).blockedLabel(true)
                                // .required("forms.validation.msg.field_required")
                                .visibility(structureIsSecondary)
                                .label(FieldKeys.CSC.Identification.IS_CHIEFDOM),
                        Field.ofSingleSelectionType(model.getOptionsFor(
                                                FieldKeys.CSC.Identification.CHIEFDOM_DEGREE),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.CHIEFDOM_DEGREE))
                                // .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts))
                                .visibility(isChiefdom)
                                .label(FieldKeys.CSC.Identification.CHIEFDOM_DEGREE),
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.Identification.TOWN_SIZE),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.TOWN_SIZE))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts))
                                .label(FieldKeys.CSC.Identification.TOWN_SIZE)
                                .visibility(primaryStructure),
                        Field.ofSingleSelectionType(
                                        model.getOptionsFor(
                                                FieldKeys.CSC.Identification.MILIEU),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.MILIEU))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts))
                                .label(FieldKeys.CSC.Identification.MILIEU),
                        Field.ofIntegerType((IntegerProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.ATTACHED_CENTERS))
                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .label(FieldKeys.CSC.Identification.ATTACHED_CENTERS)
                                .visibility(primaryStructure)
                                .validate(IntegerRangeValidator.between(1, 50,
                                        "fosa.form.msg.value_out_of_range"))
                                .valueDescription("range_1_50"),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.IS_FUNCTIONAL)).blockedLabel(true)
                                // .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.IS_FUNCTIONAL)
                                .span(ColSpan.THIRD),
                        Field.ofMultiSelectionType(model.getOptionsFor(
                                                FieldKeys.CSC.Identification.NON_FUNCTION_REASON),
                                        (ListProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.NON_FUNCTION_REASON))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.NON_FUNCTION_REASON)
                                .span(ColSpan.THIRD)
                                .render(createMultiOptionComboBox(ts))
                                .visibility(nonFunctionalStructure),
                        Field.ofStringType((StringProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.OTHER_NON_FUNCTION_REASON))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.OTHER_NON_FUNCTION_REASON)
                                .span(ColSpan.HALF)
                                .visibility(nonFunctionReasonIsUnknown),
                        Field.ofSingleSelectionType(model.getOptionsFor(
                                                FieldKeys.CSC.Identification.NON_FUNCTION_DURATION),
                                        (ObjectProperty<Option>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.NON_FUNCTION_DURATION))
                                .required("forms.validation.msg.field_required")
                                .label(FieldKeys.CSC.Identification.NON_FUNCTION_DURATION)
                                .span(ColSpan.HALF)
                                .render(createOptionComboBox(ts))
                                .visibility(nonFunctionalStructure),
                        Field.ofStringType((StringProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.SECONDARY_CREATION_ORDER))
                                .label(FieldKeys.CSC.Identification.SECONDARY_CREATION_ORDER)
                                // .required("forms.validation.msg.field_required")
                                .span(ColSpan.HALF)
                                .visibility(structureIsOrdered),
                        Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.IS_OFFICER_APPOINTED))
                                .label(FieldKeys.CSC.Identification.IS_OFFICER_APPOINTED).blockedLabel(true)
//                                .required("forms.validation.msg.field_required")
                                .span(ColSpan.THIRD)
                                .visibility(structureIsOrdered),
                        Field.ofStringType((StringProperty) model.getPropertyFor(
                                        FieldKeys.CSC.Identification.OFFICER_APPOINTMENT_ORDER))
                                .label(FieldKeys.CSC.Identification.OFFICER_APPOINTMENT_ORDER)
                                .visibility(structureHasAppointedOfficer)
                                .span(ColSpan.HALF),
                        GeoPointField.create((ObjectProperty<GeoPoint>) model.getPropertyFor(
                                                FieldKeys.CSC.Identification.GPS_COORDS),
                                        model::updateGpsCoords)
                                .label(FieldKeys.CSC.Identification.GPS_COORDS)
                                .withConnectivityBinding(connectionAvailable)
//                                .span(ColSpan.TWO_THIRD)
                        /*
                         * ,
                         * PhotoField.create((
                         * StringProperty)
                         * model.getPropertyFor(
                         * FieldKeys.CSC.Identification.
                         * PHOTO_URL), this)
                         * .label(FieldKeys.CSC.
                         * Identification.PHOTO_URL)
                         * .span(ColSpan.HALF)
                         */
                )/* .title("csc.form.sections.identification.title") */
                // Section.of(
                //
                // ).title("csc.form.sections.identification.fields.gps.section.title")
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
        final var respondentKnowsCreationDate = model.respondentKnowsCreationDate();
        final var localDateStringConverter = new LocalDateStringConverter(FormatStyle.MEDIUM);
        final var form = Form.of(
                        Group.of(
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.CSC.Respondent.NAME))
                                        .label(FieldKeys.CSC.Respondent.NAME)
                                        .required("forms.validation.msg.field_required"),
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.CSC.Respondent.POSITION))
                                        .label(FieldKeys.CSC.Respondent.POSITION)
                                        .valueDescription(
                                                "csc.form.sections.respondent.fields.position.description")
                                        .required("forms.validation.msg.field_required")
                                        .render(bindAutoCompletionWrapper(
                                                FieldKeys.CSC.Respondent.POSITION,
                                                FormType.CSC)),
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.CSC.Respondent.PHONE))
                                        .label(FieldKeys.CSC.Respondent.PHONE)
                                        .span(ColSpan.HALF)
                                        .valueDescription(
                                                "csc.form.sections.respondent.fields.phone.description")
                                        .validate(RegexValidator.forPattern(
                                                "^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$",
                                                "forms.msg.invalid_value")),
                                Field.ofStringType((StringProperty) model
                                                .getPropertyFor(FieldKeys.CSC.Respondent.EMAIL))
                                        .label(FieldKeys.CSC.Respondent.EMAIL)
                                        .span(ColSpan.HALF)
                                        .valueDescription(
                                                "csc.form.sections.respondent.fields.email.description")
                                        .validate(RegexValidator.forPattern(
                                                "^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})?$",
                                                "forms.msg.invalid_value")),
                                Field.ofBooleanType((BooleanProperty) model.getPropertyFor(
                                                FieldKeys.CSC.Respondent.KNOWS_CREATION_DATE))
                                        .label(FieldKeys.CSC.Respondent.KNOWS_CREATION_DATE).blockedLabel(true)
                                        .valueDescription(
                                                "csc.form.sections.respondent.fields.knows_creation_date.description")
                                        .span(ColSpan.THIRD),
                                Field.ofDate((ObjectProperty<LocalDate>) model
                                                .getPropertyFor(FieldKeys.CSC.Respondent.CREATION_DATE))
                                        .label(FieldKeys.CSC.Respondent.CREATION_DATE)
                                        .visibility(respondentKnowsCreationDate)
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
                                        .span(ColSpan.THIRD)))
                .i18n(ts);

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

    @Override
    public void upload(File file, Consumer<UploadTask> callback) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void delete(String id) {
        throw new UnsupportedOperationException();
    }

    public void onClose() {
        pingService.unobserve(PING_DOMAIN);
    }

    @Override
    public Collection<Map<String, Object>> loadSubFormData(String... fieldKeys) {
        final var result = new ArrayList<Map<String, Object>>();
        for (var key : fieldKeys) {
            for (var entry : submissionData.entrySet()) {
                final var fieldKey = extractFieldKey(entry.getKey());
                if (!fieldKey.equals(key)) continue;
                final var pos = Integer.parseInt(extractFieldIdentifiers(entry.getKey())[0]);
                if (pos >= result.size()) {
                    var cnt = result.size();
                    while (cnt <= pos) {
                        result.add(new HashMap<>());
                        cnt++;
                    }
                }
                final var map = result.get(pos);
                map.put(key, entry.getValue());
            }
        }
        return result;
    }
}
