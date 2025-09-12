package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.domain.SubFormDataLoader;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.form.field.Option;
import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import javafx.beans.value.ObservableBooleanValue;
import javafx.collections.FXCollections;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static fr.civipol.civilio.form.FieldKeys.Chiefdom.*;

@Slf4j
@SuppressWarnings("DuplicatedCode")
public class ChefferieFormModel extends FormModel {
    private static final String[] REGION_IDS = IntStream.rangeClosed(1, 7)
            .mapToObj("%02d"::formatted)
            .toArray(String[]::new);
    private final SubFormDataLoader subFormDataLoader;
    @SuppressWarnings("rawtypes")
    private final Map<String, Property> valueProperties = new HashMap<>();
    private final Map<String, ObservableBooleanValue> bindings = new ConcurrentHashMap<>();
    private final Map<String, ListProperty<Option>> options = new HashMap<>();

    @Override
    public void loadValues() {
        super.loadValues();
        Stream.of(TRACKABLE_FIELDS)
                .forEach(f -> loadValue(f, getDefaultValueFor(f)));
        loadPersonnelInfo();
//        loadValue(RESPONDENT_NAME, "");
//        loadValue(POSITION, "");
//        loadValue(PHONE, "");
//        loadValue(EMAIL, "");
//        loadValue(QUARTER, "");
//        loadValue(EXTRA_INFO, "");
//        loadValue(FACILITY_NAME, "");
//        loadValue(OTHER_WATER_SOURCE, "");
//        loadValue(OTHER_CS_REG_LOCATION, "");
//        loadValue(OTHER_WAITING_ROOM, "");
//        loadValue(OTHER_INTERNET_TYPE, "");
//
//        loadValue(HEALTH_CENTER_PROXIMITY, 0);
//        loadValue(PC_COUNT, 0);
//        loadValue(PRINTER_COUNT, 0);
//        loadValue(TABLET_COUNT, 0);
//        loadValue(BIKE_COUNT, 0);
//        loadValue(EMPLOYEE_COUNT, 0);
//        loadValue(CAR_COUNT, 0);
//
//        loadValue(CS_OFFICER_TRAINED, false);
//        loadValue(WAITING_ROOM, false);
//        loadValue(IS_CHIEFDOM_CHIEF_RESIDENCE, false);
//        loadValue(HAS_INTERNET, false);
//        loadValue(WATER_ACCESS, false);
//        loadValue(HAS_EXTINGUISHER, false);
//        loadValue(TOILETS_ACCESSIBLE, false);
//        loadValue(HAS_ENEO_CONNECTION, false);
//        loadValue(CHIEF_OATH, false);
//
//        loadValue(GPS_COORDS, GeoPoint.builder()
//                .build());
//        loadValue(INTERNET_TYPE, FXCollections.observableArrayList());
//        loadValue(WATER_SOURCES, FXCollections.observableArrayList());
//
//        loadValue(CREATION_DATE, null);
//
//        loadOptionValue(DIVISION);
//        loadOptionValue(CS_REG_LOCATION);
//        // loadOptionValue(RECEPTION_AREA);
//        loadOptionValue(MUNICIPALITY);
//        loadOptionValue(CLASSIFICATION);
//        loadOptionValue(IS_CHIEF_CS_OFFICER);
    }

    @SuppressWarnings("unchecked")
    private void loadOptionValue(String field) {
        Optional.ofNullable(valueSource.apply(field))
                .map(String::valueOf)
                .filter(StringUtils::isNotBlank)
                .map(v -> deserializeValue(v, field))
                .ifPresent(v -> this.getPropertyFor(field).setValue(v));
    }

    private boolean fieldsTracked = false;
    private final ListProperty<Map<String, Object>> personnelInfo = new SimpleListProperty<>(
            FXCollections.observableArrayList());
    private final OptionSource optionSource;

