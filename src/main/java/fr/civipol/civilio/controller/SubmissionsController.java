package fr.civipol.civilio.controller;

import fr.civipol.civilio.controls.SubmissionsFilter;
import fr.civipol.civilio.domain.viewmodel.FormSubmissionViewModel;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.services.FormService;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableSet;
import javafx.collections.SetChangeListener;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.scene.image.Image;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.Window;
import javafx.util.StringConverter;
import javafx.util.converter.DefaultStringConverter;
import lombok.extern.slf4j.Slf4j;
import org.kordamp.ikonli.javafx.FontIcon;

import java.io.IOException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@Slf4j
public class SubmissionsController implements AppController, Initializable {
    private static final int PAGE_SIZE = 50;
    private final ViewLoader vl;
    private final FormService formService;
    private final ExecutorService executorService;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    public SubmissionsController(
            ViewLoader vl,
            FormService formService,
            ExecutorService executorService
    ) {
        this.vl = vl;
        this.formService = formService;
        this.executorService = executorService;
    }

    @FXML
    private BorderPane bpRoot;
    @FXML
    private CheckBox cbSelectAll;
    @FXML
    private StackPane spTableContainer;
    @FXML
    private ComboBox<FormType> cbFormType;
    @FXML
    private Label lblTitle;
    @FXML
    private Button btnOpenFilters;
    @FXML
    private Button btnOpenSubmissionForm;
    @FXML
    private HBox hbActionBar;
    @FXML
    private Pagination pgPagination;
    @FXML
    private TableColumn<FormSubmissionViewModel, String> tcRecordedAt;
    @FXML
    private TableColumn<FormSubmissionViewModel, Date> tcRecordedOn;
    @FXML
    private TableColumn<FormSubmissionViewModel, String> tcRecordedBy;
    @FXML
    private TableColumn<FormSubmissionViewModel, Boolean> tcSelection;
    @FXML
    private TableColumn<FormSubmissionViewModel, Boolean> tcValidated;
    @FXML
    private TableColumn<FormSubmissionViewModel, String> tcValidationCode;
    @FXML
    private TableView<FormSubmissionViewModel> tvSubmissions;
    private final HBox hbSelectionActionBar = new HBox();
    private final ObservableSet<FormSubmissionViewModel> selectedItems = FXCollections.observableSet();
    private SubmissionsFilter filters;
    private Dialog<ButtonType> filterDialog;
    private ResourceBundle resourceRef;

    @FXML
    private void onAddSubmissionButtonClicked(ActionEvent event) {
        showFormDialog(((Node) event.getSource()).getScene().getWindow(), null);
    }

    private StackPane spLoadingSpinnerContainer;

