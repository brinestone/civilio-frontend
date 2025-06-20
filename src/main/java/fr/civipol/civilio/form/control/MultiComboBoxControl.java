package fr.civipol.civilio.form.control;

import com.dlsc.formsfx.model.structure.MultiSelectionField;
import com.dlsc.formsfx.view.controls.SimpleControl;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.collections.ListChangeListener;
import javafx.scene.control.Label;
import javafx.util.StringConverter;
import org.controlsfx.control.CheckComboBox;

public class MultiComboBoxControl<V> extends SimpleControl<MultiSelectionField<V>> {
    private boolean updatesFromComboBox = false;
    private boolean updatesFromField = false;
    private CheckComboBox<V> comboBox;
    private Label fieldLabel;
    private final ObjectProperty<StringConverter<V>> converter = new SimpleObjectProperty<>(this, "converter");

    public MultiComboBoxControl(StringConverter<V> converter) {
        super();
        setConverter(converter);
    }

    public void setConverter(StringConverter<V> converter) {
        this.converter.setValue(converter);
    }

    @Override
    public void layoutParts() {
        super.layoutParts();
        comboBox.setPrefWidth(USE_COMPUTED_SIZE);
        add(fieldLabel, 0, 0, 2, 1);
        add(comboBox, 2, 0, REMAINING, 1);
        setHgap(5.0);
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        fieldLabel.textProperty().bind(field.labelProperty());
        comboBox.converterProperty().bind(converter);
        comboBox.disableProperty().bind(field.editableProperty().not());
//        field.selectionProperty().bindContentBidirectional(comboBox.getCheckModel().getCheckedItems());
    }

    @Override
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        field.itemsProperty().addListener((ListChangeListener<V>) c -> comboBox.getItems().setAll(field.itemsProperty().getValue()));
        comboBox.getCheckModel().getCheckedItems().addListener((ListChangeListener<V>) c -> {
            if (updatesFromField) return;
            updatesFromComboBox = true;
            while (c.next()) {
                if (c.wasAdded()) field.selectionProperty().addAll(c.getAddedSubList());
                else if (c.wasRemoved()) field.selectionProperty().removeAll(c.getRemoved());
            }
            updatesFromComboBox = false;
        });
        field.selectionProperty().addListener((ListChangeListener<V>) c -> {
            if (updatesFromComboBox) return;
            updatesFromField = true;
            while (c.next()) {
                if (c.wasAdded()) c.getAddedSubList().forEach(comboBox.getCheckModel()::check);
                else if (c.wasRemoved()) c.getRemoved().forEach(comboBox.getCheckModel()::toggleCheckState);
            }
            updatesFromField = false;
        });
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        comboBox = new CheckComboBox<>();
        fieldLabel = new Label();
    }

    @SuppressWarnings("unchecked")
    @Override
    public void initializeParts() {
        super.initializeParts();
        comboBox.getItems().setAll(field.getItems());
        field.getSelection().forEach(comboBox.getCheckModel()::check);
    }
}
