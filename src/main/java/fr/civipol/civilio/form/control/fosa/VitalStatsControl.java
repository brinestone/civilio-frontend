package fr.civipol.civilio.form.control.fosa;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.converter.CachedStringConverter;
import fr.civipol.civilio.domain.viewmodel.FOSAVitalCSCStatViewModel;
import fr.civipol.civilio.entity.FosaStat;
import fr.civipol.civilio.form.field.VitalStatsField;
import fr.civipol.civilio.util.NotifyCallback;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
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

import java.text.NumberFormat;
import java.text.ParseException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Objects;
import java.util.Optional;

public class VitalStatsControl extends SimpleControl<VitalStatsField> {
    private final BooleanProperty listItemsChanged = new SimpleBooleanProperty(false);
    private TableView<FOSAVitalCSCStatViewModel> tvStats;
    private TableColumn<FOSAVitalCSCStatViewModel, Integer> tcYear;
    private TableColumn<FOSAVitalCSCStatViewModel, Integer> tcBirths;
    private TableColumn<FOSAVitalCSCStatViewModel, Integer> tcDeaths;
    private TableColumn<FOSAVitalCSCStatViewModel, Boolean> tcSelection;
    private final NotifyCallback updateTrigger;
    private Button btnAddRow;
    private Label mainLabel;
    private HBox actionBar;
    private CheckBox cbSelectAll;
    private Button btnRemoveSelection;
    private ObservableSet<FOSAVitalCSCStatViewModel> selectedItems;

    public VitalStatsControl(NotifyCallback updateTrigger) {
        this.updateTrigger = updateTrigger;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void layoutParts() {
        super.layoutParts();
        tcSelection.setGraphic(cbSelectAll);
        tcBirths.setPrefWidth(200);
        tcDeaths.setPrefWidth(200);
//        tcObservations.setPrefWidth(400);
        tcSelection.setPrefWidth(30);
        tcSelection.setMaxWidth(30);
        tvStats.setPrefHeight(200);
        actionBar.getChildren().setAll(btnRemoveSelection, btnAddRow);
        actionBar.setSpacing(5.0);
        actionBar.setAlignment(Pos.CENTER_RIGHT);
        tvStats.getColumns().setAll(tcSelection, tcYear, tcBirths, tcDeaths/*, tcObservations*/);
        add(mainLabel, 0, 0, 5, 1);
        add(tvStats, 0, 1, 12, 1);
        add(actionBar, 8, 0, 4, 1);
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
//        tcObservations.textProperty().bind(field.observationsColumnLabelProperty());
        btnAddRow.disableProperty().bind(
                Bindings.createBooleanBinding(() -> {
                    LocalDate now = LocalDate.now();
                    final var maxYear = now.getYear() - 1;
                    final var minYear = now.getYear() - 5;
                    final var yearCount = tvStats.getItems()
                            .stream()
                            .filter(vm -> vm.getYear() <= maxYear && vm.getYear() >= minYear)
                            .count();
                    return yearCount >= 5;
                }, tvStats.getItems())
        );
        btnAddRow.textProperty().bind(field.addRowLabelProperty());
//        tcObservations.editableProperty().bind(field.editableProperty());
        tcDeaths.editableProperty().bind(field.editableProperty());
        tcBirths.editableProperty().bind(field.editableProperty());
        tcSelection.editableProperty().bind(field.editableProperty());
//        tcYear.editableProperty().bind(field.editableProperty());
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
                    .filter(FOSAVitalCSCStatViewModel::isSelected)
                    .forEach(selectedItems::add);
            tvStats.getItems().stream()
                    .filter(vm -> !vm.isSelected())
                    .forEach(selectedItems::remove);
            if (!nv) return;
            listItemsChanged.set(false);
        });
        field.valueProperty().addListener((ListChangeListener<FosaStat>) c -> {
            while (c.next()) {
                if (c.wasAdded()) {
                    final var wrappers = c.getAddedSubList().stream()
                            .map(FOSAVitalCSCStatViewModel::new)
                            .peek(vm -> vm.setSelected(selectedItems.stream().anyMatch(vvm -> Objects.equals(vvm.getYear(), vm.getYear()))))
                            .peek(vm -> vm.selectedProperty().addListener((obb, ovv, nvv) -> listItemsChanged.set(true)))
                            .toList();
                    tvStats.getItems().addAll(wrappers);
                } else if (c.wasRemoved()) {
                    for (var i : c.getRemoved()) {
                        tvStats.getItems().removeIf(vm -> vm.getStat().equals(i));
                    }
                }
            }
        });

