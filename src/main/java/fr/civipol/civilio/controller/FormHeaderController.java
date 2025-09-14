package fr.civipol.civilio.controller;

import dagger.Lazy;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.event.SubmissionRef;
import fr.civipol.civilio.form.FieldMapper;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.textfield.TextFields;
import org.controlsfx.validation.Severity;
import org.controlsfx.validation.ValidationSupport;
import org.controlsfx.validation.Validator;

import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({ @Inject }))
public class FormHeaderController implements AppController {
    private final FormService formService;
    private final ExecutorService executorService;
    private final ResourceBundle resourceRef;
    private final Lazy<FieldMapper> fieldMapperProvider;
    private final BooleanProperty canGoNext = new SimpleBooleanProperty(this, "canGoNext", true);
    private final BooleanProperty canGoPrev = new SimpleBooleanProperty(this, "canGoNext", true);
    private final IntegerProperty submissionIndex = new SimpleIntegerProperty(this, "submissionIndex");
    private final StringProperty index = new SimpleStringProperty(this, "index");
    private final StringProperty validationCode = new SimpleStringProperty(this, "validationCode");
    private final ObjectProperty<SubmissionRef> submissionRef = new SimpleObjectProperty<>();
    private final ObjectProperty<FormType> formType = new SimpleObjectProperty<>(this, "formType");
    private final StringProperty indexFieldName = new SimpleStringProperty(this, "indexFieldName");
    private final BooleanProperty loading = new SimpleBooleanProperty(this, "loading");
    @FXML
    private Button btnNext;
    @FXML
    private Button btnPrev;
    @FXML
    private Label lblSubmissionDate;
    @FXML
    private TextField tfIndexSearch;
    @FXML
    private TextField tfValidationCode;
    private boolean submissionIdUpdatedExternally;

    public IntegerProperty submissionIndexProperty() {
        return submissionIndex;
    }

    public StringProperty validationCodeProperty() {
        return validationCode;
    }

    public StringProperty indexProperty() {
        return index;
    }

    @FXML
    private void initialize() {
        final var rb = resourceRef;
        final var lblSubmissionDateBinding = Bindings.when(loading)
                .then(rb.getString("loading.txt"))
                .otherwise(Bindings.createStringBinding(() -> Optional.ofNullable(submissionRef.getValue())
                        .map(SubmissionRef::submissionDate)
                        .map(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)::format)
                        .orElse(rb.getString("forms.header.date.new")), submissionIndex, submissionRef));
        lblSubmissionDate.textProperty().bind(lblSubmissionDateBinding);
        tfValidationCode.textProperty().bindBidirectional(validationCode);
        final var vs = new ValidationSupport();
        vs.registerValidator(tfValidationCode, false, Validator.combine(
                Validator.createEmptyValidator(rb.getString("forms.msg.invalid_value")),
                Validator.<String>createPredicateValidator(
                        v -> formService.isValidationCodeValid(v, formType.getValue()),
                        rb.getString("forms.msg.invalid_value"), Severity.WARNING)));
        btnNext.setOnAction(ignored -> Optional.ofNullable(submissionRef.getValue())
                .map(SubmissionRef::next)
                .ifPresent(submissionIndex::setValue));
        btnPrev.setOnAction(ignored -> Optional.ofNullable(submissionRef.getValue())
                .map(SubmissionRef::prev)
                .ifPresent(submissionIndex::setValue));
        final var suggestions = FXCollections.<SubmissionRef>observableArrayList();
        final var binding = TextFields.bindAutoCompletion(tfIndexSearch, ignored -> suggestions);
        binding.setDelay(500);

        tfIndexSearch.textProperty().addListener((ob, ov, nv) -> {
            if (submissionIdUpdatedExternally)
                return;
            if (StringUtils.isBlank(nv)) {
                suggestions.clear();
                return;
            }

            executorService.submit(() -> {
                try {
                    final var submissionRefs = formService.searchSubmissionRefsByIndex(nv.trim(), formType.getValue());
                    Platform.runLater(() -> suggestions.setAll(submissionRefs));
                } catch (Throwable e) {
                    log.error("error while searching for submission refs", e);
                    suggestions.clear();
                }
            });
        });

        binding.setOnAutoCompleted(e -> {
            submissionRef.setValue(e.getCompletion());
            submissionIdUpdatedExternally = true;
            tfIndexSearch.setText(String.valueOf(e.getCompletion().index()));
            submissionIdUpdatedExternally = false;
        });
        btnPrev.disableProperty().bind(Bindings.or(
                Bindings.createBooleanBinding(() -> Optional.ofNullable(submissionRef.getValue())
                        .map(SubmissionRef::prev)
                        .filter(v -> v <= 0)
                        .isPresent(), submissionRef).or(canGoPrev.not()),
                loading));
        btnNext.disableProperty().bind(Bindings.or(
                Bindings.createBooleanBinding(() -> Optional.ofNullable(submissionRef.getValue())
                        .map(SubmissionRef::next)
                        .filter(v -> v <= 0)
                        .isPresent(), submissionRef).or(canGoNext.not()),
                loading));
        submissionIndex.addListener((ob, ov, nv) -> {
            if (nv == null)
                return;
            executorService.submit(() -> {
                try {
                    formService.findSubmissionRefByIndex(nv.intValue(), formType.getValue())
                            .ifPresentOrElse(v -> Platform.runLater(() -> {
                                submissionRef.setValue(v);
                                submissionIdUpdatedExternally = true;
                                tfIndexSearch.setText(String.valueOf(v.index()));
                                submissionIdUpdatedExternally = false;
                            }), () -> Platform.runLater(() -> {
                                submissionRef.setValue(null);
                                submissionIdUpdatedExternally = true;
                                tfIndexSearch.setText(null);
                                submissionIdUpdatedExternally = false;
                            }));
                } catch (Throwable t) {
                    log.error("error while finding submission ref", t);
                }
            });
        });
    }

    @FXML
    void onSettingsButtonClicked(ActionEvent ignored) {
        final var mapper = fieldMapperProvider.get();
        mapper.makePrefsForm().show(true);
    }

    public BooleanProperty canGoNextProperty() {
        return canGoNext;
    }

    public BooleanProperty canGoPrevProperty() {
        return canGoPrev;
    }

    public ObjectProperty<FormType> formTypeProperty() {
        return formType;
    }

    public StringProperty indexFieldNameProperty() {
        return indexFieldName;
    }

    public BooleanProperty loadingProperty() {
        return loading;
    }
}
