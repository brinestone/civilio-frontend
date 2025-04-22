package fr.civipol.civilio.controls;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.IntegerStringConverter;
import fr.civipol.civilio.domain.StatsField;
import fr.civipol.civilio.domain.VitalCSCStatViewModel;
import fr.civipol.civilio.entity.VitalCSCStat;
import javafx.beans.binding.Bindings;
import javafx.collections.ListChangeListener;
import javafx.collections.transformation.FilteredList;
import javafx.event.ActionEvent;
import javafx.geometry.HPos;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.util.converter.DefaultStringConverter;

import java.time.LocalDate;
import java.util.Optional;

public class StatsControl extends SimpleControl<StatsField> {
    private TableView<VitalCSCStatViewModel> tvStats;
    private TableColumn<VitalCSCStatViewModel, Integer> tcYear;
    private TableColumn<VitalCSCStatViewModel, Integer> tcBirths;
    private TableColumn<VitalCSCStatViewModel, Integer> tcDeaths;
    private TableColumn<VitalCSCStatViewModel, String> tcObservations;
    private TableColumn<VitalCSCStatViewModel, Boolean> tcSelection;
    private Button btnAddRow;
    private Label mainLabel;
    private HBox actionBar;
    private CheckBox cbSelectAll;
    //    private Button btnSelectAll;
    private Button btnRemoveSelection;

    private FilteredList<VitalCSCStatViewModel> selectedItems;

    @Override
    @SuppressWarnings("unchecked")
    public void layoutParts() {
        super.layoutParts();
        tcSelection.setGraphic(cbSelectAll);
        tcBirths.setPrefWidth(200);
        tcDeaths.setPrefWidth(200);
        tcObservations.setPrefWidth(400);
        tcSelection.setPrefWidth(30);
        tcSelection.setMaxWidth(30);
        actionBar.getChildren().setAll(btnRemoveSelection, btnAddRow);
        actionBar.setSpacing(5.0);
        actionBar.setAlignment(Pos.CENTER_RIGHT);
        tvStats.getColumns().setAll(tcSelection, tcYear, tcBirths, tcDeaths, tcObservations);
        add(mainLabel, 0, 0, 3, 1);
        add(tvStats, 0, 1, 12, 1);
        add(actionBar, 10, 0, 2, 1);
        GridPane.setHalignment(btnAddRow, HPos.RIGHT);
        setVgap(5.0);
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        mainLabel.textProperty().bind(field.labelProperty());
        tcYear.textProperty().bind(field.yearColumnLabelProperty());
        tcBirths.textProperty().bind(field.birthsColumnLabelProperty());
        tcDeaths.textProperty().bind(field.deathsColumnLabelProperty());
        tcObservations.textProperty().bind(field.observationsColumnLabelProperty());
        btnAddRow.disableProperty().bind(
                Bindings.createBooleanBinding(() -> {
                    final var value = field.getValue();
                    return !value.isEmpty() && value.get(0).getYear() + 1 >= LocalDate.now().getYear();
                }, field.valueProperty())
        );
        btnAddRow.textProperty().bind(field.addRowLabelProperty());
        tcObservations.editableProperty().bind(field.editableProperty());
        tcDeaths.editableProperty().bind(field.editableProperty());
        tcBirths.editableProperty().bind(field.editableProperty());
        tcSelection.editableProperty().bind(field.editableProperty());
        tcYear.editableProperty().bind(field.editableProperty());
        tvStats.editableProperty().bind(field.editableProperty());

        cbSelectAll.disableProperty().bind(field.valueProperty().emptyProperty());
        btnRemoveSelection.disableProperty().bind(Bindings.isEmpty(selectedItems));
        btnRemoveSelection.textProperty().bind(field.removeSelectionLabelProperty());
    }

