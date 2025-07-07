package fr.civipol.civilio.form.field;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.entity.InventoryEntry;
import fr.civipol.civilio.form.control.fosa.InventoryControl;
import javafx.beans.property.ListProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;

import java.util.Collection;
import java.util.List;

public class InventoryField extends DataField<ListProperty<InventoryEntry>, List<InventoryEntry>, InventoryField> {
    private static final String NAME_LABEL = "controls.inventory.columns.equipment";
    private static final String QUANTITY_LABEL = "controls.inventory.columns.quantity";
    private static final String ADD_ROW_LABEL = "controls.stats_collector.actions.add_new";
    private static final String REMOVE_SELECTION_LABEL = "controls.stats_collector.actions.remove_selection";
    private final StringProperty nameLabel, quantityLabel, addRowLabel, removeSelectionLabel;

    protected InventoryField(ListProperty<InventoryEntry> valueProperty, ListProperty<InventoryEntry> persistentValueProperty) {
        super(valueProperty, persistentValueProperty);
        nameLabel = new SimpleStringProperty(this, "nameLabel", NAME_LABEL);
        quantityLabel = new SimpleStringProperty(this, "quantityLabel", QUANTITY_LABEL);
        addRowLabel = new SimpleStringProperty(this, "add-row", ADD_ROW_LABEL);
        removeSelectionLabel = new SimpleStringProperty(this, "remove-selection", REMOVE_SELECTION_LABEL);
    }

    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        nameLabel.set(service.translate(NAME_LABEL));
        quantityLabel.set(service.translate(QUANTITY_LABEL));
        addRowLabel.set(service.translate(ADD_ROW_LABEL));
        removeSelectionLabel.set(service.translate(REMOVE_SELECTION_LABEL));
    }

    public StringProperty quantityLabelProperty() {
        return quantityLabel;
    }

    public StringProperty nameLabelProperty() {
        return nameLabel;
    }

    public StringProperty removeSelectionLabelProperty() {
        return removeSelectionLabel;
    }

    public StringProperty addRowLabelProperty() {
        return addRowLabel;
    }

    public static Field<InventoryField> inventoryField(Collection<InventoryEntry> items) {
        return new InventoryField(new SimpleListProperty<>(FXCollections.observableArrayList(items)), new SimpleListProperty<>(FXCollections.observableArrayList(items)))
                .render(InventoryControl::new);
    }
}
