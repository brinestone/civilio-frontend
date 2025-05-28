package fr.civipol.civilio.form;

import javafx.application.Platform;
import javafx.beans.property.Property;

import java.util.function.Function;

@SuppressWarnings("rawtypes")
public abstract class FormModel {
    protected final Function<String, ?> valueSource;

    public FormModel(Function<String, ?> valueSource) {
        this.valueSource = valueSource;
    }

    public abstract Property getPropertyFor(String id);

    protected abstract Class<?> getPropertyTypeFor(String id);

    protected abstract Object parseValue(Object raw, String id);

    @SuppressWarnings("unchecked")
    public void updateValue(String id) {
        final var property = getPropertyFor(id);
        final var type = getPropertyTypeFor(id);

        if (property == null || type == null) return;
        final var rawValue = valueSource.apply(id);
        final var parsedValue = parseValue(rawValue, id);
        final var castedValue = type.cast(parsedValue);
        Platform.runLater(() -> property.setValue(castedValue));
    }
}
