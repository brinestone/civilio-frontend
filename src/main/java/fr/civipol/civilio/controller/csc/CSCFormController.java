package fr.civipol.civilio.controller.csc;

import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.util.BindingMode;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.controller.FormFooterController;
import fr.civipol.civilio.controller.FormHeaderController;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.form.CSCFormDataManager;
import fr.civipol.civilio.form.FormDataManager;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.renderer.FormRenderer;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.BooleanBinding;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Tab;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.net.URL;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Predicate;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class CSCFormController extends FormController implements AppController, Initializable, OptionSource {
    private boolean optionsLoaded = false;
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;
    @Getter(AccessLevel.PROTECTED)
    private FormDataManager model;
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
                Optional.ofNullable(options)
                        .filter(Predicate.not(Map::isEmpty))
                        .ifPresent(map -> {
                            CSCFormController.this.allOptions.clear();
                            CSCFormController.this.allOptions.putAll(options);
                            log.debug("Loaded {} options", options.size());
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
        if (allOptions.containsKey(group)) return Collections.emptyList();
        return allOptions.get(group).stream()
                .filter(o -> Objects.equals(o.parent(), parent))
                .toList();
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        this.resources = resources;
        TranslationService ts = new ResourceBundleService(resources);
        model = new CSCFormDataManager(this::valueLoader, this::keyMaker, this::extractFieldKey, this);
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
                        .and(recordProcurementForm.validProperty())
                        .and(vitalStatsForm.validProperty())
                        .and(archivingForm.validProperty())
                        .and(deedForm.validProperty())
                        .and(statusOfArchivedRecordsForm.validProperty())
                        .and(personnelInfoForm.validProperty()),
                Bindings.not(model.pristine())
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

    private void configureForms(TranslationService ts) {
        setupRespondent(ts);
    }

    private void setupRespondent(TranslationService ts) {
        final var model = (CSCFormDataManager) this.model;
        final var form = Form.of();

        tRespondent.setContent(new FormRenderer(form));
        form.binding(BindingMode.CONTINUOUS);
        tRespondent.setUserData(form);
    }
}
