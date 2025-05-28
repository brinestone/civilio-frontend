package fr.civipol.civilio.form.control;

import com.dlsc.formsfx.model.structure.MultiSelectionField;
import com.dlsc.formsfx.view.controls.SimpleControl;
import javafx.beans.binding.Bindings;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.collections.ListChangeListener;
import javafx.scene.control.Label;
import javafx.util.StringConverter;
import org.controlsfx.control.CheckComboBox;

public class MultiComboBoxControl<V> extends SimpleControl<MultiSelectionField<V>> {
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
    public void initializeParts() {
        super.initializeParts();
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
        field.selectionProperty().bind(Bindings.createObjectBinding(() -> comboBox.getCheckModel().getCheckedItems(),
                comboBox.getCheckModel().getCheckedItems()));
        comboBox.converterProperty().bind(converter);
    }

    @Override
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        field.itemsProperty().addListener((ListChangeListener<V>) c -> comboBox.getItems().setAll(field.itemsProperty().get()));
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        comboBox = new CheckComboBox<>();
        fieldLabel = new Label();
    }

}
