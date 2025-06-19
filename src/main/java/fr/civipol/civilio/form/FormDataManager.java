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

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Stream;

@SuppressWarnings("rawtypes")
public abstract class FormDataManager {
    protected final ObservableMap<String, DataUpdate> updates = FXCollections.observableHashMap();
    public static final String INDEX_FIELD = "_index";
    public static final String VALIDATION_CODE_FIELD = "q14_02_validation_code";
    private final StringProperty index = new SimpleStringProperty(this, "index"), validationCode = new SimpleStringProperty(this, "validationCode");
    protected final Function<String, ?> valueSource;
    protected final Supplier<Stream<String>> fieldSource;

    public FormDataManager(Function<String, ?> valueSource, Supplier<Stream<String>> fieldSource) {
        this.valueSource = valueSource;
        this.fieldSource = fieldSource;
    }

    public abstract ObservableBooleanValue pristine();

    public abstract Collection<DataUpdate> getPendingUpdates();

    public Property getPropertyFor(String id) {
        return switch (id) {
            case VALIDATION_CODE_FIELD -> validationCode;
            case INDEX_FIELD -> index;
            default -> null;
        };
    }

    public void resetChanges() {
        if (Platform.isFxApplicationThread()) updates.clear();
        else Platform.runLater(updates::clear);
    }

    protected Class<?> getPropertyTypeFor(String id) {
        return switch (id) {
            case VALIDATION_CODE_FIELD, INDEX_FIELD -> String.class;
            default -> null;
        };
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
                    .toList();
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
    protected void loadValue(String field, Object defaultValue) {
        final var property = getPropertyFor(field);
        if (property == null)
            return;
        final var serializedValue = valueSource.apply(field);
        final var parsedValue = deserializeValue(serializedValue, field);
        property.setValue(Optional.ofNullable(parsedValue).orElse(defaultValue));
    }

    public void loadValues() {
        loadValue(INDEX_FIELD, "");
        loadValue(VALIDATION_CODE_FIELD, "");
        trackUpdatesForField(VALIDATION_CODE_FIELD);
        trackUpdatesForField(INDEX_FIELD);
    }

//    @SuppressWarnings("unchecked")
//    public void updateValue(String id) {
//        final var property = getPropertyFor(id);
//        final var type = getPropertyTypeFor(id);
//
//        if (property == null || type == null)
//            return;
//        final var rawValue = valueSource.apply(id);
//        final var parsedValue = deserializeValue(rawValue, id);
//        Platform.runLater(() -> property.setValue(parsedValue));
//    }

    public StringProperty indexProperty() {
        return index;
    }

    public StringProperty validationCodeProperty() {
        return validationCode;
    }
}
