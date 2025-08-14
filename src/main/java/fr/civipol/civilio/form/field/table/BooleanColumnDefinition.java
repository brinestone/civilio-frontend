package fr.civipol.civilio.form.field.table;

import javafx.scene.control.cell.CheckBoxTableCell;

public class BooleanColumnDefinition<V> extends ColumnDefinition<V, Boolean, BooleanColumnDefinition<V>>{
    BooleanColumnDefinition(String titleKey, String fieldKey) {
        super(titleKey, fieldKey, CheckBoxTableCell::new);
    }
}
