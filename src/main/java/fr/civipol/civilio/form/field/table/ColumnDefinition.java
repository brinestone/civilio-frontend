package fr.civipol.civilio.form.field.table;

import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.util.StringConverter;
import lombok.AccessLevel;
import lombok.Getter;

import java.util.Collection;
import java.util.function.BiFunction;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class ColumnDefinition<T, V> {
    @Getter(AccessLevel.PACKAGE)
    private final String titleKey, fieldKey;
    @Getter
    private Supplier<TableCell<T, V>> cellSupplier;
    @Getter(AccessLevel.PACKAGE)
    private final TableColumn<T, V> tableColumn = new TableColumn<>();
    private final BooleanProperty editable = new SimpleBooleanProperty(true);
    private final ObjectProperty<BiFunction<String, Integer, Property<V>>> valueProvider = new SimpleObjectProperty<>();
    private final ObjectProperty<Predicate<V>> validator = new SimpleObjectProperty<>();
    private final ObjectProperty<StringConverter<V>> converter = new SimpleObjectProperty<>();
    private final StringProperty title = new SimpleStringProperty();

    public ColumnDefinition<T, V> withValidator(Predicate<V> predicate) {
        this.validator.set(predicate);
        return this;
    }

    public ColumnDefinition<T, V> withValueProvider(BiFunction<String, Integer, Property<V>> provider) {
        this.valueProvider.set(provider);
        return this;
    }

    public ColumnDefinition<T, V> withConverter(StringConverter<V> converter) {
        this.converter.set(converter);
        return this;
    }

    public ColumnDefinition<T, V> editable(boolean editable) {
        this.editable.set(editable);
        return this;
    }

    public ColumnDefinition<T, V> width(double width) {
        this.tableColumn.setPrefWidth(width);
        return this;
    }

    ColumnDefinition(String titleKey, String fieldKey, Supplier<TableCell<T, V>> cellSupplier) {
        this.cellSupplier = cellSupplier;
        this.fieldKey = fieldKey;
        this.titleKey = titleKey;
        setupTableColumn();
    }

    private void setupTableColumn() {
        tableColumn.textProperty().bind(title);
        tableColumn.setCellValueFactory(param -> {
            final var index = param.getTableView().getItems().indexOf(param.getValue());
            return valueProvider.get().apply(fieldKey, index);
        });
        tableColumn.setCellFactory(param -> cellSupplier.get());
    }

    public static <V> ColumnDefinition<V, String> ofStringType(String titleKey, String fieldKey) {
        Supplier<TableCell<V, String>> supplier = TextFieldTableCell::new;
        return new ColumnDefinition<>(titleKey, fieldKey, supplier);
    }

    public static <V, R> ColumnDefinition<V, R> ofSelectionType(Collection<R> options, String titleKey, String fieldKey) {
        Supplier<TableCell<V, R>> supplier = () -> new ComboBoxTableCell<>(FXCollections.observableArrayList(options));
        return new ColumnDefinition<>(titleKey, fieldKey, supplier);
    }

    public static <V> ColumnDefinition<V, Boolean> ofBooleanType(String titleKey, String fieldKey) {
        final var definition = new ColumnDefinition<V, Boolean>(titleKey, fieldKey, null);
        definition.cellSupplier = () -> new CheckBoxTableCell<>(index -> definition.valueProvider.get().apply(fieldKey, index));
        return definition;
    }

    public static <V> ColumnDefinition<V, Integer> ofIntegerType(String titleKey, String fieldKey) {
        Supplier<TableCell<V, Integer>> supplier = TextFieldTableCell::new;
        return new ColumnDefinition<>(titleKey, fieldKey, supplier);
    }

    public boolean isEditable() {
        return editable.get();
    }

    public StringProperty titleProperty() {
        return title;
    }

    public ObjectProperty<StringConverter<V>> converterProperty() {
        return converter;
    }
}