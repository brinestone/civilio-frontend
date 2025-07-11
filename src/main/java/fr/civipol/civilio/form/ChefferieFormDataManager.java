package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.field.Option;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import javafx.beans.value.ObservableBooleanValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

import static fr.civipol.civilio.form.FieldKeys.Chefferie.*;

@SuppressWarnings("DuplicatedCode")
public class ChefferieFormDataManager extends FormDataManager {
    private static final String FORM_ID = "aPjiVm748hUWJnpF4pqKjY";
    private final Map<String, Property<?>> valueProperties = new HashMap<>();
    private final Map<String, ListProperty<Option>> options = new HashMap<>();

    @Override
    public void loadValues() {
        super.loadValues();
        loadPersonnelInfo();
        loadValue(RESPONDENT_NAME, "");
        loadValue(POSITION, "");
        loadValue(PHONE, "");
        loadValue(EMAIL, "");
        loadValue(QUARTER, "");
        loadValue(EXTRA_INFO, "");
        loadValue(FACILITY_NAME, "");
        loadValue(OTHER_WATER_SOURCE, "");
        loadValue(OTHER_CS_REG_LOCATION, "");
        loadValue(OTHER_WAITING_ROOM, "");
        loadValue(OTHER_INTERNET_TYPE, "");
        // loadValue(OTHER_RECEPTION_AREA, "");

        loadValue(HEALTH_CENTER_PROXIMITY, 0);
        loadValue(PC_COUNT, 0);
        loadValue(PRINTER_COUNT, 0);
        loadValue(TABLET_COUNT, 0);
        loadValue(BIKE_COUNT, 0);
        loadValue(EMPLOYEE_COUNT, 0);
        loadValue(CAR_COUNT, 0);

        loadValue(CS_OFFICER_TRAINED, false);
        loadValue(WAITING_ROOM, false);
        loadValue(IS_CHIEFDOM_CHIEF_RESIDENCE, false);
        loadValue(HAS_INTERNET, false);
        loadValue(WATER_ACCESS, false);
        loadValue(HAS_EXTINGUISHER, false);
        loadValue(TOILETS_ACCESSIBLE, false);
        loadValue(HAS_ENEO_CONNECTION, false);
        loadValue(CHIEF_OATH, false);

        loadValue(GPS_COORDS, GeoPoint.builder()
                .build());
        loadValue(INTERNET_TYPE, FXCollections.observableArrayList());
        loadValue(WATER_SOURCES, FXCollections.observableArrayList());

        loadValue(CREATION_DATE, null);

        loadOptionValue(DIVISION);
        loadOptionValue(CS_REG_LOCATION);
        // loadOptionValue(RECEPTION_AREA);
        loadOptionValue(MUNICIPALITY);
        loadOptionValue(CLASSIFICATION);
        loadOptionValue(IS_CHIEF_CS_OFFICER);
    }

    @SuppressWarnings("unchecked")
    private void loadOptionValue(String field) {
        Optional.ofNullable(valueSource.apply(field))
                .map(String::valueOf)
                .filter(StringUtils::isNotBlank)
                .map(v -> deserializeValue(v, field))
                .ifPresent(v -> this.getPropertyFor(field).setValue(v));
    }

    private boolean optionsLoaded = false, fieldsTracked = false;
    private final ListProperty<PersonnelInfo> personnelInfo = new SimpleListProperty<>(
            FXCollections.observableArrayList());
    private final Supplier<Collection<PersonnelInfo>> personnelInfoSupplier;

