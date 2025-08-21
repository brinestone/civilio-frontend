package fr.civipol.civilio.form.control;

import com.dlsc.formsfx.model.structure.MultiSelectionField;
import com.dlsc.formsfx.view.controls.SimpleControl;
import javafx.beans.binding.Bindings;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.collections.ListChangeListener;
import javafx.geometry.VPos;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.GridPane;
import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.CheckComboBox;

import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public class MultiComboBoxControl<V> extends SimpleControl<MultiSelectionField<V>> {
    private Tooltip tooltip;
    private boolean updatesFromComboBox = false;
    private boolean updatesFromField = false;
    private CheckComboBox<V> comboBox;
    private Label fieldLabel;
    private Label readonlyLabel;
    private final ObjectProperty<StringConverter<V>> converter = new SimpleObjectProperty<>(this, "converter");

    public MultiComboBoxControl(Function<MultiSelectionField<V>, StringConverter<V>> converterProvider) {
        super();
        setConverter(converterProvider.apply(field));
    }

    public void setConverter(StringConverter<V> converter) {
        this.converter.setValue(converter);
    }

    @Override
    public void layoutParts() {
        super.layoutParts();
        final var columns = field.getSpan();
        int fieldLabelColSpan = 2;
        int controlRowIndex = 0;
        int controlRowSpan = 1;
        int controlColIndex = 2;
        int controlColSpan = columns - fieldLabelColSpan;
        if (field.isBlockLabel()) {
            fieldLabelColSpan = columns;
            controlColIndex = 0;
            controlRowIndex = 1;
            controlColSpan = columns;
        }

        Node valueDescription = field.getValueDescription();
        Node labelDescription = field.getLabelDescription();

        add(fieldLabel, 0, 0, fieldLabelColSpan, 1);
        if (labelDescription != null) {
            GridPane.setValignment(labelDescription, VPos.TOP);
            add(labelDescription, 0, 1, fieldLabelColSpan, 1);
            controlRowIndex = 2;
        }
        add(comboBox, controlColIndex, controlRowIndex, controlColSpan, controlRowSpan);
        GridPane.setFillWidth(comboBox, true);
        add(readonlyLabel, controlColIndex, controlRowIndex, controlColSpan, controlRowSpan);
        if (valueDescription != null) {
            GridPane.setValignment(valueDescription, VPos.TOP);
            add(valueDescription, controlColIndex, controlRowIndex + controlRowSpan, controlColSpan, 1);
        }
        comboBox.setMaxWidth(Double.MAX_VALUE);
        setHgap(5.0);
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        fieldLabel.textProperty().bind(field.labelProperty());
        comboBox.converterProperty().bind(converter);
        comboBox.visibleProperty().bind(field.editableProperty());
        tooltip.textProperty().bind(Bindings.when(field.validProperty()).then(field.tooltipProperty()).otherwise(Bindings.createStringBinding(() -> String.join("\n", field.getErrorMessages()), field.errorMessagesProperty())));
//        final var defaultLabelStyle = fieldLabel.getStyle();
//        fieldLabel.styleProperty().bind(Bindings.when(field.validProperty()).then(defaultLabelStyle).otherwise("""
//                -fx-text-fill: red;
//                """));
        readonlyLabel.textProperty().bind(Bindings.createStringBinding(() -> comboBox.getCheckModel().getCheckedItems().stream()
                .map(comboBox.getConverter()::toString)
                .collect(Collectors.joining(", ")), comboBox.getCheckModel().getCheckedItems()));
        readonlyLabel.visibleProperty().bind(field.editableProperty().not());
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
        tooltip = new Tooltip();
        fieldLabel = new Label();
        readonlyLabel = new Label();
    }

    @SuppressWarnings("unchecked")
    @Override
    public void initializeParts() {
        super.initializeParts();
        getStyleClass().add("simple-select-control");
        comboBox.getItems().setAll(field.getItems());
        field.getSelection().forEach(comboBox.getCheckModel()::check);
        updateTooltip();
    }

    private void updateTooltip() {
        Optional.ofNullable(field.getTooltip()).filter(StringUtils::isNotBlank).ifPresentOrElse(
                t -> {
                    tooltip.setText(t);
                    comboBox.setTooltip(tooltip);
                }, () -> comboBox.setTooltip(null)
        );
    }
}
