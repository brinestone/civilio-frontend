package fr.civipol.civilio.form.field.table;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.util.TranslationService;
import javafx.beans.property.ListProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;

import java.util.List;

public class TabularField<V> extends DataField<ListProperty<V>, List<V>, TabularField<V>> {
    private static final String ADD_ACTION_TEXT = "controls.stats_collector.actions.add_new";
    private static final String REMOVE_ACTION_TEXT = "controls.stats_collector.actions.remove_selection";
    private final ObservableList<ColumnDefinition<V, ?>> columnDefinitions = FXCollections.observableArrayList();
    private final StringProperty addActionText = new SimpleStringProperty(), removeActionText = new SimpleStringProperty();

    public ObservableList<ColumnDefinition<V, ?>> getColumnDefinitions() {
        return columnDefinitions;
    }

    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        addActionText.setValue(service.translate(ADD_ACTION_TEXT));
        removeActionText.setValue(service.translate(REMOVE_ACTION_TEXT));
        columnDefinitions.forEach(columnDefinition -> {
            if (columnDefinition == null) return;
            columnDefinition.titleProperty().set(service.translate(columnDefinition.getTitleKey()));
        });
    }

    public <R extends Field<R>> TabularField<V> withColumn(ColumnDefinition<V, R> definition) {
        columnDefinitions.add(definition);
        return this;
    }

    protected TabularField(ListProperty<V> valueProperty, ListProperty<V> persistentValueProperty) {
        super(valueProperty, persistentValueProperty);
        rendererSupplier = TabularControl::new;
    }

    public static <V> TabularField<V> create(ListProperty<V> list) {
        return new TabularField<>(new SimpleListProperty<>(list), new SimpleListProperty<>(list));
    }

    public StringProperty removeActionTextProperty() {
        return removeActionText;
    }

    public StringProperty addActionTextProperty() {
        return addActionText;
    }
}
