package fr.civipol.civilio.domain.viewmodel;

import fr.civipol.civilio.entity.VitalCSCStat;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleObjectProperty;
import lombok.Getter;

public class FOSAVitalCSCStatViewModel {
    private final ObjectProperty<String> observations;
    private final ObjectProperty<Integer> deathCount, birthCount, year;
    private final BooleanProperty selected;
    @Getter
    private final VitalCSCStat stat;

    public FOSAVitalCSCStatViewModel(VitalCSCStat stat) {
        this.stat = stat;
        this.selected = new SimpleBooleanProperty(this, "selected", false);
        observations = new SimpleObjectProperty<>(stat, "observations", stat.getObservations());
        year = new SimpleObjectProperty<>(stat, "year", stat.getYear());
        birthCount = new SimpleObjectProperty<>(stat, "registeredBirths", stat.getRegisteredBirths());
        deathCount = new SimpleObjectProperty<>(stat, "registeredDeaths", stat.getRegisteredDeaths());

        observations.addListener((ob, ov, nv) -> stat.setObservations(nv));
        year.addListener((ob, ov, nv) -> stat.setYear(nv));
        birthCount.addListener((ob, ov, nv) -> stat.setRegisteredBirths(nv));
        deathCount.addListener((ob, ov, nv) -> stat.setRegisteredDeaths(nv));
    }

    public Integer getYear() {
        return year.get();
    }

    public boolean isSelected() {
        return selected.get();
    }

    public BooleanProperty selectedProperty() {
        return selected;
    }

    public void setSelected(boolean value) {
        this.selected.set(value);
    }

    public void setBirthCount(Integer value) {
        birthCount.setValue(value);
    }

    public void setObservations(String value) {
        observations.setValue(value);
    }

    public void setYear(Integer value) {
        year.setValue(value);
    }

    public void setDeathCount(Integer value) {
        deathCount.setValue(value);
    }

    public ObjectProperty<Integer> deathCountProperty() {
        return deathCount;
    }

    public ObjectProperty<Integer> birthCountProperty() {
        return birthCount;
    }

    public ObjectProperty<String> observationsProperty() {
        return observations;
    }

    public ObjectProperty<Integer> yearProperty() {
        return year;
    }
}
