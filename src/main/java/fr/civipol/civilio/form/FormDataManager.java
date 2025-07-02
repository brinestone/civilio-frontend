package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.DataUpdate;
import fr.civipol.civilio.form.field.Option;
import javafx.application.Platform;
import javafx.beans.property.ListProperty;
import javafx.beans.property.Property;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.beans.value.ObservableBooleanValue;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableMap;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@SuppressWarnings("rawtypes")
public abstract class FormDataManager {
    protected final ObservableMap<String, DataUpdate> updates = FXCollections.observableHashMap();
    private final StringProperty index = new SimpleStringProperty(this, "index"), validationCode = new SimpleStringProperty(this, "validationCode");
    protected final Function<String, ?> valueSource;

    public FormDataManager(Function<String, ?> valueSource, Function<String, String> fieldExtractor) {
        this.valueSource = valueSource;
        this.fieldExtractor = fieldExtractor;
    }

    public abstract ObservableBooleanValue pristine();

    public abstract Collection<DataUpdate> getPendingUpdates();

    public abstract void trackFieldChanges();

    /**
     * Extracts field names from map keys
     */
    protected final Function<String, String> fieldExtractor;

    /**
     * Retrieves the form-specific key which points to its index code field.
     * Classes implementing this class must provide an implementation for this.
     *
     * @return The key which points to the index code field.
     */
    protected abstract String getIndexFieldKey();

    /**
     * Retrieves the form-specific key which points to its validation code field.
     * Classes implementing this class must provide an implementation for this.
     *
     * @return The key which points to the validation code field.
     */
    protected abstract String getValidationCodeFieldKey();

    public Property getPropertyFor(String id) {
        if (id.equals(getIndexFieldKey())) return index;
        else if (id.equals(getValidationCodeFieldKey())) return validationCode;
        return null;
    }

    public void resetChanges() {
        if (Platform.isFxApplicationThread()) updates.clear();
        else Platform.runLater(updates::clear);
    }

    protected Class<?> getPropertyTypeFor(String id) {
        return Optional.ofNullable(id)
                .filter(StringUtils::isNotBlank)
                .map(s -> {
                    if (s.equals(getIndexFieldKey()) || s.equals(getValidationCodeFieldKey())) return String.class;
                    return null;
                }).orElse(null);
    }

    @SuppressWarnings("unchecked")
    protected Object serializeValue(Object deserialized) {
        if (deserialized instanceof LocalDate l) {
            return Date.from(l.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
        } else if (deserialized instanceof Option o) {
            final var value = o.value();
            return serializeValue(value);
        } else if (deserialized instanceof Collection c) {
            return c.stream()
                    .map(this::serializeValue)
                    .map(String::valueOf)
                    .collect(Collectors.joining(" "));
        } else if (deserialized instanceof Boolean b)
            return b ? "1" : "2";
        else if (deserialized == null) return null;
        return String.valueOf(deserialized);
    }

    protected abstract Object deserializeValue(Object raw, String id);

    public abstract void loadOptions(OptionSource optionSource, Runnable callback);

    @SuppressWarnings({"rawtypes", "unchecked"})
    protected void trackUpdatesForField(String field) {
        final var property = getPropertyFor(field);
        if (property instanceof ListProperty l) {
            final var initialValue = List.copyOf(l);
            l.addListener((ListChangeListener) c -> {
                final var entry = updates.computeIfAbsent(field, k -> new DataUpdate(k, null, initialValue));
                while (c.next()) {
                    entry.setNewValue(List.copyOf(l));
                }
                if (Objects.equals(entry.getNewValue(), entry.getOldValue()))
                    updates.remove(field);
            });
        } else
            property.addListener((ob, ov, nv) -> {
                final var updatesEntry = updates.computeIfAbsent(field, k -> new DataUpdate(k, nv, ov));
                updatesEntry.setNewValue(nv);

                if (Objects.equals(nv, updatesEntry.getOldValue()))
                    updates.remove(field);
            });
    }

    @SuppressWarnings("unchecked")
    protected void loadValue(String key, Object defaultValue) {
        final var field = fieldExtractor.apply(key);
        final var property = getPropertyFor(key);
        if (property == null)
            return;
        final var serializedValue = valueSource.apply(key);
        final var parsedValue = deserializeValue(serializedValue, key);
        property.setValue(Optional.ofNullable(parsedValue).orElse(defaultValue));
    }

    public void loadValues() {
        loadValue(getIndexFieldKey(), "");
        loadValue(getValidationCodeFieldKey(), "");
        trackUpdatesForField(getIndexFieldKey());
        trackUpdatesForField(getValidationCodeFieldKey());
    }

    public StringProperty indexProperty() {
        return index;
    }

    public StringProperty validationCodeProperty() {
        return validationCode;
    }
}
