package fr.civipol.civilio.form.field.table;

import javafx.collections.ObservableList;
import javafx.scene.control.TableCell;
import javafx.util.StringConverter;

import java.util.List;
import java.util.function.Supplier;

public class MultiSelectionColumnDefinition<V, R> extends ColumnDefinition<V, List<R>> {
    private static <V, R> Supplier<TableCell<V, List<R>>> defaultSupplier(ObservableList<R> options, StringConverter<R> stringConverter) {
        return () -> new CheckComboBoxTableCell<V, R>(stringConverter, options);
    }

    MultiSelectionColumnDefinition(String titleKey, String fieldKey, ObservableList<R> options, StringConverter<R> converter) {
        super(titleKey, fieldKey, defaultSupplier(options, converter));
    }
}
