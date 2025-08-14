package fr.civipol.civilio.form.field.table;

import javafx.beans.property.*;
import javafx.collections.ObservableList;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.util.StringConverter;
import lombok.AccessLevel;
import lombok.Getter;

import java.util.function.BiFunction;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class ColumnDefinition<T, V, C extends ColumnDefinition<T, V, C>> {
    @Getter(AccessLevel.PACKAGE)
    private final String titleKey, fieldKey;
    @Getter(AccessLevel.PACKAGE)
    private Supplier<TableCell<T, V>> cellSupplier;
    @Getter(AccessLevel.PACKAGE)
    private final TableColumn<T, V> tableColumn = new TableColumn<>();
    private final BooleanProperty editable = new SimpleBooleanProperty(true);
    private final ObjectProperty<BiFunction<String, Integer, Property<V>>> valueProvider = new SimpleObjectProperty<>();
    private final ObjectProperty<Predicate<V>> validator = new SimpleObjectProperty<>();
    private final ObjectProperty<StringConverter<V>> converter = new SimpleObjectProperty<>();
    private final StringProperty title = new SimpleStringProperty();

    public ColumnDefinition<T, V, C> withValidator(Predicate<V> predicate) {
        this.validator.set(predicate);
        return (C) this;
    }

    public ColumnDefinition<T, V, C> withValueProvider(BiFunction<String, Integer, Property<V>> provider) {
        this.valueProvider.set(provider);
        return (C) this;
    }

    public ColumnDefinition<T, V, C> withConverter(StringConverter<V> converter) {
        this.converter.set(converter);
        return (C) this;
    }

    public ColumnDefinition<T, V, C> editable(boolean editable) {
        this.editable.set(editable);
        return (C) this;
    }

    public ColumnDefinition<T, V, C> width(double width) {
        this.tableColumn.setPrefWidth(width);
        return (C) this;
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

    public static <V> StringColumnDefinition<V> ofStringType(String titleKey, String fieldKey) {
        return new StringColumnDefinition<>(titleKey, fieldKey);
    }

    public static <V, R> SingleSelectionColumnDefinition<V, R> ofSingleSelectionType(StringConverter<R> converter, ObservableList<R> options, String titleKey, String fieldKey) {
        return new SingleSelectionColumnDefinition<>(titleKey, fieldKey, options, converter);
    }

    public static <V, R> MultiSelectionColumnDefinition<V, R> ofMultiSelectionType(String titleKey, String fieldKey, ObservableList<R> options, StringConverter<R> converter) {
        return new MultiSelectionColumnDefinition<>(titleKey, fieldKey, options, converter);
    }

    public static <V> BooleanColumnDefinition<V> ofBooleanType(String titleKey, String fieldKey) {
        return new BooleanColumnDefinition<>(titleKey, fieldKey);
    }

    public static <V> SpinnerColumnDefinition<V, Float> ofFloatType(String titleKey, String fieldKey) {
        return SpinnerColumnDefinition.ofFloatType(titleKey, fieldKey);
    }

    public static <V> SpinnerColumnDefinition<V, Integer> ofIntegerType(String titleKey, String fieldKey) {
        return SpinnerColumnDefinition.ofIntegerType(titleKey, fieldKey);
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