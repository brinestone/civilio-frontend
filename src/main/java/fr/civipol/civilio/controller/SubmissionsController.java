package fr.civipol.civilio.controller;

import fr.civipol.civilio.domain.viewmodel.FormSubmissionViewModel;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.services.FormService;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Inject;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.scene.image.Image;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.StackPane;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.Window;
import javafx.util.Duration;
import javafx.util.StringConverter;
import javafx.util.converter.DefaultStringConverter;
import javafx.util.converter.LocalDateStringConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.FormatStyle;
import java.util.Objects;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__(@Inject))
public class SubmissionsController implements AppController, Initializable {
    private static final int PAGE_SIZE = 100;
    private final ViewLoader vl;
    private final FormService formService;
    private final ExecutorService executorService;

    @FXML
    private TextField tfFilter;
    @FXML
    private StackPane spTableContainer;
    @FXML
    private ComboBox<FormType> cbFormType;
    @FXML
    private Label lblTitle;
    @FXML
    private Button btnOpenSubmissionForm;
    @FXML
    private Pagination pgPagination;
    @FXML
    private TableColumn<FormSubmissionViewModel, LocalDate> tcRecordedOn;
    @FXML
    private TableColumn<FormSubmissionViewModel, Integer> tcIndex;
    @FXML
    private TableColumn<FormSubmissionViewModel, Boolean> tcValidated;
    @FXML
    private TableColumn<FormSubmissionViewModel, String> tcValidationCode, tcFacilityName;
    @FXML
    private TableView<FormSubmissionViewModel> tvSubmissions;
    private final BooleanProperty loadingSubmissions = new SimpleBooleanProperty(this, "loadingSubmissions", false);
    private ResourceBundle resourceRef;

    @FXML
    private void onAddSubmissionButtonClicked(ActionEvent event) {
        showFormDialog(((Node) event.getSource()).getScene().getWindow(), null);
    }

    private StackPane spLoadingSpinnerContainer;

