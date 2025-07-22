package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.form.field.Option;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
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
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;

@SuppressWarnings("rawtypes")
public abstract class FormModel {
    protected static final String DELIMITER_TOKEN_PATTERN = "[, ]";
    protected final ObservableMap<String, FieldChange> changes = FXCollections.observableHashMap();
    private final StringProperty index = new SimpleStringProperty(this, "index"), validationCode = new SimpleStringProperty(this, "validationCode");
    protected final Function<String, ?> valueSource;

    public FormModel(
            Function<String, ?> valueSource,
            BiFunction<String, Integer, String> keyMaker,
            Function<String, String> keyExtractor
    ) {
        this.valueSource = valueSource;
        this.keyMaker = keyMaker;
        this.keyExtractor = keyExtractor;
    }

    public ObservableBooleanValue pristine() {
        return Bindings.isEmpty(changes);
    }

    public Collection<FieldChange> getPendingUpdates() {
        final var allChanges = changes.values().stream()
                .peek(u -> u.setNewValue(serializeValue(u.getNewValue())))
                .peek(u -> u.setField(keyExtractor.apply(u.getField())))
                .toList();
        final var deletions = allChanges.stream()
                .filter(FieldChange::isDeletionChange)
                .toArray(FieldChange[]::new);
        final var rest = allChanges.stream()
                .filter(fc -> !fc.isDeletionChange())
                .toArray(FieldChange[]::new);
        final var sortedChanges = new FieldChange[deletions.length + rest.length];
        System.arraycopy(deletions, 0, sortedChanges, 0, deletions.length);
        System.arraycopy(rest, 0, sortedChanges, deletions.length, rest.length);

        return Arrays.asList(sortedChanges);
    }

    public abstract void loadInitialOptions();

    public abstract void trackFieldChanges();

    /**
     * Extracts field names from map keys
     */
    protected final BiFunction<String, Integer, String> keyMaker;
    protected final Function<String, String> keyExtractor;

    /**
     * Retrieves the form-specific key which points to its index code field.
     * Classes implementing this class must provide an implementation for this.
     *
     * @return The key which points to the index code field.
     */
    public abstract String getIndexFieldKey();

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
        Runnable f = () -> {
            loadValues();
            markAsPristine();
        };
        if (Platform.isFxApplicationThread()) f.run();
        else Platform.runLater(f);
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

    @SuppressWarnings("unchecked")
    protected Object deserializeValue(Object raw, String id) {
        if (Optional.ofNullable(getPropertyTypeFor(id)).filter(LocalDate.class::equals).isPresent()) {
            if (raw instanceof String s)
                return LocalDate.parse(s);
            else if (raw instanceof Date)
                return LocalDate.ofInstant(((Date) raw).toInstant(), ZoneId.systemDefault());
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(Option.class::equals).isPresent()
                   && raw instanceof String)
            return getOptionsFor(id).stream()
                    .filter(o -> o.value().equals(raw))
                    .findFirst().orElse(null);
        else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(Boolean.class::equals).isPresent()) {
            if (raw instanceof String && ((String) raw).equalsIgnoreCase("true")
                || raw instanceof String && "false".equalsIgnoreCase(((String) raw))) {
                return Boolean.valueOf(((String) raw));
            } else if (("1".equals(raw) || "2".equals(raw)))
                return "1".equals(raw);
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(Double.class::equals).isPresent()) {
            if (raw instanceof String && StringUtils.isNotBlank(((String) raw)))
                return Double.valueOf(((String) raw));
            else if (raw instanceof Double || raw instanceof Integer) {
                return Double.valueOf(String.valueOf(raw));
            } else
                return 0.0;
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(Integer.class::equals).isPresent()) {
            if (raw instanceof String s && StringUtils.isNotBlank(s))
                return Double.valueOf(Math.max(Integer.parseInt(s), 0.0)).intValue();
            else if (raw instanceof Double d)
                return d.intValue();
            else
                return 0;
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(GeoPoint.class::equals).isPresent()) {
            if (raw instanceof String s) {
                final var segments = s.split(DELIMITER_TOKEN_PATTERN);
                final var lat = segments[0];
                final var lon = segments[1];
                final var altitude = segments[2];
                final var accuracy = segments[3];

                return GeoPoint.builder()
                        .latitude(Float.valueOf(lat))
                        .longitude(Float.valueOf(lon))
                        .altitude(Float.valueOf(altitude))
                        .accuracy(Float.valueOf(accuracy))
                        .build();
            }
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(String.class::equals).isPresent()) {
            return StringUtils.isNotBlank(((String) raw)) ? (String) raw : "";
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(List.class::equals).isPresent()) {
            if (raw instanceof Collection c)
                return c.stream()
                        .map(o -> {
                            if (o instanceof String) {
                                return getOptionsFor(id).stream()
                                        .filter(opt -> opt.value().equals(o))
                                        .findFirst().orElse(null);
                            }
                            return o;
                        })
                        .toList();
            else if (raw instanceof String s) {
                final var values = Arrays.asList(s.split(DELIMITER_TOKEN_PATTERN));
                final var x = getOptionsFor(id).stream()
                        .filter(o -> values.stream().anyMatch(ss -> o.value().equals(ss)))
                        .toList();
                final var property = (ListProperty) getPropertyFor(id);
                property.addAll(x);
                return property.getValue();
            }
        }

