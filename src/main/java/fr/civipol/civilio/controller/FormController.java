package fr.civipol.civilio.controller;

import javafx.application.Platform;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableMap;
import javafx.event.ActionEvent;
import javafx.scene.Node;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;

/**
 * Represents a base form capable of submitting data and loading existing submission data.
 */
@Slf4j
public abstract class FormController {
    @Setter
    protected Consumer<String> onSubmit;
    @Setter
    protected Consumer<Void> onDiscard;
    protected final StringProperty submissionId = new SimpleStringProperty(this, "submissionId");
    protected final ObservableMap<String, Object> submissionData = FXCollections.observableHashMap();

    public void setSubmissionId(String submissionId) {
        this.submissionId.set(submissionId);
    }

    protected FormController() {
        submissionId.addListener((ob, ov, nv) -> {
            if (nv == null) return;
            getExecutorService().submit(() -> {
                try {
                    Optional.ofNullable(loadSubmissionData())
                            .ifPresent(submissionData::putAll);
                } catch (Throwable t) {
                    log.error("error while loading submission data", t);
                    Platform.runLater(() -> {
                        final var alert = new Alert(Alert.AlertType.ERROR, null, ButtonType.OK);
                        alert.setHeaderText(t.getLocalizedMessage());
                        alert.showAndWait();
                    });
                }
            });
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
    protected abstract void doSubmit();

    protected abstract Map<String, Object> loadSubmissionData() throws Exception;

    protected abstract ExecutorService getExecutorService();

    protected void handleSubmitEvent(ActionEvent event) {
        getExecutorService().submit(() -> {
            try {
                doSubmit();
                Platform.runLater(() -> Optional.ofNullable(onSubmit)
                        .ifPresent(c -> c.accept(submissionId.get())));
            } catch (Throwable t) {
                log.error("error while submitting form", t);
                Platform.runLater(() -> {
                    final var alert = new Alert(Alert.AlertType.ERROR, null, ButtonType.OK);
                    alert.setHeaderText(t.getLocalizedMessage());
                    alert.initOwner(((Node) event.getSource()).getScene().getWindow());
                    alert.showAndWait();
                });
            }
        });
    }

    protected void handleDiscardEvent(ActionEvent ev) {
        getExecutorService().submit(() -> {
            try {
                doDiscard();
                Platform.runLater(() -> Optional.ofNullable(onDiscard)
                        .ifPresent(c -> c.accept(null)));
            } catch (Throwable t) {
                log.error("error while discarding form", t);
                Platform.runLater(() -> {
                    final var alert = new Alert(Alert.AlertType.ERROR, null, ButtonType.OK);
                    alert.setHeaderText(t.getLocalizedMessage());
                    alert.initOwner(((Node) ev.getSource()).getScene().getWindow());
                    alert.showAndWait();
                });
            }
        });
    }
}
