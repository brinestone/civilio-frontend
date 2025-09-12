package fr.civipol.civilio.form.field.table;

import fr.civipol.civilio.domain.converter.IntegerStringConverter;
import javafx.scene.control.cell.TextFieldTableCell;

import java.util.function.Predicate;

public class IntegerColumnDefinition<V> extends ColumnDefinition<V, Integer, IntegerColumnDefinition<V>> {
    IntegerColumnDefinition(String titleKey, String fieldKey) {
        super(titleKey, fieldKey, () -> new TextFieldTableCell<>(new IntegerStringConverter()));
    }

    @Override
    public ColumnDefinition<V, Integer, IntegerColumnDefinition<V>> withValidator(Predicate<Integer> predicate) {
        cellSupplier = () -> new TextFieldTableCell<>(new IntegerStringConverter().withValidator(predicate));
        return this;
    }
}