    public ChefferieFormModel(Function<String, ?> valueSource,
                              BiFunction<String, Integer, String> keyMaker,
                              Function<String, String> keyExtractor,
                              SubFormDataLoader subFormDataLoader,
                              OptionSource optionSource) {
        super(valueSource, keyMaker, keyExtractor);
        this.subFormDataLoader = subFormDataLoader;
        this.optionSource = optionSource;
        valueProperties.put(RESPONDENT_NAME, new SimpleStringProperty());
        valueProperties.put(POSITION, new SimpleStringProperty());
        valueProperties.put(PHONE, new SimpleStringProperty());
        valueProperties.put(EMAIL, new SimpleStringProperty());
        valueProperties.put(QUARTER, new SimpleStringProperty());
        valueProperties.put(EXTRA_INFO, new SimpleStringProperty());
        valueProperties.put(FACILITY_NAME, new SimpleStringProperty());
        valueProperties.put(OTHER_WATER_SOURCE, new SimpleStringProperty());
        valueProperties.put(OTHER_CS_REG_LOCATION, new SimpleStringProperty());
        valueProperties.put(OTHER_WAITING_ROOM, new SimpleStringProperty());
        valueProperties.put(OTHER_INTERNET_TYPE, new SimpleStringProperty());
        valueProperties.put(CREATION_DATE, new SimpleObjectProperty<LocalDate>());
        valueProperties.put(DIVISION, new SimpleObjectProperty<Option>());
        valueProperties.put(CS_REG_LOCATION, new SimpleObjectProperty<Option>());
        valueProperties.put(MUNICIPALITY, new SimpleObjectProperty<Option>());
        valueProperties.put(CLASSIFICATION, new SimpleObjectProperty<Option>());
        valueProperties.put(IS_CHIEF_CS_OFFICER, new SimpleObjectProperty<Option>());
        valueProperties.put(HEALTH_CENTER_PROXIMITY, new SimpleIntegerProperty());
        valueProperties.put(PC_COUNT, new SimpleIntegerProperty());
        valueProperties.put(PRINTER_COUNT, new SimpleIntegerProperty());
        valueProperties.put(TABLET_COUNT, new SimpleIntegerProperty());
        valueProperties.put(BIKE_COUNT, new SimpleIntegerProperty());
        valueProperties.put(EMPLOYEE_COUNT, new SimpleIntegerProperty());
        valueProperties.put(CAR_COUNT, new SimpleIntegerProperty());
        valueProperties.put(CS_OFFICER_TRAINED, new SimpleBooleanProperty());
        valueProperties.put(IS_CHIEFDOM_CHIEF_RESIDENCE, new SimpleBooleanProperty());
        valueProperties.put(WAITING_ROOM, new SimpleBooleanProperty());
        valueProperties.put(HAS_INTERNET, new SimpleBooleanProperty());
        valueProperties.put(WATER_ACCESS, new SimpleBooleanProperty());
        valueProperties.put(HAS_EXTINGUISHER, new SimpleBooleanProperty());
        valueProperties.put(TOILETS_ACCESSIBLE, new SimpleBooleanProperty());
        valueProperties.put(HAS_ENEO_CONNECTION, new SimpleBooleanProperty());
        valueProperties.put(CHIEF_OATH, new SimpleBooleanProperty());
        valueProperties.put(GPS_COORDS, new SimpleObjectProperty<GeoPoint>());
        valueProperties.put(INTERNET_TYPE, new SimpleListProperty<>(FXCollections.observableArrayList()));
        valueProperties.put(WATER_SOURCES, new SimpleListProperty<>(FXCollections.observableArrayList()));

        options.put(DIVISION, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(MUNICIPALITY, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(CLASSIFICATION, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(WATER_SOURCES, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(IS_CHIEF_CS_OFFICER,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(CS_REG_LOCATION, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(INTERNET_TYPE, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(FieldKeys.PersonnelInfo.PERSONNEL_GENDER,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
    }

    @Override
    public void trackFieldChanges() {
        if (fieldsTracked) {
            log.debug("Already tracking fields, skipping.");
            return;
        }
        Stream.of(TRACKABLE_FIELDS).forEach(this::trackChangesForField);
//        trackChangesForField(RESPONDENT_NAME);
//        trackChangesForField(POSITION);
//        trackChangesForField(EMAIL);
//        trackChangesForField(CREATION_DATE);
//        trackChangesForField(DIVISION);
//        trackChangesForField(MUNICIPALITY);
//        trackChangesForField(QUARTER);
//        trackChangesForField(FACILITY_NAME);
//        trackChangesForField(CLASSIFICATION);
//        trackChangesForField(HEALTH_CENTER_PROXIMITY);
//        trackChangesForField(GPS_COORDS);
//        trackChangesForField(CS_OFFICER_TRAINED);
//        trackChangesForField(WAITING_ROOM);
//        trackChangesForField(OTHER_WAITING_ROOM);
//        trackChangesForField(IS_CHIEF_CS_OFFICER);
//        trackChangesForField(CHIEF_OATH);
//        trackChangesForField(CS_REG_LOCATION);
//        trackChangesForField(OTHER_CS_REG_LOCATION);
//        trackChangesForField(TOILETS_ACCESSIBLE);
//        trackChangesForField(PC_COUNT);
//        trackChangesForField(PRINTER_COUNT);
//        trackChangesForField(TABLET_COUNT);
//        trackChangesForField(CAR_COUNT);
//        trackChangesForField(BIKE_COUNT);
//        trackChangesForField(IS_CHIEFDOM_CHIEF_RESIDENCE);
//        trackChangesForField(HAS_INTERNET);
//        trackChangesForField(INTERNET_TYPE);
//        trackChangesForField(OTHER_INTERNET_TYPE);
//        trackChangesForField(HAS_ENEO_CONNECTION);
//        trackChangesForField(WATER_ACCESS);
//        trackChangesForField(WATER_SOURCES);
//        trackChangesForField(OTHER_WATER_SOURCE);
//        trackChangesForField(HAS_EXTINGUISHER);
//        trackChangesForField(EMPLOYEE_COUNT);
//        trackChangesForField(EXTRA_INFO);
        fieldsTracked = true;
        log.debug("Tracking field changes");
    }

    @Override
    public void loadInitialOptions() {
        options.get(DIVISION).setAll(optionSource.findOptions("division", REGION_IDS));
        options.get(MUNICIPALITY).setAll(optionSource.findOptions("commune"));
        options.get(CLASSIFICATION).setAll(optionSource.findOptions("vb2qk85"));
        options.get(WATER_SOURCES).setAll(optionSource.findOptions("zp4ec39"));
        options.get(IS_CHIEF_CS_OFFICER).setAll(optionSource.findOptions("tr2ph17"));
        options.get(CS_REG_LOCATION).setAll(optionSource.findOptions("vo6qc48"));
        options.get(INTERNET_TYPE).setAll(optionSource.findOptions("internet_types"));
        options.get(FieldKeys.PersonnelInfo.PERSONNEL_GENDER).setAll(optionSource.findOptions("xw39g10"));
        options.get(FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL).setAll(optionSource.findOptions("nz2pr56"));
        options.get(FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL).setAll(optionSource.findOptions("ta2og93"));
    }

    @Override
    public String getIndexFieldKey() {
        return INDEX;
    }

    @Override
    protected String getValidationCodeFieldKey() {
        return VALIDATION_CODE;
    }

    @Override
    protected Class<?> getPropertyTypeFor(String id) {
        return switch (id) {
            case RESPONDENT_NAME, POSITION,
                    PHONE, EMAIL, FACILITY_NAME,
                    QUARTER, OTHER_CS_REG_LOCATION,
                    OTHER_INTERNET_TYPE, OTHER_WATER_SOURCE -> String.class;
            case DIVISION, MUNICIPALITY, CLASSIFICATION,
                    IS_CHIEF_CS_OFFICER, CS_REG_LOCATION -> Option.class;
            case WATER_SOURCES, INTERNET_TYPE -> List.class;
            case CREATION_DATE -> LocalDate.class;
            case HEALTH_CENTER_PROXIMITY, PC_COUNT,
                    PRINTER_COUNT, TABLET_COUNT, BIKE_COUNT,
                    EMPLOYEE_COUNT, CAR_COUNT -> Integer.class;
            case CHIEF_OATH, HAS_ENEO_CONNECTION,
                    TOILETS_ACCESSIBLE, HAS_EXTINGUISHER,
                    WATER_ACCESS, CS_OFFICER_TRAINED,
                    WAITING_ROOM, HAS_INTERNET,
                    IS_CHIEFDOM_CHIEF_RESIDENCE -> Boolean.class;
            case GPS_COORDS -> GeoPoint.class;
            default -> super.getPropertyTypeFor(id);
        };
    }

    @Override
    public ListProperty<Option> getOptionsFor(String field) {
        return options.get(field);
    }

    @Override
    @SuppressWarnings({"rawtypes"})
    public Property getPropertyFor(String id) {
        return Optional.of(id)
                .filter(StringUtils::isNotBlank)
                .map(valueProperties::get)
                .orElse(super.getPropertyFor(id));
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue chiefIsCSOfficer() {
        final var isChiefCSOfficer = (ObjectProperty<Option>) getPropertyFor(IS_CHIEF_CS_OFFICER);
        return bindings.computeIfAbsent("%s=1 or 2".formatted(IS_CHIEF_CS_OFFICER), __ -> Bindings.createBooleanBinding(() -> Optional.ofNullable(isChiefCSOfficer.getValue())
                .map(Option::value)
                .filter(v -> "1".equals(v) || "2".equals(v))
                .isPresent(), isChiefCSOfficer));
    }

    public ObservableBooleanValue centerHasWaterAccess() {
        return (BooleanProperty) getPropertyFor(WATER_ACCESS);
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerUsesOtherCsLocation() {
        final var csRegLocationProperty = (ObjectProperty<Option>) getPropertyFor(CS_REG_LOCATION);
        final var otherCsRegLocationProperty = (StringProperty) getPropertyFor(
                OTHER_CS_REG_LOCATION);
        return bindings.computeIfAbsent("otherCsRegLocationAvailable", __ -> {
            final var binding = Bindings.createBooleanBinding(() -> Optional.ofNullable(csRegLocationProperty.getValue())
                    .map(Option::value).filter("3"::equals).isPresent(), csRegLocationProperty);
            binding.addListener((ob, ov, nv) -> {
                if (!nv)
                    otherCsRegLocationProperty.setValue(null);
            });
            return binding;
        });
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue internetTypeAvailable() {
        final var hasInternetProperty = (BooleanProperty) getPropertyFor(HAS_INTERNET);
        final var internetTypeProperty = (ListProperty<Option>) getPropertyFor(INTERNET_TYPE);

        return bindings.computeIfAbsent("internetTypeAvailable", __ -> {
            hasInternetProperty.addListener((ob, ov, nv) -> {
                if (!nv)
                    internetTypeProperty.clear();
            });
            return hasInternetProperty;
        });
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerUsesOtherWaterSource() {
        final var waterSourcesProperty = (ListProperty<Option>) getPropertyFor(WATER_SOURCES);
        final var otherWaterSourceProperty = (StringProperty) getPropertyFor(OTHER_WATER_SOURCE);

        return bindings.computeIfAbsent("centerUsesOtherWaterSource", __ -> {
            final var b = Bindings.createBooleanBinding(() -> Optional.ofNullable(waterSourcesProperty.getValue())
                            .filter(l -> l.stream().anyMatch(o -> "6".equals(o.value())))
                            .isPresent(),
                    waterSourcesProperty);
            b.addListener((ob, ov, nv) -> {
                if (!nv) {
                    otherWaterSourceProperty.setValue(null);
                }
            });
            return b;
        });
    }

    @SuppressWarnings("unchecked")
    public void updateGeoPointUpdates() {
        final var geoPointProperty = (ObjectProperty<GeoPoint>) getPropertyFor(GPS_COORDS);
        final var entry = changes.computeIfAbsent(FieldKeys.Fosa.GEO_POINT,
                k -> new FieldChange(k, null, geoPointProperty.getValue(), 0, false));
        entry.setNewValue(geoPointProperty.getValue());
    }

    private void loadPersonnelInfo() {
        var records = subFormDataLoader.loadSubFormData(FieldKeys.PersonnelInfo.ALL_FIELDS);
        deserializeSubFormValues(records, personnelInfo);
    }

    public ListProperty<Map<String, Object>> getPersonnelData() {
        return personnelInfo;
    }

    @SuppressWarnings("unchecked")
    public <V> Property<V> providePersonnelInfoFieldProperty(String fieldKey, int ordinal) {
        return provideSubFormDataProperty(personnelInfo.get(ordinal), fieldKey, ordinal, (V) getDefaultValueFor(fieldKey));
    }

    @SuppressWarnings("unchecked")
    private <V> Property<V> provideSubFormDataProperty(Map<String, Object> dataGroup, String fieldKey, int ordinal, V defaultValue) {
        final var uniqueKey = keyMaker.apply(fieldKey, ordinal);
        if (!valueProperties.containsKey(uniqueKey)) {
            final var property = createValueProperty(fieldKey);
            valueProperties.put(uniqueKey, property);
            property.setValue(Optional.ofNullable(dataGroup.get(fieldKey)).orElse(defaultValue));
            trackChangesForField(uniqueKey);
            return property;
        } else {
            changes.remove(uniqueKey);
            return valueProperties.get(uniqueKey);
        }
    }
}
