package fr.civipol.civilio.form.field.table;

import javafx.scene.control.TableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.util.converter.DefaultStringConverter;

public class StringColumnDefinition<V> extends ColumnDefinition<V, String> {
    private static <V> TableCell<V, String> defaultSupplier() {
        return new TextFieldTableCell<>();
    }

    StringColumnDefinition(String titleKey, String fieldKey) {
        super(titleKey, fieldKey, StringColumnDefinition::defaultSupplier);
        withConverter(new DefaultStringConverter());
    }

    public StringColumnDefinition<V> withAutoCompletion() {

        return this;
    }
}