        return raw;
    }

    public abstract ListProperty<Option> getOptionsFor(String field);

    @SuppressWarnings({"rawtypes", "unchecked"})
    protected void trackUpdatesForField(String field) {
        final var property = getPropertyFor(field);
        if (property instanceof ListProperty l) {
            final var initialValue = List.copyOf(l);
            l.addListener((ListChangeListener) c -> {
                final var entry = changes.computeIfAbsent(field, k -> new FieldChange(k, null, initialValue, 0, false));
                while (c.next()) {
                    entry.setNewValue(List.copyOf(l));
                }
            });
        } else
            property.addListener((ob, ov, nv) -> {
                final var updatesEntry = changes.computeIfAbsent(field, k -> new FieldChange(k, nv, ov, 0, false));
                updatesEntry.setNewValue(nv);

                if (Objects.equals(nv, updatesEntry.getOldValue()))
                    changes.remove(field);
            });
    }

    @SuppressWarnings("unchecked")
    protected void loadValue(String key, Object defaultValue) {
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

    public void updateTrackedPersonnelFields(FieldChange update) {
        if (update.isDeletionChange()) {
            final var ordinal = update.getOrdinal();
            final var prefix = FieldKeys.PersonnelInfo.ALL_FIELDS[0].substring(0, FieldKeys.PersonnelInfo.ALL_FIELDS[0].indexOf("."));
            changes.values().stream()
                    .filter(c -> !c.isDeletionChange())
                    .filter(c -> c.getField().startsWith(prefix) && c.getField().endsWith(String.valueOf(ordinal)))
                    .forEach(fc -> changes.remove(fc.getField()));
            final var deletionKey = keyMaker.apply("%s.+".formatted(prefix), ordinal);
            changes.put(deletionKey, FieldChange.builder()
                    .field(deletionKey)
                    .deletionChange(true)
                    .build());
            return;
        }
        final var key = keyMaker.apply(update.getField(), update.getOrdinal());
        final var change = changes.computeIfAbsent(key, k -> new FieldChange(k, null, update.getOldValue(), update.getOrdinal(), false));
        change.setNewValue(update.getNewValue());
        if (Objects.equals(change.getNewValue(), change.getOldValue()))
            changes.remove(key);
    }

    public void markAsPristine() {
        this.changes.clear();
    }

    public StringProperty indexProperty() {
        return index;
    }

    public StringProperty validationCodeProperty() {
        return validationCode;
    }
}
