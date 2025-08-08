package fr.civipol.civilio.form.field.table;

import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.domain.converter.OptionConverter;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.util.StringConverter;
import lombok.AccessLevel;
import lombok.Getter;

import java.util.Collection;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class ColumnDefinition<T, V> {
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

    public static <V> StringColumnDefinition<V> ofStringType(String titleKey, String fieldKey) {
        Supplier<TableCell<V, String>> supplier = TextFieldTableCell::new;
        return new StringColumnDefinition<>(titleKey, fieldKey);
    }

    public static <V, R> SingleSelectionColumnDefinition<V, R> ofSingleSelectionType(StringConverter<R> converter, ObservableList<R> options, String titleKey, String fieldKey) {
        return new SingleSelectionColumnDefinition<>(titleKey, fieldKey, options, converter);
    }

    public static <V, R> MultiSelectionColumnDefinition<V, R> ofMultiSelectionType(String titleKey, String fieldKey, ObservableList<R> options, StringConverter<R> converter) {
        return new MultiSelectionColumnDefinition<>(titleKey, fieldKey, options, converter);
    }

    public static <V> ColumnDefinition<V, Boolean> ofBooleanType(String titleKey, String fieldKey) {
        final var definition = new ColumnDefinition<V, Boolean>(titleKey, fieldKey, null);
        definition.cellSupplier = () -> new CheckBoxTableCell<>(index -> definition.valueProvider.get().apply(fieldKey, index));
        return definition;
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