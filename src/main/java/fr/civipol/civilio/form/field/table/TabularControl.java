package fr.civipol.civilio.form.field.table;

import com.dlsc.formsfx.view.controls.SimpleControl;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.Property;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.geometry.VPos;
import javafx.scene.Cursor;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;

import java.util.ArrayList;
import java.util.function.Predicate;

@SuppressWarnings("unchecked")
public class TabularControl<V> extends SimpleControl<TabularField<V>> {
    private Label lblMain;
    private Button btnAdd, btnRemoveSelection;
    private TableView<V> table;
    private TableColumn<V, Boolean> tcSelection;
    private CheckBox cbSelectAll;
    private final ObservableList<BooleanProperty> selection = FXCollections.observableArrayList();
    private final BooleanProperty selectionChanged = new SimpleBooleanProperty(false);

    @Override
    public void layoutParts() {
        super.layoutParts();
        final var columns = field.getSpan();
        final var actionsContainer = new HBox(btnRemoveSelection, btnAdd);
        actionsContainer.setAlignment(Pos.CENTER_LEFT);
        actionsContainer.setPadding(new Insets(2, 0, 2, 0));
        actionsContainer.setSpacing(5.0);
        add(lblMain, 0, 0, columns / 2, 1);
        add(actionsContainer, columns - 2, 0, 2, 1);
        add(table, 0, 1, columns, REMAINING);
        GridPane.setValignment(actionsContainer, VPos.CENTER);
        GridPane.setValignment(lblMain, VPos.CENTER);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    @Override
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        field.editableProperty().addListener((ob, ov, nv) -> {
            if (nv) table.getColumns().add(0, tcSelection);
            else {
                table.getColumns().remove(0);
                selection.clear();
            }
        });

        field.getColumnDefinitions().addListener((ListChangeListener<ColumnDefinition>) c -> {
            while (c.next()) {
                if (c.wasAdded()) {
                    int end = c.getFrom() + c.getRemovedSize();
                    for (var i = c.getFrom(); i < end; i++) {
                        final var columnDefinition = field.getColumnDefinitions().get(i);
                        final var column = columnDefinition.getTableColumn();
                        table.getColumns().add(i + 1, column);
                        if (columnDefinition.isEditable())
                            column.editableProperty().bind(field.editableProperty());
                        column.setUserData(columnDefinition);
                        column.setCellFactory(param -> {
                            final TableCell cell = (TableCell) columnDefinition.getCellSupplier().get();
                            if (cell instanceof ComboBoxTableCell cb) {
                                cb.converterProperty().bind(columnDefinition.converterProperty());
                            }
                            return cell;
                        });
                    }
                } else if (c.wasRemoved()) {
                    for (var i = c.getFrom(); i < c.getTo(); i++) {
                        final var column = (TableColumn) table.getColumns().remove(i + 1);
                        column.editableProperty().unbind();
                    }
                }
            }
        });
        selectionChanged.addListener((ob, ov, nv) -> {
            if (selection.stream().noneMatch(Property::getValue))
                cbSelectAll.setSelected(false);
            else if (selection.stream().allMatch(Property::getValue))
                cbSelectAll.setSelected(true);
            else cbSelectAll.setIndeterminate(true);
        });
        field.valueProperty().addListener((ListChangeListener) c -> {
            while (c.next()) {
                if (c.wasAdded()) {
                    for (var i = c.getFrom(); i < c.getTo(); i++) {
                        SimpleBooleanProperty property = new SimpleBooleanProperty(false);
                        property.addListener((ob, ov, nv) -> this.selectionChanged.set(!this.selectionChanged.get()));
                        selection.add(i, property);
                    }
                } else if (c.wasRemoved()) {
                    selection.remove(c.getFrom(), c.getTo());
                }
            }
        });
        field.valueProperty().addListener(new ListChangeListener<V>() {
            @Override
            public void onChanged(Change<? extends V> c) {
                table.refresh();
            }
        });
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        lblMain.textProperty().bind(field.labelProperty());
        btnAdd.textProperty().bind(field.addActionTextProperty());
        table.prefHeightProperty().bind(field.heightProperty());
        btnRemoveSelection.textProperty().bind(field.removeActionTextProperty());
        final var noSelection = Bindings.createBooleanBinding(() -> selection.stream()
                .allMatch(Predicate.not(BooleanProperty::getValue)), selection, selectionChanged);
        final var noItems = Bindings.isEmpty(table.getItems());
        btnRemoveSelection.disableProperty().bind(noSelection);
        table.editableProperty().bind(field.editableProperty());
        btnAdd.visibleProperty().bind(field.editableProperty());
        btnRemoveSelection.visibleProperty().bind(field.editableProperty());
        cbSelectAll.visibleProperty().bind(field.editableProperty());
        cbSelectAll.disableProperty().bind(noItems);
        tcSelection.editableProperty().bind(field.editableProperty());
    }

    @Override
    public void initializeParts() {
        super.initializeParts();
        tcSelection.setGraphic(cbSelectAll);
        tcSelection.setCellFactory(param -> new CheckBoxTableCell<>(selection::get));
        table.getColumns().add(tcSelection);
        field.getColumnDefinitions().stream()
                .map(ColumnDefinition::getTableColumn)
                .forEach(table.getColumns()::add);
        tcSelection.setPrefWidth(50);
        btnAdd.setCursor(Cursor.HAND);
        btnRemoveSelection.setCursor(Cursor.HAND);
        tcSelection.setSortable(false);
        table.setItems(field.valueProperty());
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        lblMain = new Label();
        btnAdd = new Button();
        btnRemoveSelection = new Button();
        table = new TableView<>();
        tcSelection = new TableColumn<>();
        cbSelectAll = new CheckBox();
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        btnAdd.setOnAction(e -> field.valueProperty().add(field.getValueSupplier().get()));
        cbSelectAll.setOnAction(__ -> selection.forEach(p -> p.setValue(cbSelectAll.isSelected())));
        btnRemoveSelection.setOnAction(e -> {
            final var removedIndices = new ArrayList<Integer>();
            for (var i = 0; i < selection.size(); i++) {
                if (!selection.get(i).get()) continue;
                removedIndices.add(i);
            }

            var cnt = 0;
            for (var i : removedIndices) {
                field.valueProperty().remove(i + cnt++);
            }
            selection.forEach(b -> b.setValue(false));
        });
    }
}
