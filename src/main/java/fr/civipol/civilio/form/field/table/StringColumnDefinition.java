package fr.civipol.civilio.form.field.table;

import javafx.scene.control.TableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.util.StringConverter;
import javafx.util.converter.DefaultStringConverter;

public class StringColumnDefinition<V> extends ColumnDefinition<V, String, StringColumnDefinition<V>> {
    private static final StringConverter<String> defaultConverter = new DefaultStringConverter();
    private static <V> TableCell<V, String> defaultSupplier() {
        return new TextFieldTableCell<>(defaultConverter);
    }

    StringColumnDefinition(String titleKey, String fieldKey) {
        super(titleKey, fieldKey, StringColumnDefinition::defaultSupplier);
//        withConverter(defaultConverter);
    }

    public StringColumnDefinition<V> withAutoCompletion() {
        return this;
    }
}
