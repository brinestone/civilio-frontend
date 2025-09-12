package fr.civipol.civilio.form.field.table;

import javafx.beans.property.*;
import javafx.collections.ObservableList;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.util.StringConverter;
import lombok.AccessLevel;
import lombok.Getter;

import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class ColumnDefinition<T, V, C extends ColumnDefinition<T, V, C>> {
    @Getter(AccessLevel.PACKAGE)
    private final String titleKey, fieldKey;
    @Getter(AccessLevel.PACKAGE)
    protected Supplier<TableCell<T, V>> cellSupplier;
    @Getter(AccessLevel.PACKAGE)
    protected final TableColumn<T, V> tableColumn = new TableColumn<>();
    private final BooleanProperty editable = new SimpleBooleanProperty(true);
    private final ObjectProperty<BiFunction<String, Integer, Property<V>>> valueProvider = new SimpleObjectProperty<>();
    private final ObjectProperty<Predicate<V>> validator = new SimpleObjectProperty<>();
    private final ObjectProperty<StringConverter<V>> converter = new SimpleObjectProperty<>();
    private final StringProperty title = new SimpleStringProperty();

    public ColumnDefinition<T, V, C> withValidator(Predicate<V> predicate) {
        this.validator.set(predicate);
        return this;
    }

    public ColumnDefinition<T, V, C> withValueSelector(BiFunction<String, Integer, Property<V>> provider) {
        this.valueProvider.set(provider);
        return this;
    }

    public ColumnDefinition<T, V, C> withConverter(StringConverter<V> converter) {
        this.converter.set(converter);
        return this;
    }

    public ColumnDefinition<T, V, C> editable(boolean editable) {
        this.editable.set(editable);
        return this;
    }

    public ColumnDefinition<T, V, C> width(double width) {
        this.tableColumn.setPrefWidth(width);
        return this;
    }

    ColumnDefinition(String titleKey, String fieldKey, Supplier<TableCell<T, V>> cellSupplier) {
        this.cellSupplier = cellSupplier;
        this.fieldKey = fieldKey;
        this.titleKey = titleKey;
        setupTableColumn();
    }

    protected void setupTableColumn() {
        tableColumn.textProperty().bind(title);
        tableColumn.editableProperty().bind(editable);
        tableColumn.setCellValueFactory(param -> Optional.ofNullable(valueProvider.getValue())
                .map(fn -> fn.apply(fieldKey, param.getTableView().getItems().indexOf(param.getValue())))
                .orElse(new SimpleObjectProperty<>()));
        tableColumn.setCellFactory(param -> cellSupplier.get());
    }

    public static <V> StringColumnDefinition<V> ofStringType(String fieldKey) {
        return new StringColumnDefinition<>(fieldKey, fieldKey);
    }

    public static <V, R> SingleSelectionColumnDefinition<V, R> ofSingleSelectionType(StringConverter<R> converter, ObservableList<R> options, String fieldKey) {
        return new SingleSelectionColumnDefinition<>(fieldKey, fieldKey, options, converter);
    }

    public static <V, R> MultiSelectionColumnDefinition<V, R> ofMultiSelectionType(String fieldKey, ObservableList<R> options, StringConverter<R> converter) {
        return new MultiSelectionColumnDefinition<>(fieldKey, fieldKey, options, converter);
    }

    public static <V> BooleanColumnDefinition<V> ofBooleanType(String fieldKey) {
        return new BooleanColumnDefinition<>(fieldKey, fieldKey);
    }

    public static <V> SpinnerColumnDefinition<V, Float> ofFloatType(String fieldKey) {
        return SpinnerColumnDefinition.ofFloatType(fieldKey, fieldKey);
    }

    public static <V> IntegerColumnDefinition<V> ofIntegerType(String fieldKey) {
        return new IntegerColumnDefinition<>(fieldKey, fieldKey);
    }

    public boolean isEditable() {
        return editable.get();
    }

    public BooleanProperty editableProperty() {
        return editable;
    }

    public StringProperty titleProperty() {
        return title;
    }

    public ObjectProperty<StringConverter<V>> converterProperty() {
        return converter;
    }
}