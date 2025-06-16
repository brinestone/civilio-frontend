package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.UpdateSpec;
import javafx.application.Platform;
import javafx.beans.property.Property;
import javafx.beans.value.ObservableBooleanValue;

import java.util.Collection;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Stream;

@SuppressWarnings("rawtypes")
public abstract class FormDataManager {
    protected final Function<String, ?> valueSource;
    protected final Supplier<Stream<String>> fieldSource;

    public FormDataManager(Function<String, ?> valueSource, Supplier<Stream<String>> fieldSource) {
        this.valueSource = valueSource;
        this.fieldSource = fieldSource;
    }

    public abstract ObservableBooleanValue pristine();

    public abstract Collection<UpdateSpec> getPendingUpdates();

    public abstract Property getPropertyFor(String id);

    protected abstract Class<?> getPropertyTypeFor(String id);

    protected abstract Object deserializeValue(Object raw, String id);

    protected abstract Object serializeValue(Object deserialized);

    public abstract void loadOptions(OptionSource optionSource, Runnable callback);

    public abstract void loadValues();

    @SuppressWarnings("unchecked")
    public void updateValue(String id) {
        final var property = getPropertyFor(id);
        final var type = getPropertyTypeFor(id);

        if (property == null || type == null)
            return;
        final var rawValue = valueSource.apply(id);
        final var parsedValue = deserializeValue(rawValue, id);
        Platform.runLater(() -> property.setValue(parsedValue));
    }
}
