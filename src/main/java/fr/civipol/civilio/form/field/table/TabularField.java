package fr.civipol.civilio.form.field.table;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.util.TranslationService;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import lombok.AccessLevel;
import lombok.Getter;

import java.util.Collection;
import java.util.List;
import java.util.function.Supplier;

@SuppressWarnings("rawtypes")
public class TabularField<V> extends DataField<ListProperty, List, TabularField<V>> {
    private static final String ADD_ACTION_TEXT = "controls.stats_collector.actions.add_new";
    private static final String REMOVE_ACTION_TEXT = "controls.stats_collector.actions.remove_selection";
    @Getter
    private final ObservableList<ColumnDefinition<V, ?>> columnDefinitions = FXCollections.observableArrayList();
    private final StringProperty addActionText = new SimpleStringProperty(), removeActionText = new SimpleStringProperty();
    private final DoubleProperty height = new SimpleDoubleProperty(this, "height", 300);
    @Getter(AccessLevel.PACKAGE)
    private final Supplier<V> valueSupplier;

    protected TabularField(ListProperty valueProperty, ListProperty persistentValueProperty, Supplier<V> valueSupplier) {
        super(valueProperty, persistentValueProperty);
        this.valueSupplier = valueSupplier;
    }

    public TabularField<V> withColumn(ColumnDefinition<V, ?> definition) {
        columnDefinitions.add(definition);
        return this;
    }

    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        addActionText.setValue(service.translate(ADD_ACTION_TEXT));
        removeActionText.setValue(service.translate(REMOVE_ACTION_TEXT));
        rendererSupplier = TabularControl::new;
        columnDefinitions
                .forEach(cd -> cd.titleProperty().setValue(service.translate(cd.getTitleKey())));
    }

    public static <V> TabularField<V> create(Collection<V> data, Supplier<V> valueSupplier) {
        return new TabularField<V>(new SimpleListProperty<>(FXCollections.observableArrayList(data)), new SimpleListProperty<>(FXCollections.observableArrayList(data)), valueSupplier);
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
