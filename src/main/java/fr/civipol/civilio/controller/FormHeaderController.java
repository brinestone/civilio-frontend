package fr.civipol.civilio.controller;

import fr.civipol.civilio.event.SubmissionRef;
import fr.civipol.civilio.services.FormDataService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;
import org.controlsfx.validation.ValidationSupport;
import org.controlsfx.validation.Validator;

import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FormHeaderController implements AppController {
    private final FormDataService formService;
    private final ExecutorService executorService;
    private final ReadOnlyBooleanWrapper valid = new ReadOnlyBooleanWrapper(true);
    private final StringProperty submissionId = new SimpleStringProperty(this, "submissionId");
    private final StringProperty index = new SimpleStringProperty(this, "index");
    private final StringProperty validationCode = new SimpleStringProperty(this, "validationCode");
    private final ObjectProperty<SubmissionRef> submissionRef = new SimpleObjectProperty<>();
    @FXML
    private Button btnNext;
    @FXML
    private Button btnPrev;
    @FXML
    private Label lblSubmissionDate;
    @FXML
    private TextField tfIndex;
    @FXML
    private TextField tfIndexSearch;
    @FXML
    private TextField tfValidationCode;
    private boolean submissionIdUpdatedExternally;

    public StringProperty submissionIdProperty() {
        return submissionId;
    }

    public StringProperty validationCodeProperty() {
        return validationCode;
    }

    public StringProperty indexProperty() {
        return index;
    }

    public void setSubmissionId(String id) {
        submissionIdUpdatedExternally = true;
        submissionId.setValue(id);
        submissionIdUpdatedExternally = false;
    }

    @FXML
    private void initialize() {
        final var rb = ResourceBundle.getBundle("messages");
        lblSubmissionDate.textProperty().bind(Bindings.createStringBinding(() -> Optional.ofNullable(submissionRef.getValue())
                .map(SubmissionRef::submissionDate)
                .map(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)::format)
                .orElse(rb.getString("forms.header.date.new")), submissionId, submissionRef));

        tfIndex.textProperty().bindBidirectional(index);
        tfValidationCode.textProperty().bindBidirectional(validationCode);
        btnNext.setOnAction(ignored -> {
            Optional.ofNullable(submissionRef.getValue())
                    .map(SubmissionRef::next)
                    .ifPresent(submissionId::setValue);
        });
        btnPrev.setOnAction(ignored -> {
            Optional.ofNullable(submissionRef.getValue())
                    .map(SubmissionRef::prev)
                    .ifPresent(submissionId::setValue);
        });
        final var suggestions = FXCollections.<SubmissionRef>observableArrayList();
        final var binding = TextFields.bindAutoCompletion(tfIndexSearch, ignored -> suggestions);
        binding.setDelay(500);

        tfIndexSearch.textProperty().addListener((ob, ov, nv) -> {
            if (submissionIdUpdatedExternally) return;
            if (StringUtils.isBlank(nv)) {
                suggestions.clear();
                return;
            }

            executorService.submit(() -> {
                try {
                    final var submissionRefs = formService.findSubmissionRefsByIndex(nv);
                    Platform.runLater(() -> suggestions.setAll(submissionRefs));
                } catch (Throwable e) {
                    log.error("error while searching for submission refs", e);
                    suggestions.clear();
                }
            });
        });

        binding.setOnAutoCompleted(e -> submissionRef.setValue(e.getCompletion()));
        btnPrev.disableProperty().bind(Bindings.createBooleanBinding(() -> Optional.ofNullable(submissionRef.getValue())
                .map(SubmissionRef::prev)
                .map(StringUtils::isBlank)
                .orElse(true), submissionRef));
        btnNext.disableProperty().bind(Bindings.createBooleanBinding(() -> Optional.ofNullable(submissionRef.getValue())
                .map(SubmissionRef::next)
                .map(StringUtils::isBlank)
                .orElse(true), submissionRef));
        submissionId.addListener((ob, ov, nv) -> {
            if (StringUtils.isBlank(nv)) return;
            executorService.submit(() -> {
                try {
                    formService.findSubmissionRefById(nv)
                            .ifPresentOrElse(v -> Platform.runLater(() -> {
                                submissionRef.setValue(v);
                                submissionIdUpdatedExternally = true;
                                tfIndexSearch.setText(v.index());
                                submissionIdUpdatedExternally = false;
                            }), () -> {
                                submissionRef.setValue(null);
                                submissionIdUpdatedExternally = true;
                                tfIndexSearch.setText(null);
                                submissionIdUpdatedExternally = false;
                            });
                } catch (Throwable t) {
                    log.error("error while finding submission ref", t);
                }
            });
        });
        final var vs = new ValidationSupport();
        vs.registerValidator(tfIndex, true, Validator.createEmptyValidator(rb.getString("settings.msg.value_required")));
        valid.bind(vs.invalidProperty());
    }

    public ReadOnlyBooleanProperty validProperty() {
        return valid.getReadOnlyProperty();
    }
}