    private void showFormDialog(Window parent, Integer submissionId) {
        try {
            final var dialog = new Stage();
            dialog.initModality(Modality.APPLICATION_MODAL);
            dialog.initOwner(parent);
            dialog.getIcons().add(new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/Logo32x32.png"))));

            final var viewName = "forms/" + cbFormType.getValue().toString().toLowerCase();
            final var view = vl.loadView(viewName);
            final var controller = (FormController) vl.getControllerFor(viewName).orElseThrow();
            if (submissionId == null)
                controller.updateFormValues();
            controller.setOnSubmit(__ -> doLoadSubmissionData());
            controller.setSubmissionIndex(submissionId);

            dialog.setTitle("Forms::" + cbFormType.getValue().toString().toUpperCase() + " - " + System.getProperty("app.name"));
            dialog.setScene(new Scene((Parent) view));
            dialog.getScene().getStylesheets().add(Objects.requireNonNull(getClass().getResource("/styles/root.css")).toExternalForm());
            dialog.setOnCloseRequest(__ -> controller.onClose());
            dialog.showAndWait();
        } catch (IOException | NullPointerException ex) {
            log.error("failed to load " + cbFormType.getValue().toString().toUpperCase() + " form view", ex);
        }
    }

    public void initialize(URL location, ResourceBundle resources) {
        resourceRef = resources;
        initTableView();
        initFormTypeComboBox();
        initColumns();
        initBindings();
        initLoadingSpinner();
        setupEventListeners();
        setupChangeListeners();
        doLoadSubmissionData();
    }

    private void initTableView() {
        tvSubmissions.setRowFactory(tv -> {
            final var row = new TableRow<FormSubmissionViewModel>();
            row.setOnMouseClicked(event -> {
                if (event.getButton().equals(MouseButton.PRIMARY) && event.getClickCount() == 2 && !row.isEmpty()) {
                    final var submissionId = row.getTableView().getFocusModel().getFocusedItem().getSubmission().getIndex();
                    showFormDialog(row.getScene().getWindow(), submissionId);
                }
            });
            return row;
        });
    }

    private void setupEventListeners() {
        cbFormType.valueProperty().addListener((ob, ov, nv) -> doLoadSubmissionData());
    }

    private void initLoadingSpinner() {
        spLoadingSpinnerContainer = new StackPane();
        final var spinner = new ProgressIndicator(ProgressIndicator.INDETERMINATE_PROGRESS);
        spLoadingSpinnerContainer.getChildren().setAll(spinner);
        spLoadingSpinnerContainer.setStyle("""
                -fx-background-color: black;
                -fx-opacity: .5;
                                """);
    }

    @FXML
    private void onRefreshButtonClicked(ActionEvent ignored) {
        doLoadSubmissionData();
    }

    private void doLoadSubmissionData() {
        loadingSubmissions.set(true);
        executorService.submit(() -> {
            try {
                final var result = formService.findFormSubmissions(cbFormType.getValue(), pgPagination.getCurrentPageIndex(), PAGE_SIZE, tfFilter.textProperty().getValueSafe());
                Platform.runLater(() -> {
                    try {
                        final var submissions = result.getData().stream()
                                .map(FormSubmissionViewModel::new)
                                .toList();
                        pgPagination.setPageCount(Double.valueOf(Math.ceil((double) result.getTotalRecords() / PAGE_SIZE)).intValue());
                        tvSubmissions.getItems().setAll(submissions);
                    } catch (Throwable t) {
                        log.error("error while loading submissions data", t);
                    }
                });
            } catch (Throwable t) {
                log.error("error while loading submissions data", t);
                showErrorAlert(t.getLocalizedMessage());
            } finally {
                Platform.runLater(() -> loadingSubmissions.set(false));
            }
        });
    }

    private void setupChangeListeners() {
        pgPagination.currentPageIndexProperty().addListener((ob, ov, nv) -> doLoadSubmissionData());
        loadingSubmissions.addListener((ob, ov, nv) -> {
            if (!nv)
                spTableContainer.getChildren().remove(1);
            else {
                tvSubmissions.getItems().clear();
                spTableContainer.getChildren().add(1, spLoadingSpinnerContainer);
            }
        });
        cbFormType.valueProperty().addListener((ob, ov, nv) -> {
            tfFilter.clear();
            pgPagination.setCurrentPageIndex(0);
        });

        final var timeline = new Timeline(new KeyFrame(Duration.millis(500), ignored -> {
            doLoadSubmissionData();
        }));
        timeline.setCycleCount(1);
        tfFilter.textProperty().addListener((ob, ov, nv) -> {
            timeline.stop();
            timeline.play();
        });
    }

    private void initFormTypeComboBox() {
        cbFormType.setConverter(new StringConverter<>() {
            @Override
            public String toString(FormType object) {
                return Optional.ofNullable(object)
                        .map(FormType::toString)
                        .map(String::toUpperCase)
                        .orElse(null);
            }

            @Override
            public FormType fromString(String string) {
                return Optional.ofNullable(string)
                        .map(FormType::fromString)
                        .orElse(null);
            }
        });
        cbFormType.setItems(FXCollections.observableArrayList(FormType.values()));
        cbFormType.getSelectionModel().selectFirst();
    }

    private void initBindings() {
        btnOpenSubmissionForm.disableProperty().bind(cbFormType.valueProperty().isNull());
        lblTitle.textProperty().bind(Bindings.createStringBinding(() -> String.format("%s - %s", resourceRef.getString("fosa.submissions.title"), cbFormType.getValue().toString().toUpperCase()), cbFormType.valueProperty()));
        pgPagination.visibleProperty().bind(pgPagination.pageCountProperty().greaterThan(1));
        pgPagination.disableProperty().bind(pgPagination.pageCountProperty().lessThanOrEqualTo(0));
        tfFilter.disableProperty().bind(loadingSubmissions.and(tfFilter.textProperty().isNotEmpty()));
    }

    private void initColumns() {
        final var defaultStringConverter = new DefaultStringConverter();
        final var localDateStringConverter = new LocalDateStringConverter(FormatStyle.MEDIUM);

        tcIndex.setCellValueFactory(param -> param.getValue().indexProperty().asObject());
        tcIndex.setEditable(false);

        tcFacilityName.setCellValueFactory(param -> param.getValue().facilityNameProperty());
        tcFacilityName.setCellFactory(param -> new TextFieldTableCell<>(defaultStringConverter));

        tcValidationCode.setCellValueFactory(param -> param.getValue().validationCodeProperty());
        tcValidationCode.setCellFactory(param -> new TextFieldTableCell<>(defaultStringConverter));

        tcValidated.setCellFactory(param -> new CheckBoxTableCell<>(index -> tvSubmissions.getItems().get(index).validatedProperty()));
        tcValidated.setCellValueFactory(param -> param.getValue().validatedProperty());

        tcRecordedOn.setCellValueFactory(param -> param.getValue().submittedOnProperty());
        tcRecordedOn.setCellFactory(param -> new TableCell<>() {
            @Override
            protected void updateItem(LocalDate item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText(localDateStringConverter.toString(item));
                }
            }
        });
    }

}
