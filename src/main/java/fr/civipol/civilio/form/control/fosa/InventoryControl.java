package fr.civipol.civilio.form.control.fosa;

import com.dlsc.formsfx.view.controls.SimpleControl;
import com.google.common.base.Objects;
import fr.civipol.civilio.domain.converter.IntegerStringConverter;
import fr.civipol.civilio.domain.viewmodel.InventoryEntryViewModel;
import fr.civipol.civilio.entity.InventoryEntry;
import fr.civipol.civilio.form.field.InventoryField;
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
import javafx.scene.layout.HBox;
import javafx.util.converter.DefaultStringConverter;
import org.controlsfx.control.tableview2.TableColumn2;
import org.controlsfx.control.tableview2.cell.TextField2TableCell;

import java.util.Optional;

public class InventoryControl extends SimpleControl<InventoryField> {
    private Label fieldLabel;
    private final BooleanProperty listChanged = new SimpleBooleanProperty(this, "listChanged", false);
    private TableView<InventoryEntryViewModel> tvInventoryEntries;
    private TableColumn<InventoryEntryViewModel, String> tcEquipment;
    private TableColumn<InventoryEntryViewModel, Integer> tcQuantity;
    private TableColumn<InventoryEntryViewModel, Boolean> tcSelection;
    private Button btnRemoveSelection, btnAddRow;
    private HBox actionBar;
    private CheckBox cbSelectAll;
    private ObservableSet<InventoryEntryViewModel> selectedItems;

    @Override
    @SuppressWarnings("unchecked")
    public void layoutParts() {
        super.layoutParts();
        tcSelection.setGraphic(cbSelectAll);
        tcEquipment.setPrefWidth(200);
        tcQuantity.setPrefWidth(150);
        tcSelection.setPrefWidth(30);
        tcSelection.setMaxWidth(30);
        actionBar.getChildren().setAll(btnRemoveSelection, btnAddRow);
        actionBar.setSpacing(5.0);
        actionBar.setAlignment(Pos.CENTER_RIGHT);
        tvInventoryEntries.getColumns().setAll(tcSelection, tcEquipment, tcQuantity);
        tvInventoryEntries.setPrefHeight(200);
        setVgap(5.0);
        add(fieldLabel, 0, 0, 3, 1);
        add(tvInventoryEntries, 0, 1, 12, 1);
        add(actionBar, 10, 0, 2, 1);
        setHalignment(actionBar, HPos.RIGHT);
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        fieldLabel.textProperty().bind(field.labelProperty());
        tcEquipment.textProperty().bind(field.nameLabelProperty());
        tcQuantity.textProperty().bind(field.quantityLabelProperty());
        btnRemoveSelection.textProperty().bind(field.removeSelectionLabelProperty());
        btnAddRow.textProperty().bind(field.addRowLabelProperty());
        tvInventoryEntries.editableProperty().bind(field.editableProperty());
        tcQuantity.editableProperty().bind(field.editableProperty());
        tcEquipment.editableProperty().bind(field.editableProperty());
        tcSelection.editableProperty().bind(field.editableProperty());
        btnRemoveSelection.disableProperty().bind(Bindings.isEmpty(selectedItems));
        cbSelectAll.disableProperty().bind(field.valueProperty().emptyProperty());
    }

    @Override
    @SuppressWarnings("DuplicatedCode")
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        listChanged.addListener((ob, ov, nv) -> {
            tvInventoryEntries.getItems().stream()
                    .filter(InventoryEntryViewModel::isSelected)
                    .forEach(selectedItems::add);
            tvInventoryEntries.getItems().stream()
                    .filter(vm -> !vm.isSelected())
                    .forEach(selectedItems::remove);
            if (!nv) return;
            listChanged.set(false);
        });
        field.valueProperty().addListener((ob, ov, nv) -> {
            final var vms = nv.stream()
                    .map(InventoryEntryViewModel::new)
                    .peek(vm -> vm.setSelected(selectedItems.stream().anyMatch(vvm -> Objects.equal(vvm.getEntry(), vm.getEntry()))))
                    .peek(vm -> vm.selectedProperty().addListener((oob, oov, nnv) -> listChanged.set(true)))
                    .toList();
            tvInventoryEntries.getItems().setAll(vms);
        });
        selectedItems.addListener((SetChangeListener<InventoryEntryViewModel>) c -> {
            final var selectionSize = c.getSet().size();
            final var itemsSize = tvInventoryEntries.getItems().size();

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

        tcEquipment.setCellValueFactory(param -> param.getValue().equipmentNameProperty());
        tcEquipment.setCellFactory(param -> new TextField2TableCell<>(new DefaultStringConverter()));

        tcQuantity.setCellValueFactory(param -> param.getValue().quantityProperty());
        tcQuantity.setCellFactory(param -> new TextField2TableCell<>(new IntegerStringConverter()));

        btnAddRow.setCursor(Cursor.HAND);
        btnRemoveSelection.setCursor(Cursor.HAND);

        tvInventoryEntries.getItems().setAll(
                Optional.ofNullable(field.getValue())
                        .stream()
                        .flatMap(c -> c.stream().map(InventoryEntryViewModel::new))
                        .peek(vm -> vm.selectedProperty().addListener((oob, oov, nnv) -> listChanged.set(true)))
                        .toList()
        );

        tcSelection.setCellFactory(param -> new CheckBoxTableCell<>(index -> {
            final var value = param.getTableView().getItems().get(index);
            return value.selectedProperty();
        }));
        tcSelection.setCellValueFactory(param -> param.getValue().selectedProperty());
        tcSelection.setStyle("-fx-alignment: CENTER;");
        tcSelection.setSortable(false);
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        fieldLabel = new Label();
        tvInventoryEntries = new TableView<>();
        tcEquipment = new TableColumn2<>();
        tcQuantity = new TableColumn2<>();
        tcSelection = new TableColumn2<>();
        btnRemoveSelection = new Button();
        btnAddRow = new Button();
        actionBar = new HBox();
        cbSelectAll = new CheckBox();
        selectedItems = FXCollections.observableSet();
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        btnAddRow.setOnAction(this::onAddRowButtonClicked);
        btnRemoveSelection.setOnAction(this::onRemoveSelectionButtonClicked);
        tcEquipment.setOnEditCommit(e -> e.getRowValue().setEquipmentName(e.getNewValue()));
        tcQuantity.setOnEditCommit(e -> e.getRowValue().setQuantity(e.getNewValue()));
        cbSelectAll.setOnAction(e -> tvInventoryEntries.getItems().forEach(i -> i.setSelected(cbSelectAll.isSelected())));
    }

    private void onRemoveSelectionButtonClicked(ActionEvent ignored) {
        for (var item : selectedItems) {
            field.valueProperty().remove(item.getEntry());
        }
        selectedItems.clear();
    }

    private void onAddRowButtonClicked(ActionEvent ignored) {
        field.getValue().add(InventoryEntry.builder().build());
        listChanged.set(true);
    }
}
