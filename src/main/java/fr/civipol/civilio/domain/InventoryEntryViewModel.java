package fr.civipol.civilio.domain;

import fr.civipol.civilio.entity.InventoryEntry;
import javafx.beans.property.*;
import lombok.Getter;

public class InventoryEntryViewModel {
    @Getter
    private final InventoryEntry entry;
    private final StringProperty equipmentName;
    private final ObjectProperty<Integer> quantity;
    private final BooleanProperty selected;

    public InventoryEntryViewModel(InventoryEntry entry) {
        this.entry = entry;
        equipmentName = new SimpleStringProperty(entry, "equipmentName", entry.getEquipmentName());
        selected = new SimpleBooleanProperty(this, "selected", false);
        quantity = new SimpleObjectProperty<>(this, "quantity", entry.getQuantity());

        equipmentName.addListener((ob, ov, nv) -> entry.setEquipmentName(nv));
        quantity.addListener((ob, ov, nv) -> entry.setQuantity(nv));
    }

    public void setQuantity(Integer value) {
        quantity.set(value);
    }

    public void setEquipmentName(String name) {
        equipmentName.setValue(name);
    }

    public void setSelected(Boolean value) {
        selected.setValue(value);
    }

    public boolean isSelected() {
        return selected.get();
    }

    public BooleanProperty selectedProperty() {
        return selected;
    }

    public ObjectProperty<Integer> quantityProperty() {
        return quantity;
    }

    public StringProperty equipmentNameProperty() {
        return equipmentName;
    }
}