    public ChefferieFormDataManager(Function<String, ?> valueSource,
            BiFunction<String, Integer, String> keyMaker,
            Function<String, String> keyExtractor, Supplier<Collection<PersonnelInfo>> personnelInfoSupplier) {
        super(valueSource, keyMaker, keyExtractor);
        this.personnelInfoSupplier = personnelInfoSupplier;
        valueProperties.put(RESPONDENT_NAME, new SimpleStringProperty());
        valueProperties.put(POSITION, new SimpleStringProperty());
        valueProperties.put(PHONE, new SimpleStringProperty());
        valueProperties.put(EMAIL, new SimpleStringProperty());
        valueProperties.put(QUARTER, new SimpleStringProperty());
        valueProperties.put(EXTRA_INFO, new SimpleStringProperty());
        // valueProperties.put(OTHER_RECEPTION_AREA, new SimpleStringProperty());
        // valueProperties.put(FUNCTION, new
        // SimpleStringProperty());
        valueProperties.put(FACILITY_NAME, new SimpleStringProperty());
        valueProperties.put(OTHER_WATER_SOURCE, new SimpleStringProperty());
        valueProperties.put(OTHER_CS_REG_LOCATION, new SimpleStringProperty());
        valueProperties.put(OTHER_WAITING_ROOM, new SimpleStringProperty());
        valueProperties.put(OTHER_INTERNET_TYPE, new SimpleStringProperty());
        valueProperties.put(CREATION_DATE, new SimpleObjectProperty<LocalDate>());
        valueProperties.put(DIVISION, new SimpleObjectProperty<Option>());
        valueProperties.put(CS_REG_LOCATION, new SimpleObjectProperty<Option>());
        // valueProperties.put(RECEPTION_AREA, new SimpleObjectProperty<Option>());
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

        // options.put(WAITING_ROOM, new
        // SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(DIVISION, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(MUNICIPALITY, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(CLASSIFICATION, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(WATER_SOURCES, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(IS_CHIEF_CS_OFFICER,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(CS_REG_LOCATION, new SimpleListProperty<>(FXCollections.observableArrayList()));
        // options.put(RECEPTION_AREA, new
        // SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(INTERNET_TYPE, new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(FieldKeys.PersonnelInfo.Chefferie.PERSONNEL_COMPUTER_LEVEL,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(FieldKeys.PersonnelInfo.Chefferie.PERSONNEL_ED_LEVEL,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
        options.put(FieldKeys.PersonnelInfo.Chefferie.PERSONNEL_GENDER,
                new SimpleListProperty<>(FXCollections.observableArrayList()));
    }

