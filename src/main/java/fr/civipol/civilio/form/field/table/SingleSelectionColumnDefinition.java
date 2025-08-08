package fr.civipol.civilio.form.field.table;

import javafx.collections.ObservableList;
import javafx.scene.control.TableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.util.StringConverter;

import java.util.function.Supplier;

public class SingleSelectionColumnDefinition<V, R> extends ColumnDefinition<V, R> {
    private static <V, R> Supplier<TableCell<V, R>> defaultSupplier(ObservableList<R> options, StringConverter<R> stringConverter) {
        return () -> new ComboBoxTableCell<>(stringConverter, options);
    }

    SingleSelectionColumnDefinition(String titleKey, String fieldKey, ObservableList<R> options, StringConverter<R> converter) {
        super(titleKey, fieldKey, defaultSupplier(options, converter));
    }
}
