package fr.civipol.civilio.controller;

import fr.civipol.civilio.controls.SubmissionsFilter;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.viewmodel.FormSubmissionViewModel;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.services.FormService;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableSet;
import javafx.collections.SetChangeListener;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.scene.image.Image;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.Window;
import javafx.util.StringConverter;
import javafx.util.converter.DefaultStringConverter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.kordamp.ikonli.javafx.FontIcon;

import java.io.IOException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutorService;

@Slf4j
public class SubmissionsController implements AppController, Initializable {
    private static final int PAGE_SIZE = 100;
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
    private final Map<String, Stack<FieldChange>> pendingUpdates = new HashMap<>();
    private final BooleanProperty hasPendingUpdates = new SimpleBooleanProperty(this, "hasPendingChanges", false);
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
            if (StringUtils.isBlank(submissionId))
                controller.updateFormValues();
            controller.setOnSubmit(__ -> {
                dialog.close();
                doLoadSubmissionData();
            });
            controller.setOnDiscard(__ -> dialog.close());
            controller.setSubmissionId(submissionId);

            dialog.setTitle("Forms::" + cbFormType.getValue().toString().toUpperCase() + " - " + System.getProperty("app.name"));
            dialog.setScene(new Scene((Parent) view));
            dialog.getScene().getStylesheets().add(Objects.requireNonNull(getClass().getResource("/styles/root.css")).toExternalForm());
            dialog.showAndWait();
        } catch (IOException | NullPointerException ex) {
            log.error("failed to load " + cbFormType.getValue().toString().toUpperCase() + " form view", ex);
        }
    }

    public void initialize(URL location, ResourceBundle resources) {
        resourceRef = resources;
        filters = new SubmissionsFilter(resources);
        initTableView();
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

    private void initTableView() {
        tvSubmissions.setRowFactory(tv -> {
            final var row = new TableRow<FormSubmissionViewModel>();
            final var contextMenu = new ContextMenu();
            contextMenu.getItems().setAll(new MenuItem(resourceRef.getString("fosa.submissions.context_menu.actions.edit")));
            contextMenu.setOnAction(ignored -> {
                final var submissionId = row.getTableView().getFocusModel().getFocusedItem().getSubmission().getId();
                showFormDialog(row.getScene().getWindow(), submissionId);
            });

            row.setContextMenu(contextMenu);
            row.setOnMouseClicked(event -> {
                if (event.getButton().equals(MouseButton.PRIMARY) && event.getClickCount() == 2 && !row.isEmpty()) {
                    Node target = (Node) event.getTarget();
                    boolean clickedOnCheckBox = false;
                    while (target != null && target != row) {
                        clickedOnCheckBox = target instanceof CheckBox;
                        if (clickedOnCheckBox) break;
                        target = target.getParent();
                    }

                    if (!clickedOnCheckBox) { // Only proceed if the double click wasn't on the checkbox
                        final var submissionId = row.getTableView().getFocusModel().getFocusedItem().getSubmission().getId();
                        System.out.println("Double-clicked on row (not checkbox): " + submissionId); // Debugging
                        showFormDialog(row.getScene().getWindow(), submissionId);
                        event.consume(); // Consume the double click event to prevent further propagation
                    }
                }
            });
            return row;
        });
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

        hbSelectionActionBar.setPadding(new Insets(15, 15, 0, 15));
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
                formService.deleteSubmissions(cbFormType.getValue(), ids);
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
                    final var alert = new Alert(Alert.AlertType.ERROR, null, ButtonType.OK);
                    alert.setHeaderText(t.getLocalizedMessage());
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
        tcValidationCode.setOnEditCommit(e -> {
            e.getRowValue().setValidationCode(e.getNewValue());
            hasPendingUpdates.set(true);
            final var stack = pendingUpdates.computeIfAbsent(e.getRowValue().getSubmission().getId(), ignored -> new Stack<>());
            stack.push(new FieldChange(e.getRowValue().getSubmission().getId(), e.getNewValue(), e.getOldValue(), 0, false));
        });
        tcRecordedBy.setOnEditCommit(e -> {
            e.getRowValue().setSubmittedBy(e.getNewValue());
            hasPendingUpdates.set(true);
            final var stack = pendingUpdates.computeIfAbsent(e.getRowValue().getSubmission().getId(), ignored -> new Stack<>());
            stack.push(new FieldChange(e.getRowValue().getSubmission().getId(), e.getNewValue(), e.getOldValue(), 0, false));
        });
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

    private void doSavePendingChanges() {
//
//        spTableContainer.getChildren().add(1, spLoadingSpinnerContainer);
//        executorService.submit(() -> {
//            try {
//                for (var entry : pendingUpdates.entrySet())
//                    formService.updateSubmission(entry.getKey(), entry.getValue().toArray(UpdateSpec[]::new));
//                Platform.runLater(() -> {
//                    pendingUpdates.clear();
//                    hasPendingUpdates.set(false);
//                    doLoadSubmissionData();
//                });
//            } catch (Throwable t) {
//                log.error("error while loading submissions data", t);
//                showErrorAlert(t.getLocalizedMessage());
//            } finally {
//                Platform.runLater(() -> spTableContainer.getChildren().remove(1));
//            }
//        });
    }

    private void doLoadSubmissionData() {
        spTableContainer.getChildren().add(1, spLoadingSpinnerContainer);
        tvSubmissions.getItems().clear();
        executorService.submit(() -> {
            try {
                final var result = formService.findFormSubmissions(cbFormType.getValue(), pgPagination.getCurrentPageIndex(), PAGE_SIZE, filters.getFilterManager());
                Platform.runLater(() -> {
                    try {
                        final var submissions = result.getData().stream()
                                .map(FormSubmissionViewModel::new)
                                .peek(vm -> vm.setSelected(selectedItems.contains(vm)))
                                .peek(vm -> vm.selectedProperty().addListener((ob, ov, nv) -> {
                                    if (nv) selectedItems.add(vm);
                                    else selectedItems.remove(vm);
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
                showErrorAlert(t.getLocalizedMessage());
            } finally {
                Platform.runLater(() -> spTableContainer.getChildren().remove(1));
            }
        });
    }

    private void onSelectionChanged() {
        if (selectedItems.size() <= 0)
            cbSelectAll.setSelected(false);
        else if (selectedItems.size() == tvSubmissions.getItems().size())
            cbSelectAll.setSelected(true);
        else if (selectedItems.size() < tvSubmissions.getItems().size()) {
            cbSelectAll.setIndeterminate(true);
        }
    }

    private void setupChangeListeners() {
        tvSubmissions.getItems().addListener((ListChangeListener<FormSubmissionViewModel>) c -> {
            while (c.next()) {
                if (c.wasRemoved()) {
                    c.getRemoved().forEach(selectedItems::remove);
                }
            }
        });
        selectedItems.addListener((SetChangeListener<FormSubmissionViewModel>) ignored -> {
            if (selectedItems.size() == 0)
                bpRoot.setBottom(hbActionBar);
            else bpRoot.setBottom(hbSelectionActionBar);
            onSelectionChanged();
        });
        pgPagination.currentPageIndexProperty().addListener((ob, ov, nv) -> doLoadSubmissionData());
        cbFormType.valueProperty().addListener((ob, ov, nv) -> {
            filters.reset();
            pgPagination.setCurrentPageIndex(0);
        });
        hasPendingUpdates.addListener((ob, ov, nv) -> {
            if (!nv) {
                btnOpenFilters.setGraphic(new FontIcon("fth-filter"));
                btnOpenFilters.setOnAction(this::onOpenFiltersButtonClicked);
            } else {
                btnOpenFilters.setGraphic(new FontIcon("fth-save"));
                btnOpenFilters.setOnAction(this::onSavePendingChangesButtonClicked);
            }
        });
    }

    private void onSavePendingChangesButtonClicked(ActionEvent ignored) {
        doSavePendingChanges();
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
        tcSelection.setEditable(true);

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

//        tcRegion.setCellValueFactory(param -> param.getValue().regionProperty());
//        tcRegion.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
    }

    private void onOpenFiltersButtonClicked(ActionEvent e) {
        filterDialog.showAndWait()
                .filter(b -> b.getButtonData().equals(ButtonBar.ButtonData.CANCEL_CLOSE))
                .ifPresent(__ -> filters.reset());
        doLoadSubmissionData();
    }
}