    @Override
    public void trackFieldChanges() {
        if (fieldsTracked)
            return;
        trackUpdatesForField(RESPONDENT_NAME);
        trackUpdatesForField(POSITION);
        trackUpdatesForField(EMAIL);
        trackUpdatesForField(CREATION_DATE);
        trackUpdatesForField(DIVISION);
        trackUpdatesForField(MUNICIPALITY);
        trackUpdatesForField(QUARTER);
        trackUpdatesForField(FACILITY_NAME);
        trackUpdatesForField(CLASSIFICATION);
        trackUpdatesForField(HEALTH_CENTER_PROXIMITY);
        trackUpdatesForField(GPS_COORDS);
        // trackUpdatesForField(RECEPTION_AREA);
        // trackUpdatesForField(OTHER_RECEPTION_AREA);
        trackUpdatesForField(CS_OFFICER_TRAINED);
        trackUpdatesForField(WAITING_ROOM);
        trackUpdatesForField(OTHER_WAITING_ROOM);
        trackUpdatesForField(IS_CHIEF_CS_OFFICER);
        trackUpdatesForField(CHIEF_OATH);
        trackUpdatesForField(CS_REG_LOCATION);
        trackUpdatesForField(OTHER_CS_REG_LOCATION);
        trackUpdatesForField(TOILETS_ACCESSIBLE);
        trackUpdatesForField(PC_COUNT);
        trackUpdatesForField(PRINTER_COUNT);
        trackUpdatesForField(TABLET_COUNT);
        trackUpdatesForField(CAR_COUNT);
        trackUpdatesForField(BIKE_COUNT);
        trackUpdatesForField(IS_CHIEFDOM_CHIEF_RESIDENCE);
        trackUpdatesForField(HAS_INTERNET);
        trackUpdatesForField(INTERNET_TYPE);
        trackUpdatesForField(OTHER_INTERNET_TYPE);
        trackUpdatesForField(HAS_ENEO_CONNECTION);
        trackUpdatesForField(WATER_ACCESS);
        trackUpdatesForField(WATER_SOURCES);
        trackUpdatesForField(OTHER_WATER_SOURCE);
        trackUpdatesForField(HAS_EXTINGUISHER);
        trackUpdatesForField(EMPLOYEE_COUNT);
        trackUpdatesForField(EXTRA_INFO);
        fieldsTracked = true;
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
    public ListProperty<Option> getOptionsFor(String field) {
        return options.get(field);
    }

    @Override
    public void loadOptions(OptionSource optionSource, Runnable callback) {
        if (optionsLoaded) {
            if (callback != null)
                callback.run();
            return;
        }

        Function<ObservableList<Option>, Consumer<Collection<Option>>> consumerFactory = list -> values -> {
            if (Platform.isFxApplicationThread())
                list.setAll(values);
            else
                Platform.runLater(() -> list.setAll(values));
        };

        optionSource.get(FORM_ID, "division", null, consumerFactory.apply(options.get(DIVISION)));
        optionSource.get(FORM_ID, "commune", null,
                consumerFactory.apply(options.get(MUNICIPALITY)));
        optionSource.get(FORM_ID, "vb2qk85", null,
                consumerFactory.apply(options.get(CLASSIFICATION)));
        optionSource.get(FORM_ID, "zp4ec39", null,
                consumerFactory.apply(options.get(WATER_SOURCES)));
        optionSource.get(FORM_ID, "tr2ph17", null,
                consumerFactory.apply(options.get(IS_CHIEF_CS_OFFICER)));
        optionSource.get(FORM_ID, "vo6qc48", null,
                consumerFactory.apply(options.get(CS_REG_LOCATION)));
        // optionSource.get(FORM_ID, "vo6qc48", null,
        // consumerFactory.apply(options.get(WAITING_ROOM)));
        optionSource.get(FORM_ID, "internet_types", null,
                consumerFactory.apply(options.get(INTERNET_TYPE)));
        optionSource.get(FORM_ID, "xw39g10", null,
                consumerFactory.apply(options.get(FieldKeys.PersonnelInfo.Chefferie.PERSONNEL_GENDER)));
        optionSource.get(FORM_ID, "nz2pr56", null,
                consumerFactory.apply(options.get(FieldKeys.PersonnelInfo.Chefferie.PERSONNEL_COMPUTER_LEVEL)));
        optionSource.get(FORM_ID, "ta2og93", null,
                consumerFactory.apply(options.get(FieldKeys.PersonnelInfo.Chefferie.PERSONNEL_ED_LEVEL)));

        optionsLoaded = true;
        if (callback != null)
            callback.run();
    }

    @Override
    protected Class<?> getPropertyTypeFor(String id) {
        return switch (id) {
            case RESPONDENT_NAME, POSITION,
                    PHONE, EMAIL, FACILITY_NAME,
                    QUARTER, OTHER_CS_REG_LOCATION,
                    OTHER_INTERNET_TYPE, OTHER_WATER_SOURCE ->
                String.class;
            case DIVISION, MUNICIPALITY, CLASSIFICATION,
                    IS_CHIEF_CS_OFFICER, CS_REG_LOCATION ->
                Option.class;
            case WATER_SOURCES, INTERNET_TYPE -> List.class;
            case CREATION_DATE -> LocalDate.class;
            case HEALTH_CENTER_PROXIMITY, PC_COUNT,
                    PRINTER_COUNT, TABLET_COUNT, BIKE_COUNT,
                    EMPLOYEE_COUNT, CAR_COUNT ->
                Integer.class;
            case CHIEF_OATH, HAS_ENEO_CONNECTION,
                    TOILETS_ACCESSIBLE, HAS_EXTINGUISHER,
                    WATER_ACCESS, CS_OFFICER_TRAINED,
                    WAITING_ROOM, HAS_INTERNET,
                    IS_CHIEFDOM_CHIEF_RESIDENCE ->
                Boolean.class;
            case GPS_COORDS -> GeoPoint.class;
            default -> super.getPropertyTypeFor(id);
        };
    }

    @Override
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public Property getPropertyFor(String id) {
        return Optional.of(id)
                .filter(StringUtils::isNotBlank)
                .map(valueProperties::get)
                .orElse(super.getPropertyFor(id));
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue oathAvailable() {
        final var chiefIsCsRegProperty = (ObjectProperty<Option>) getPropertyFor(
                IS_CHIEF_CS_OFFICER);
        final var oathProperty = (BooleanProperty) getPropertyFor(CHIEF_OATH);
        final var csOfficerTrainedProperty = (BooleanProperty) getPropertyFor(CS_OFFICER_TRAINED);
        final var binding = Bindings.createBooleanBinding(() -> Optional.ofNullable(chiefIsCsRegProperty.getValue())
                .map(Option::value).filter(v -> "1".equals(v) || "2".equals(v)).isPresent(), chiefIsCsRegProperty);
        binding.addListener((ob, ov, nv) -> {
            if (nv == null || !nv) {
                oathProperty.setValue(null);
                csOfficerTrainedProperty.setValue(null);
            }
        });
        return binding;
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue otherCsRegLocationAvailable() {
        final var csRegLocationProperty = (ObjectProperty<Option>) getPropertyFor(CS_REG_LOCATION);
        final var otherCsRegLocationProperty = (StringProperty) getPropertyFor(
                OTHER_CS_REG_LOCATION);
        final var binding = Bindings.createBooleanBinding(() -> Optional.ofNullable(csRegLocationProperty.getValue())
                .map(Option::value).filter("3"::equals).isPresent(), csRegLocationProperty);
        binding.addListener((ob, ov, nv) -> {
            if (!nv)
                otherCsRegLocationProperty.setValue(null);
        });
        return binding;
    }

    // @SuppressWarnings("unchecked")
    // public ObservableBooleanValue otherWaitingRoomAvailableProperty() {
    // final var waitingRoomProperty = (ObjectProperty<Option>)
    // getPropertyFor(WAITING_ROOM);
    // final var otherReceptionAreaProperty = (StringProperty)
    // getPropertyFor(OTHER_WAITING_ROOM);
    // final var binding = waitingRoomProperty.isEqualTo("3");
    // binding.addListener((ob, ov, nv) -> {
    // if (!nv)
    // otherReceptionAreaProperty.setValue(null);
    // });
    // return binding;
    // }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue internetTypeAvailable() {
        final var hasInternetProperty = (BooleanProperty) getPropertyFor(HAS_INTERNET);
        final var internetTypeProperty = (ListProperty<Option>) getPropertyFor(INTERNET_TYPE);
        hasInternetProperty.addListener((ob, ov, nv) -> {
            if (!nv)
                internetTypeProperty.clear();
        });
        return hasInternetProperty;
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue waterSourcesAvailable() {
        final var waterAccessProperty = (BooleanProperty) getPropertyFor(WATER_ACCESS);
        final var waterSourcesProperty = (ListProperty<Option>) getPropertyFor(WATER_SOURCES);
        waterAccessProperty.addListener((ob, ov, nv) -> {
            if (!nv)
                waterSourcesProperty.clear();
        });
        return waterAccessProperty;
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue otherWaterSourceAvailable() {
        final var waterSourcesProperty = (ListProperty<Option>) getPropertyFor(WATER_SOURCES);
        final var otherWaterSourceProperty = (StringProperty) getPropertyFor(OTHER_WATER_SOURCE);
        final var binding = Bindings.createBooleanBinding(() -> Optional.ofNullable(waterSourcesProperty.getValue())
                .filter(l -> l.stream().anyMatch(o -> "5".equals(o.value())))
                .isPresent(),
                waterSourcesProperty);
        binding.addListener((ob, ov, nv) -> {
            if (!nv) {
                otherWaterSourceProperty.setValue(null);
            }
        });
        return binding;
    }

    @SuppressWarnings("unchecked")
    public void updateGeoPointUpdates() {
        final var geoPointProperty = (ObjectProperty<GeoPoint>) getPropertyFor(GPS_COORDS);
        final var entry = changes.computeIfAbsent(FieldKeys.Fosa.GEO_POINT,
                k -> new FieldChange(k, null, geoPointProperty.getValue(), 0, false));
        entry.setNewValue(geoPointProperty.getValue());
    }

    private void loadPersonnelInfo() {
        final var allPersonnel = personnelInfoSupplier.get();
        personnelInfo.clear();
        personnelInfo.addAll(allPersonnel);
    }

    public ListProperty<PersonnelInfo> personnelInfoProperty() {
        return personnelInfo;
    }

}
