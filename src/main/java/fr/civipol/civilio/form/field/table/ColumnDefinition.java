package fr.civipol.civilio.form.field.table;

import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.util.StringConverter;
import javafx.util.converter.DefaultStringConverter;
import lombok.AccessLevel;
import lombok.Getter;

import java.util.Collection;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class ColumnDefinition<V, R> {
    @Getter(AccessLevel.PACKAGE)
    private final String titleKey;
    @Getter
    private final Supplier<TableCell<V, R>> cellSupplier;
    @Getter(AccessLevel.PACKAGE)
    private final TableColumn<V, R> tableColumn = new TableColumn<>();
    private final BooleanProperty editable = new SimpleBooleanProperty(true);
    private final ObjectProperty<Function<V, Property<R>>> valueProvider = new SimpleObjectProperty<>();
    private final ObjectProperty<Predicate<R>> validator = new SimpleObjectProperty<>();
    private final ObjectProperty<StringConverter<R>> converter = new SimpleObjectProperty<>();
    private final StringProperty title = new SimpleStringProperty();

    public ColumnDefinition<V, R> withValidator(Predicate<R> predicate) {
        this.validator.set(predicate);
        return this;
    }

    public ColumnDefinition<V, R> withValueProvider(Function<V, Property<R>> valueProvider) {
        this.valueProvider.set(valueProvider);
        return this;
    }

    public ColumnDefinition<V, R> withConverter(StringConverter<R> converter) {
        this.converter.set(converter);
        return this;
    }

    public  ColumnDefinition<V, R> editable(boolean editable) {
        this.editable.set(editable);
        return this;
    }

    private ColumnDefinition(String titleKey,
                             Supplier<TableCell<V, R>> cellSupplier
    ) {
        this.cellSupplier = cellSupplier;
        this.titleKey = titleKey;
        setupTableColumn();
    }

    private void setupTableColumn() {
        tableColumn.textProperty().bind(title);
        tableColumn.setCellValueFactory(param -> valueProvider.get().apply(param.getValue()));
    }

    public static <V extends Comparable<V>> ColumnDefinition<V, String> ofStringType(String titleKey) {
        Supplier<TableCell<V, String>> supplier = TextFieldTableCell::new;
        return new ColumnDefinition<>(titleKey, supplier);
    }

    public static <V extends Comparable<V>, R> ColumnDefinition<V, R> ofSelectionType(String titleKey, Collection<R> options) {
        Supplier<TableCell<V, R>> supplier = () -> new ComboBoxTableCell<>(FXCollections.observableArrayList(options));
        return new ColumnDefinition<>(titleKey, supplier);
    }

    public static <V extends Comparable<V>> ColumnDefinition<V, Boolean> ofBooleanType(String titleKey) {
        Supplier<TableCell<V, Boolean>> supplier = CheckBoxTableCell::new;
        return new ColumnDefinition<>(titleKey, supplier);
    }

    public static <V extends Comparable<V>> ColumnDefinition<V, Integer> ofIntegerType(String titleKey) {
        Supplier<TableCell<V, Integer>> supplier = TextFieldTableCell::new;
        return new ColumnDefinition<>(titleKey, supplier);
    }

    public static <V extends Comparable<V>> ColumnDefinition<V, Float> ofFloatType(String titleKey) {
        Supplier<TableCell<V, Float>> supplier = TextFieldTableCell::new;
        return new ColumnDefinition<>(titleKey, supplier);
    }

    public boolean isEditable() {
        return editable.get();
    }

    public StringProperty titleProperty() {
        return title;
    }

    public StringConverter<R> getConverter() {
        return converter.get();
    }

    public void setConverter(StringConverter<R> converter) {
        this.converter.setValue(converter);
    }

    public ObjectProperty<StringConverter<R>> converterProperty() {
        return converter;
    }
}