    @Override
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        field.valueProperty().addListener((ob, ov, nv) -> {
            final var wrappers = nv.stream()
                    .map(VitalCSCStatViewModel::new)
                    .toList();
            tvStats.getItems().setAll(wrappers);
        });
        cbSelectAll.selectedProperty().addListener((ob, ov, nv) -> {
            tvStats.getItems().forEach(vm -> vm.setSelected(nv));
            System.out.println(tvStats.getItems());
        });
        selectedItems.addListener((ListChangeListener<VitalCSCStatViewModel>) c -> {
            final var selectionSize = c.getList().size();
            final var itemsSize = tvStats.getItems().size();

            cbSelectAll.setIndeterminate(itemsSize != selectionSize && selectionSize > 0);
            if (!cbSelectAll.isIndeterminate()) {
                cbSelectAll.setSelected(selectionSize == itemsSize);
            }
        });
    }

    @Override
    public void initializeParts() {
        super.initializeParts();
        tcSelection.setCellValueFactory(param -> param.getValue().selectedProperty());
        tcSelection.setCellFactory(CheckBoxTableCell.forTableColumn(tcSelection));

        tcYear.setCellValueFactory(param -> param.getValue().yearProperty());
        tcYear.setCellFactory(param -> new TextFieldTableCell<>(new IntegerStringConverter()));

        tcDeaths.setCellValueFactory(param -> param.getValue().deathCountProperty());
        tcDeaths.setCellFactory(param -> new TextFieldTableCell<>(new IntegerStringConverter()));

        tcBirths.setCellValueFactory(param -> param.getValue().birthCountProperty());
        tcBirths.setCellFactory(param -> new TextFieldTableCell<>(new IntegerStringConverter()));

        tcObservations.setCellValueFactory(param -> param.getValue().observationsProperty());
        tcObservations.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
        tcSelection.setStyle("-fx-alignment: CENTER;");
        btnAddRow.setCursor(Cursor.HAND);

        tvStats.getItems().setAll(
                Optional.ofNullable(field.getValue())
                        .stream()
                        .flatMap(c -> c.stream().map(VitalCSCStatViewModel::new))
                        .toList()
        );
        tcSelection.setSortable(false);
//        cbSelectAll.setAllowIndeterminate(true);
    }

    @Override
    public void initializeSelf() {
        super.initializeParts();
        btnRemoveSelection = new Button();
        mainLabel = new Label();
        cbSelectAll = new CheckBox();
        actionBar = new HBox();
        tvStats = new TableView<>();
        tcSelection = new TableColumn<>();
        tcYear = new TableColumn<>("controls.stats_collector.columns.year");
        tcBirths = new TableColumn<>("controls.stats_collector.columns.births");
        tcDeaths = new TableColumn<>("controls.stats_collector.columns.deaths");
        tcObservations = new TableColumn<>("controls.stats_collector.columns.observation");
        btnAddRow = new Button("controls.stats_collector.columns.add_new");
        selectedItems = tvStats.getItems().filtered(VitalCSCStatViewModel::isSelected);
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        btnAddRow.setOnAction(this::onAddRowButtonClicked);
        tcYear.setOnEditCommit(e -> e.getRowValue().setYear(e.getNewValue()));
        tcDeaths.setOnEditCommit(e -> e.getRowValue().setDeathCount(e.getNewValue()));
        tcObservations.setOnEditCommit(e -> e.getRowValue().setObservations(e.getNewValue()));
        tcBirths.setOnEditCommit(e -> e.getRowValue().setBirthCount(e.getNewValue()));
        btnRemoveSelection.setOnAction(this::onRemoveSelectionButtonClicked);
        tcSelection.setOnEditCommit(e -> e.getRowValue().setSelected(e.getNewValue()));
    }

    private void onRemoveSelectionButtonClicked(ActionEvent ignored) {
        final var value = field.getValue();
        selectedItems.stream()
                .map(VitalCSCStatViewModel::getStat)
                .forEach(value::remove);
        field.valueProperty().setAll(value);
    }

    private void onAddRowButtonClicked(ActionEvent ignored) {
        int currentYear = LocalDate.now().getYear();
        final var lastYear = field.getValue().size() == 0 ? currentYear - 5 : field.getValue().get(0).getYear() + 1;
        if (lastYear >= currentYear) return;

        field.getValue().add(0, VitalCSCStat.builder().year(lastYear).build());
    }
}
