package fr.civipol.civilio.controller;

import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.view.controls.SimpleComboBoxControl;
import com.dlsc.formsfx.view.controls.SimpleTextControl;
import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.domain.converter.OptionConverter;
import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.form.FormModel;
import fr.civipol.civilio.form.control.MultiComboBoxControl;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.services.FormService;
import javafx.application.Platform;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.ObservableMap;
import javafx.event.ActionEvent;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Stream;

/**
 * Represents a base form capable of submitting data and loading existing submission data.
 */
@Slf4j
public abstract class FormController implements AppController, OptionSource {
    protected Map<String, Collection<Option>> allOptions = new HashMap<>();
    private final BooleanProperty submitting = new SimpleBooleanProperty(this, "submitting", false);
    @Setter
    protected Consumer<String> onSubmit;
    @Setter
    protected Consumer<Void> onDiscard;
    protected final StringProperty submissionIndex = new SimpleStringProperty(this, "submissionIndex");
    protected final ObservableMap<String, Object> submissionData = FXCollections.observableHashMap();

    protected void setSubmitting(boolean v) {
        submitting.set(v);
    }

    public BooleanProperty submittingProperty() {
        return submitting;
    }

    protected abstract FormModel getModel();

    public void setSubmissionIndex(String submissionIndex) {
        this.submissionIndex.set(submissionIndex);
    }

    protected abstract FormHeaderController getHeaderManagerController();

    protected abstract void loadOptions();

    @Override
    public Collection<Option> findOptions(String group, String... parent) {
        return allOptions.getOrDefault(group, Collections.emptyList()).stream()
                .filter(o -> parent.length == 0 || Stream.of(parent).anyMatch(p -> p.equals(o.parent())))
                .toList();
    }

    protected FormController() {
        submissionIndex.addListener((ob, ov, nv) -> {
            if (StringUtils.isBlank(nv)) {
                getModel().trackFieldChanges();
                return;
            }
            updateFormValues();
        });
    }

    protected String keyMaker(FieldMapping mapping, Integer ordinal) {
        return keyMaker(mapping.field(), ordinal);
    }

    protected String keyMaker(String key, Integer ordinal) {
        return "%s:::%d".formatted(key, ordinal);
    }

    protected String extractFieldKey(String s) {
        return Optional.ofNullable(s)
                .filter(StringUtils::isNotBlank)
                .map(ss -> ss.split(":::")[0])
                .orElse(null);
    }

    protected String[] extractFieldIdentifiers(String field) {
        return Optional.ofNullable(field)
                .filter(s -> s.contains(":::"))
                .map(ss -> ss.split(":::")[1])
                .map(s -> s.split("\\|"))
                .orElse(new String[]{});
    }

    protected void initializeController() {
        getHeaderManagerController().indexProperty().bindBidirectional(getModel().indexProperty());
        getHeaderManagerController().validationCodeProperty().bindBidirectional(getModel().validationCodeProperty());
        getHeaderManagerController().submissionIndexProperty().bindBidirectional(submissionIndex);
        getHeaderManagerController().indexFieldNameProperty().setValue(getModel().getIndexFieldKey());
    }

    protected Object valueLoader(String id) {
        final var key = extractFieldKey(id);
        final var builder = Stream.builder();
        for (var k : submissionData.keySet()) {
            if (!k.startsWith(key)) continue;
            builder.add(submissionData.get(k));
        }
        final var result = builder.build().toList();
        if (result.isEmpty()) return null;
        else if (result.size() == 1) return result.get(0);
        return result;
    }

    public void updateFormValues() {
        getHeaderManagerController().loadingProperty().set(true);
        getModel().resetChanges();
        getExecutorService().submit(() -> {
            try {
                loadOptions();
                doLoadSubmissionData();
                Platform.runLater(() -> {
                    getModel().loadInitialOptions();
                    getModel().loadValues();
                    getModel().markAsPristine();
                    getModel().trackFieldChanges();
                });
            } catch (Throwable t) {
                log.error("error while loading submission data", t);
                Platform.runLater(() -> {
                    final var alert = new Alert(Alert.AlertType.ERROR, null, ButtonType.OK);
                    alert.setHeaderText(t.getLocalizedMessage());
                    alert.showAndWait();
                });
            } finally {
                Platform.runLater(() -> getHeaderManagerController().loadingProperty().set(false));
            }
        });
    }

