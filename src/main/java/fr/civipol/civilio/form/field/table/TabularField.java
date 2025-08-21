package fr.civipol.civilio.form.field.table;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.util.TranslationService;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import lombok.AccessLevel;
import lombok.Getter;

import java.util.Collection;
import java.util.List;
import java.util.function.Supplier;

public class TabularField<V> extends DataField<ListProperty<V>, List<V>, TabularField<V>> {
    private static final String ADD_ACTION_TEXT = "controls.stats_collector.actions.add_new";
    private static final String REMOVE_ACTION_TEXT = "controls.stats_collector.actions.remove_selection";
    @Getter
    private final ObservableList<ColumnDefinition> columnDefinitions = FXCollections.observableArrayList();
    private final StringProperty addActionText = new SimpleStringProperty(), removeActionText = new SimpleStringProperty();
    private final DoubleProperty height = new SimpleDoubleProperty(this, "height", 300);
    @Getter(AccessLevel.PACKAGE)
    private final Supplier<V> valueSupplier;

    protected TabularField(ListProperty<V> valueProperty, ListProperty<V> persistentValueProperty, Supplier<V> valueSupplier) {
        super(valueProperty, persistentValueProperty);
        rendererSupplier = TabularControl::new;
        this.valueSupplier = valueSupplier;
    }

    @SuppressWarnings("rawtypes")
    public final TabularField<V> withColumns(ColumnDefinition... definition) {
        columnDefinitions.setAll(definition);
        return this;
    }

    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        addActionText.setValue(service.translate(ADD_ACTION_TEXT));
        removeActionText.setValue(service.translate(REMOVE_ACTION_TEXT));
        columnDefinitions
                .forEach(cd -> cd.titleProperty().setValue(service.translate(cd.getTitleKey())));
    }

    /**
     * Creates a new tabular field
     *
     * @param data          The initial data to be in the table
     * @param valueSupplier A supplier to be used to generate new rows in the table
     * @param <V>           The data type for each row in the table
     * @return The created instance of the field
     */
    public static <V> TabularField<V> create(ListProperty<V> data, Supplier<V> valueSupplier) {
        return new TabularField<>(data, new SimpleListProperty<>(FXCollections.observableArrayList(data)), valueSupplier);
    }

    public StringProperty removeActionTextProperty() {
        return removeActionText;
    }

    public StringProperty addActionTextProperty() {
        return addActionText;
    }

    public DoubleProperty heightProperty() {
        return height;
    }
}
