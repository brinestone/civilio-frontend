package fr.civipol.civilio.controls;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.IntegerStringConverter;
import fr.civipol.civilio.domain.StatsField;
import fr.civipol.civilio.domain.VitalCSCStatViewModel;
import fr.civipol.civilio.entity.VitalCSCStat;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableSet;
import javafx.collections.SetChangeListener;
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
import java.util.Objects;
import java.util.Optional;

public class StatsControl extends SimpleControl<StatsField> {
    private final BooleanProperty listItemsChanged = new SimpleBooleanProperty(false);
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
    private Button btnRemoveSelection;
    private ObservableSet<VitalCSCStatViewModel> selectedItems;

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
                    LocalDate now = LocalDate.now();
                    final var maxYear = now.getYear() - 1;
                    final var minYear = now.getYear() - 5;
                    final var yearCount = tvStats.getItems()
                            .stream()
                            .filter(vm -> vm.getYear() <= maxYear && vm.getYear() >= minYear)
                            .count();
                    return yearCount == 5;
                }, tvStats.getItems())
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
        listItemsChanged.addListener((ob, ov, nv) -> {
            tvStats.getItems().stream()
                    .filter(VitalCSCStatViewModel::isSelected)
                    .forEach(selectedItems::add);
            tvStats.getItems().stream()
                    .filter(vm -> !vm.isSelected())
                    .forEach(selectedItems::remove);
            if (!nv) return;
            listItemsChanged.set(false);
        });
        field.valueProperty().addListener((ob, ov, nv) -> {
            final var wrappers = nv.stream()
                    .map(VitalCSCStatViewModel::new)
                    .peek(vm -> {
                        if (selectedItems.stream().anyMatch(vvm -> Objects.equals(vvm.getYear(), vm.getYear()))) {
                            vm.setSelected(true);
                        }
                    })
                    .peek(vm -> vm.selectedProperty().addListener((obb, ovv, nvv) -> {
                        listItemsChanged.set(true);
                    }))
                    .toList();
            tvStats.getItems().setAll(wrappers);
        });

        selectedItems.addListener((SetChangeListener<VitalCSCStatViewModel>) c -> {
            final var selectionSize = c.getSet().size();
            final var itemsSize = tvStats.getItems().size();

            if (itemsSize == 0) {
                cbSelectAll.setSelected(false);
                return;
            }

            cbSelectAll.setIndeterminate(itemsSize != selectionSize && selectionSize > 0);
            if (!cbSelectAll.isIndeterminate()) {
                cbSelectAll.setSelected(selectionSize == itemsSize);
            }
        });
    }

    @Override
    public void initializeParts() {
        super.initializeParts();
        tcSelection.setCellFactory(param -> new CheckBoxTableCell<>(index -> {
            final var value = param.getTableView().getItems().get(index);
            return value.selectedProperty();
        }));
        tcSelection.setCellValueFactory(param -> param.getValue().selectedProperty());

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
                        .peek(vm -> vm.selectedProperty().addListener((obb, ovv, nvv) -> {
                            listItemsChanged.set(true);
                        }))
                        .toList()
        );
        tcSelection.setSortable(false);
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
        selectedItems = FXCollections.observableSet();
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
        cbSelectAll.setOnAction(e -> tvStats.getItems().forEach(i -> i.setSelected(cbSelectAll.isSelected())));
    }

    private void onRemoveSelectionButtonClicked(ActionEvent ignored) {
        for (var item : selectedItems) {
            field.valueProperty().remove(item.getStat());
        }
        selectedItems.clear();
//        listItemsChanged.set(true);
    }

    private void onAddRowButtonClicked(ActionEvent ignored) {
        int currentYear = LocalDate.now().getYear();
        final var years = new int[]{currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5};
        for (int year : years) {
            final var yearExists = field.getValue().stream().anyMatch(s -> s.getYear() == year);
            if (yearExists) continue;

            field.getValue().add(VitalCSCStat.builder().year(year).build());
            break;
        }
        field.getValue().sort((o1, o2) -> o2.getYear() - o1.getYear());
        listItemsChanged.set(true);
    }
}
