package fr.civipol.civilio.controller;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.form.FormDataManager;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.services.FormService;
import javafx.application.Platform;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableMap;
import javafx.event.ActionEvent;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;
import java.util.stream.Stream;

/**
 * Represents a base form capable of submitting data and loading existing submission data.
 */
@Slf4j
public abstract class FormController implements AppController {
    private final BooleanProperty submitting = new SimpleBooleanProperty(this, "submitting", false);
    @Setter
    protected Consumer<String> onSubmit;
    @Setter
    protected Consumer<Void> onDiscard;
    protected final StringProperty submissionId = new SimpleStringProperty(this, "submissionId");
    protected final ObservableMap<String, Object> submissionData = FXCollections.observableHashMap();

    protected void setSubmitting(boolean v) {
        submitting.set(v);
    }

    public BooleanProperty submittingProperty() {
        return submitting;
    }

    protected abstract FormDataManager getModel();

    public void setSubmissionId(String submissionId) {
        this.submissionId.set(submissionId);
    }

    protected abstract FormHeaderController getHeaderManagerController();

    protected FormController() {
        submissionId.addListener((ob, ov, nv) -> {
            if (StringUtils.isBlank(nv)) return;
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
        getHeaderManagerController().submissionIdProperty().bindBidirectional(submissionId);
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
                OptionSource optionSource = (form, group, parent, callback) -> {
                    try {
                        log.debug("loading options for group: " + group);
                        final var result = getFormService().findOptionsFor(group, parent, form);
                        callback.accept(result);
                    } catch (Throwable t) {
                        log.error("error while loading options list", t);
                        showErrorAlert(t.getLocalizedMessage());
                    }
                };
                Runnable callback = () -> Optional.ofNullable(submissionId.get())
                        .filter(StringUtils::isNotBlank)
                        .ifPresent(__ -> {
                            try {
                                Optional.ofNullable(loadSubmissionData())
                                        .ifPresent(data -> Platform.runLater(() -> {
                                            submissionData.clear();
                                            submissionData.putAll(data);
                                        }));
                                Platform.runLater(() -> {
                                    getModel().loadValues();
                                    getModel().markAsPristine();
                                });
                            } catch (Throwable e) {
                                showErrorAlert(e.getLocalizedMessage());
                            }
                        });
                getModel().loadOptions(optionSource, callback);

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

    protected void findOptionsFor(String form, String group, String parent, Consumer<Collection<Option>> callback) {
        getExecutorService().submit(() -> {
            try {
                log.debug("loading options for group: " + group);
                final var result = getFormService().findOptionsFor(group, parent, form);
                callback.accept(result);
            } catch (Throwable t) {
                log.error("error while loading options list", t);
                showErrorAlert(t.getLocalizedMessage());
            }
        });
    }

    protected void handleSubmitEvent(ActionEvent ignored) {
        setSubmitting(true);
        getExecutorService().submit(() -> {
            try {
                doSubmit();
                Platform.runLater(() -> Optional.ofNullable(onSubmit)
                        .ifPresent(c -> c.accept(submissionId.get())));
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
            } catch (Throwable t) {
                log.error("error while discarding form", t);
                showErrorAlert(t.getLocalizedMessage());
            }
        }));
    }
}
