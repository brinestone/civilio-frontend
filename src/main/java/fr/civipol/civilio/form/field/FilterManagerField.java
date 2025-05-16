package fr.civipol.civilio.form.field;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.structure.Field;
import fr.civipol.civilio.domain.filter.FilterManager;
import fr.civipol.civilio.form.control.filter.FilterControl;
import fr.civipol.civilio.form.control.filter.SortingControl;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import lombok.Getter;

import java.util.Collection;
import java.util.Collections;
import java.util.ResourceBundle;
import java.util.function.Function;

public class FilterManagerField extends DataField<ObjectProperty<FilterManager>, FilterManager, FilterManagerField> {

    public record Option(String label, Object value) {
    }

    @Getter
    private final ResourceBundle resourceBundle;
    @Getter
    private final Function<String, Collection<Option>> optionSource;

    protected FilterManagerField(
            Function<String, Collection<Option>> optionSource,
            ResourceBundle resources,
            ObjectProperty<FilterManager> valueProperty,
            ObjectProperty<FilterManager> persistentValueProperty
    ) {
        super(valueProperty, persistentValueProperty);
        resourceBundle = resources;
        this.optionSource = optionSource;
    }

    public static Field<FilterManagerField> conditionsField(
            ResourceBundle resources,
            FilterManager condition,
            Function<String, Collection<Option>> optionSource
    ) {
        return new FilterManagerField(optionSource, resources, new SimpleObjectProperty<>(condition), new SimpleObjectProperty<>(condition))
                .render(new FilterControl());
    }

    public static Field<FilterManagerField> sortingField(
            FilterManager manager
    ) {
        return new FilterManagerField(__ -> Collections.emptyList(), null, new SimpleObjectProperty<>(manager), new SimpleObjectProperty<>(manager))
                .render(new SortingControl());
    }
}