        selectedItems.addListener((SetChangeListener<FOSAVitalCSCStatViewModel>) c -> {
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

    private void triggerValueUpdate() {
        final var temp = new ArrayList<>(field.getValue());
        field.valueProperty().clear();
        tvStats.getItems().clear();
        field.valueProperty().addAll(temp);
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
        final var converter = new CachedStringConverter<Integer>() {
            private final NumberFormat formatter = NumberFormat.getNumberInstance();

            @Override
            protected Integer doFromString(String s) {
                try {
                    return formatter.parse(s).intValue();
                } catch (ParseException ignored) {
                    return null;
                }
            }

            @Override
            public String doToString(Integer value) {
                return formatter.format((long) value);
            }
        };
        tcYear.setCellFactory(param -> new TextFieldTableCell<>());

        tcDeaths.setCellValueFactory(param -> param.getValue().deathCountProperty());
        tcDeaths.setCellFactory(param -> new TextFieldTableCell<>(converter));

        tcBirths.setCellValueFactory(param -> param.getValue().birthCountProperty());
        tcBirths.setCellFactory(param -> new TextFieldTableCell<>(converter));

        tcSelection.setStyle("-fx-alignment: CENTER;");
        btnAddRow.setCursor(Cursor.HAND);

        tvStats.getItems().setAll(
                Optional.ofNullable(field.getValue())
                        .stream()
                        .flatMap(c -> c.stream().map(FOSAVitalCSCStatViewModel::new))
                        .peek(vm -> vm.selectedProperty().addListener((obb, ovv, nvv) -> listItemsChanged.set(true)))
                        .toList()
        );
        tcSelection.setSortable(false);
        tcYear.setEditable(false);
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
        tcYear = new TableColumn<>("fosa_vital_stats.columns.year");
        tcBirths = new TableColumn<>("fosa_vital_stats.columns.births");
        tcDeaths = new TableColumn<>("fosa_vital_stats.columns.deaths");
        btnAddRow = new Button("controls.stats_collector.actions.add_new");
        selectedItems = FXCollections.observableSet();
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        btnAddRow.setOnAction(this::onAddRowButtonClicked);
        tcYear.setOnEditCommit(e -> {
            e.getRowValue().setYear(e.getNewValue());
            triggerValueUpdate();
        });
        tcDeaths.setOnEditCommit(e -> {
            e.getRowValue().setDeathCount(e.getNewValue());
            triggerValueUpdate();
        });
        tcBirths.setOnEditCommit(e -> {
            e.getRowValue().setBirthCount(e.getNewValue());
            triggerValueUpdate();
        });
        btnRemoveSelection.setOnAction(this::onRemoveSelectionButtonClicked);
        cbSelectAll.setOnAction(e -> tvStats.getItems().forEach(i -> i.setSelected(cbSelectAll.isSelected())));
    }

    private void onRemoveSelectionButtonClicked(ActionEvent ignored) {
        for (var item : selectedItems) {
            field.valueProperty().remove(item.getStat());
        }
        selectedItems.clear();
        System.gc();
    }

    private void onAddRowButtonClicked(ActionEvent ignored) {
        int currentYear = LocalDate.now().getYear();
        final var years = new int[]{currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5};
        for (int year : years) {
            final var yearExists = field.getValue().stream().anyMatch(s -> s.getYear() == year);
            if (yearExists) continue;

            final var stats = FosaStat.builder().year(year).build();
            field.getValue().add(stats);
            break;
        }
        field.getValue().sort((o1, o2) -> o2.getYear() - o1.getYear());
        listItemsChanged.set(true);
    }
}