    /**
     * Performs the actual logic of discarding the submitted data.
     */
    protected void doDiscard() {
    }

    /**
     * Performs the actual logic of submitting the form's data.
     */
    protected abstract void doSubmit() throws Exception;

    protected abstract Map<String, String> loadSubmissionData() throws Exception;

    protected abstract ExecutorService getExecutorService();

    protected abstract FormService getFormService();

    protected void handleSubmitEvent(ActionEvent ignored) {
        setSubmitting(true);
        getExecutorService().submit(() -> {
            try {
                doSubmit();
                Platform.runLater(() -> Optional.ofNullable(onSubmit)
                        .ifPresent(c -> c.accept(submissionIndex.get())));
                doLoadSubmissionData();
            } catch (Throwable t) {
                log.error("error while submitting form", t);
                showErrorAlert(t.getLocalizedMessage());
            } finally {
                Platform.runLater(() -> setSubmitting(false));
            }
        });
    }

    protected void handleDiscardEvent(ActionEvent ignored, String confirmationMessage) {
        if (getModel().pristine().get()) {
            Platform.runLater(() -> Optional.ofNullable(onDiscard).ifPresent(c -> c.accept(null)));
            return;
        }
        showConfirmationDialog(confirmationMessage).ifPresent(__ -> getExecutorService().submit(() -> {
            try {
                doDiscard();
                Platform.runLater(() -> Optional.ofNullable(onDiscard)
                        .ifPresent(c -> c.accept(null)));
                doLoadSubmissionData();
            } catch (Throwable t) {
                log.error("error while discarding form", t);
                showErrorAlert(t.getLocalizedMessage());
            }
        }));
    }

    protected SimpleComboBoxControl<Option> createOptionComboBox(TranslationService ts) {
        return new SimpleComboBoxControl<>() {
            @SuppressWarnings("unchecked")
            @Override
            public void initializeParts() {
                super.initializeParts();
                comboBox.setConverter(new OptionConverter(ts, v -> Optional.ofNullable((Collection<Option>) field.getItems())
                        .stream()
                        .flatMap(Collection::stream)
                        .filter(o -> o.value().equals(v))
                        .findFirst()
                        .orElse(null)));
            }
        };
    }

    @SuppressWarnings("unchecked")
    protected MultiComboBoxControl<Option> createMultiOptionComboBox(TranslationService ts) {
        return new MultiComboBoxControl<>(field -> new OptionConverter(ts, v -> Optional.ofNullable((Collection<Option>) field.getItems())
                .stream()
                .flatMap(Collection::stream)
                .filter(o -> o.value().equals(v))
                .findFirst()
                .orElse(null)));
    }

    private void doLoadSubmissionData() throws Exception {
        Optional.ofNullable(loadSubmissionData())
                .ifPresent(data -> Platform.runLater(() -> {
                    submissionData.clear();
                    submissionData.putAll(data);
                }));
    }

    protected SimpleTextControl bindAutoCompletionWrapper(String targetField, FormType formType) {
        return bindAutoCompletionWrapper(targetField, formType, String::valueOf);
    }

    protected <T> SimpleTextControl bindAutoCompletionWrapper(String targetField, FormType formType, Function<String, T> deserializer) {
        return new SimpleTextControl() {
            private final ObservableList<T> suggestions = FXCollections.observableArrayList();

            @Override
            public void initializeParts() {
                super.initializeParts();
                final var binding = TextFields.bindAutoCompletion(editableField, param -> suggestions);
                binding.setDelay(250);
            }

            @Override
            public void setupValueChangedListeners() {
                super.setupValueChangedListeners();
                editableField.textProperty().addListener((ob, ov, nv) -> {
                    if (StringUtils.isBlank(nv)) {
                        suggestions.clear();
                        return;
                    }
                    populateAutoCompletionOptions(formType, targetField, nv.trim(), deserializer,
                            suggestions);
                });
            }
        };
    }

    private <T> void populateAutoCompletionOptions(FormType formType, String field, String query, Function<String, T> deserializer,
                                                   ObservableList<T> destination) {
        getExecutorService().submit(() -> {
            try {
                final var result = getFormService().findAutoCompletionValuesFor(field, formType, query, 5,
                        deserializer);
                Platform.runLater(() -> destination.setAll(result));
            } catch (Throwable t) {
                log.error("error while loading auto-completion options", t);
            }
        });
    }

    public void onClose() {
    }
}
