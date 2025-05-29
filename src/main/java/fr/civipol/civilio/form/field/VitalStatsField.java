package fr.civipol.civilio.form.field;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.entity.VitalCSCStat;
import fr.civipol.civilio.form.control.fosa.VitalStatsControl;
import javafx.beans.property.ListProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;

import java.util.Collection;
import java.util.List;

public class VitalStatsField extends DataField<ListProperty<VitalCSCStat>, List<VitalCSCStat>, VitalStatsField> {
    private final StringProperty yearColumnLabel;
    private final StringProperty deathsColumnLabel;
    private final StringProperty birthsColumnLabel;
    private final StringProperty observationsColumnLabel;
    private final StringProperty addRowLabel;
    private final StringProperty removeSelectionLabel;
    private static final String YEAR_COLUMN_LABEL = "controls.stats_collector.columns.year";
    private static final String DEATHS_COLUMN_LABEL = "controls.stats_collector.columns.deaths";
    private static final String BIRTHS_COLUMN_LABEL = "controls.stats_collector.columns.births";
    private static final String OBSERVATIONS_COLUMN_LABEL = "controls.stats_collector.columns.observation";
    private static final String ADD_ROW_LABEL = "controls.stats_collector.columns.add_new";
    private static final String REMOVE_SELECTION_LABEL = "controls.stats_collector.actions.remove_selection";

    protected VitalStatsField(ListProperty<VitalCSCStat> valueProperty, ListProperty<VitalCSCStat> persistentValueProperty) {
        super(valueProperty, persistentValueProperty);
        yearColumnLabel = new SimpleStringProperty(this, "year", YEAR_COLUMN_LABEL);
        deathsColumnLabel = new SimpleStringProperty(this, "deaths", DEATHS_COLUMN_LABEL);
        birthsColumnLabel = new SimpleStringProperty(this, "births", BIRTHS_COLUMN_LABEL);
        observationsColumnLabel = new SimpleStringProperty(this, "observations", OBSERVATIONS_COLUMN_LABEL);
        addRowLabel = new SimpleStringProperty(this, "add-row", ADD_ROW_LABEL);
        removeSelectionLabel = new SimpleStringProperty(this, "remove-selection", REMOVE_SELECTION_LABEL);
    }

    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        removeSelectionLabel.set(service.translate(REMOVE_SELECTION_LABEL));
        yearColumnLabel.set(service.translate(YEAR_COLUMN_LABEL));
        deathsColumnLabel.set(service.translate(DEATHS_COLUMN_LABEL));
        birthsColumnLabel.set(service.translate(BIRTHS_COLUMN_LABEL));
        observationsColumnLabel.set(service.translate(OBSERVATIONS_COLUMN_LABEL));
        addRowLabel.set(service.translate(ADD_ROW_LABEL));
    }

    public StringProperty removeSelectionLabelProperty() {
        return removeSelectionLabel;
    }

    public StringProperty addRowLabelProperty() {
        return addRowLabel;
    }

    public StringProperty observationsColumnLabelProperty() {
        return observationsColumnLabel;
    }

    public StringProperty birthsColumnLabelProperty() {
        return birthsColumnLabel;
    }

    public StringProperty deathsColumnLabelProperty() {
        return deathsColumnLabel;
    }

    public StringProperty yearColumnLabelProperty() {
        return yearColumnLabel;
    }

    public static Field<VitalStatsField> statsField(Collection<VitalCSCStat> items, ListProperty<VitalCSCStat> target) {
        return new VitalStatsField(new SimpleListProperty<>(FXCollections.observableArrayList(items)), target)
                .render(VitalStatsControl::new);
    }
}