    private void showFormDialog(Window parent, String submissionId) {
        try {
            final var dialog = new Stage();
            dialog.initModality(Modality.APPLICATION_MODAL);
            dialog.initOwner(parent);
            dialog.getIcons().add(new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/Logo32x32.png"))));

            final var viewName = "forms/" + cbFormType.getValue().toString().toLowerCase();
            final var view = vl.loadView(viewName);
            final var controller = (FormController) vl.getControllerFor(viewName).orElseThrow();
            controller.setSubmissionId(submissionId);
            controller.setOnSubmit(this::onFormSubmitted);

            dialog.setTitle("Forms::" + cbFormType.getValue().toString().toUpperCase() + " - " + System.getProperty("app.name"));
            dialog.setScene(new Scene((Parent) view));
            dialog.getScene().getStylesheets().add(Objects.requireNonNull(getClass().getResource("/styles/root.css")).toExternalForm());
            dialog.showAndWait();
        } catch (IOException | NullPointerException ex) {
            log.error("failed to load " + cbFormType.getValue().toString().toUpperCase() + " form view", ex);
        }
    }

    private void onFormSubmitted(String formSubmission) {
        doLoadSubmissionData();
    }

    public void initialize(URL location, ResourceBundle resources) {
        resourceRef = resources;
        filters = new SubmissionsFilter(resources);
        initFilterDialog();
        initFormTypeComboBox();
        initColumns();
        initBindings();
        initLoadingSpinner();
        initSelectionActionBar();
        setupEventListeners();
        setupChangeListeners();
        doLoadSubmissionData();
    }

    private void initFilterDialog() {
        filterDialog = new Dialog<>();
        filterDialog.getDialogPane().getScene().getStylesheets().add(Objects.requireNonNull(getClass().getResource("/styles/root.css")).toExternalForm());
        filterDialog.getDialogPane().setContent(filters.getView());
        filterDialog.getDialogPane().getButtonTypes().setAll(
                new ButtonType(resourceRef.getString("Dialog.filters.clear"), ButtonBar.ButtonData.CANCEL_CLOSE),
                ButtonType.OK
        );
        filterDialog.setTitle(resourceRef.getString("filters.title"));
    }

    private void initSelectionActionBar() {
        final var openFormButton = new Button();
        openFormButton.setContentDisplay(ContentDisplay.GRAPHIC_ONLY);
        openFormButton.setGraphic(new FontIcon("fth-eye"));
        openFormButton.disableProperty().bind(Bindings.size(selectedItems).isNotEqualTo(1));
        openFormButton.setOnAction(this::onOpenFormButtonClicked);

        final var deleteButton = new Button();
        deleteButton.setContentDisplay(ContentDisplay.GRAPHIC_ONLY);
        deleteButton.setGraphic(new FontIcon("fth-trash-2"));
        deleteButton.disableProperty().bind(Bindings.isEmpty(selectedItems));
        deleteButton.setOnAction(this::onDeleteButtonClicked);

        hbSelectionActionBar.getChildren().add(openFormButton);
    }

    private void onDeleteButtonClicked(ActionEvent event) {
        final var alert = new Alert(Alert.AlertType.CONFIRMATION, resourceRef.getString("fosa.submissions.msg.delete_confirmation"), ButtonType.YES, ButtonType.CANCEL);
        alert.initOwner(((Node) event.getSource()).getScene().getWindow());
        alert.showAndWait()
                .map(ButtonType::getButtonData)
                .filter(bt -> !bt.isCancelButton())
                .ifPresent(__ -> deleteSelectedSubmissions());
    }

    private void deleteSelectedSubmissions() {
        spTableContainer.getChildren().add(1, spLoadingSpinnerContainer);
        executorService.submit(() -> {
            try {
                final var ids = selectedItems.stream()
                        .map(FormSubmissionViewModel::getSubmission)
                        .map(FormSubmission::getId)
                        .toArray(String[]::new);
                formService.deleteSubmissions(ids);
                Platform.runLater(() -> {
                    try {
                        if (cbSelectAll.isSelected()) {
                            // Move to the previous page, if all items in the list were selected.
                            pgPagination.setCurrentPageIndex(Math.max(0, pgPagination.getCurrentPageIndex() - 1));
                        } else {
                            doLoadSubmissionData();
                        }
                    } catch (Throwable t) {
                        log.error("error while loading submissions data", t);
                    }
                });
            } catch (Throwable t) {
                log.error("error while loading submissions data", t);
                Platform.runLater(() -> {
                    final var alert = new Alert(Alert.AlertType.ERROR, t.getLocalizedMessage(), ButtonType.OK);
                    alert.initOwner(spTableContainer.getScene().getWindow());
                    alert.showAndWait();
                });
            } finally {
                Platform.runLater(() -> spTableContainer.getChildren().remove(1));
            }
        });
    }

    private void onOpenFormButtonClicked(ActionEvent event) {
        showFormDialog(((Node) event.getSource()).getScene().getWindow(), selectedItems.stream()
                .findFirst()
                .map(FormSubmissionViewModel::getSubmission)
                .map(FormSubmission::getId)
                .orElse(null)
        );
    }

    private void setupEventListeners() {
        btnOpenFilters.setOnAction(this::onOpenFiltersButtonClicked);
        cbSelectAll.setOnAction(e -> tvSubmissions.getItems().forEach(vm -> vm.setSelected(cbSelectAll.isSelected())));
        tcRecordedAt.setOnEditCommit(e -> e.getRowValue().setSubmittedAt(e.getNewValue()));
        tcValidationCode.setOnEditCommit(param -> param.getRowValue().setValidationCode(param.getNewValue()));
        tcRecordedBy.setOnEditCommit(e -> e.getRowValue().setSubmittedBy(e.getNewValue()));
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

    private void doLoadSubmissionData() {
        spTableContainer.getChildren().add(1, spLoadingSpinnerContainer);
        executorService.submit(() -> {
            try {
                final var result = formService.findFormSubmissions(pgPagination.getCurrentPageIndex(), PAGE_SIZE, filters.getFilterManager());
                Platform.runLater(() -> {
                    try {
                        final var submissions = result.getData().stream()
                                .map(FormSubmissionViewModel::new)
                                .peek(vm -> vm.setSelected(selectedItems.contains(vm)))
                                .peek(vm -> vm.selectedProperty().addListener((ob, ov, nv) -> {
                                    if (nv) selectedItems.add(vm);
                                    else selectedItems.remove(vm);
                                    onSelectionChanged();
                                }))
                                .toList();
                        pgPagination.setPageCount(Double.valueOf(Math.ceil((double) result.getTotalRecords().intValue() / PAGE_SIZE)).intValue());
                        tvSubmissions.getItems().setAll(submissions);
                    } catch (Throwable t) {
                        log.error("error while loading submissions data", t);
                    }
                });
            } catch (Throwable t) {
                log.error("error while loading submissions data", t);
                Platform.runLater(() -> {
                    final var alert = new Alert(Alert.AlertType.ERROR, t.getLocalizedMessage(), ButtonType.OK);
                    alert.initOwner(spTableContainer.getScene().getWindow());
                    alert.showAndWait();
                });
            } finally {
                Platform.runLater(() -> spTableContainer.getChildren().remove(1));
            }
        });
    }

    private void onSelectionChanged() {
        if (selectedItems.size() == 0)
            cbSelectAll.setSelected(false);
        else if (selectedItems.size() < tvSubmissions.getItems().size())
            cbSelectAll.setIndeterminate(true);
        else if (selectedItems.size() == tvSubmissions.getItems().size())
            cbSelectAll.setSelected(true);
    }

    private void setupChangeListeners() {
        tvSubmissions.getItems().addListener((ListChangeListener<FormSubmissionViewModel>) c -> {
            if (c.wasRemoved()) {
                c.getRemoved().forEach(selectedItems::remove);
            }
        });
        selectedItems.addListener((SetChangeListener<FormSubmissionViewModel>) ignored -> {
            if (selectedItems.size() == 0)
                bpRoot.setBottom(hbActionBar);
            else bpRoot.setBottom(hbSelectionActionBar);
        });
        pgPagination.currentPageIndexProperty().addListener((ob, ov, nv) -> doLoadSubmissionData());
        cbFormType.valueProperty().addListener((ob, ov, nv) -> {
            filters.reset();
            pgPagination.setCurrentPageIndex(0);
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
        final var tableEmptyBinding = Bindings.isEmpty(tvSubmissions.getItems());
        cbSelectAll.disableProperty().bind(tableEmptyBinding);
        btnOpenSubmissionForm.disableProperty().bind(cbFormType.valueProperty().isNull());
        lblTitle.textProperty().bind(Bindings.createStringBinding(() -> String.format("%s - %s", resourceRef.getString("fosa.submissions.title"), cbFormType.getValue().toString().toUpperCase()), cbFormType.valueProperty()));
        pgPagination.visibleProperty().bind(pgPagination.pageCountProperty().greaterThan(1));
        pgPagination.disableProperty().bind(pgPagination.pageCountProperty().lessThanOrEqualTo(0));
        btnOpenFilters.textProperty().bind(Bindings.createStringBinding(() -> filters.getActiveFilters() == 0 ? "" : String.format("(%d)", filters.getActiveFilters()), filters.activeFiltersProperty()));
    }

    private void initColumns() {
        tcValidationCode.setCellValueFactory(param -> param.getValue().validationCodeProperty());
        tcValidationCode.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));

        tcValidated.setCellFactory(param -> new CheckBoxTableCell<>(index -> tvSubmissions.getItems().get(index).validatedProperty()));
        tcValidated.setCellValueFactory(param -> param.getValue().validatedProperty());

        tcSelection.setCellValueFactory(param -> param.getValue().selectedProperty());
        tcSelection.setCellFactory(param -> new CheckBoxTableCell<>(index -> tvSubmissions.getItems().get(index).selectedProperty()));

        tcRecordedBy.setCellValueFactory(param -> param.getValue().submittedByProperty());
        tcRecordedBy.setCellFactory(param -> new ComboBoxTableCell<>());

        tcRecordedOn.setCellValueFactory(param -> param.getValue().submittedOnProperty());
        tcRecordedOn.setCellFactory(param -> new TableCell<>() {
            @Override
            protected void updateItem(Date item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText(new SimpleDateFormat("dd/MM/yyyy").format(item));
                }
            }
        });

        tcRecordedAt.setCellValueFactory(param -> param.getValue().submittedAtProperty());
        tcRecordedAt.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
    }

    private void onOpenFiltersButtonClicked(ActionEvent e) {
        filterDialog.showAndWait()
                .filter(b -> b.getButtonData().equals(ButtonBar.ButtonData.CANCEL_CLOSE))
                .ifPresent(__ -> filters.reset());
        doLoadSubmissionData();
    }
}
