package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.domain.SubFormDataLoader;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.form.field.Option;
import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableBooleanValue;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.IntStream;
import java.util.stream.Stream;

@Slf4j
@SuppressWarnings("rawtypes")
public class CSCFormModel extends FormModel {
    private static final String[] REGION_IDS = IntStream.rangeClosed(1, 7)
            .mapToObj("%02d"::formatted)
            .toArray(String[]::new);
    private final Map<String, ObservableBooleanValue> bindings = new ConcurrentHashMap<>();
    private final Map<String, Property> valueProperties = new HashMap<>();
    private boolean trackingChanges = false;
    private final Map<String, ListProperty<Option>> options = new HashMap<>();
    private final OptionSource optionSource;
    private final SubFormDataLoader subFormDataLoader;
    @Getter
    private final ListProperty<Map<String, Object>> villageData, deedsData, roomData, financialStatsData, archiveStatsData, staffData;

    public CSCFormModel(Function<String, ?> valueSource,
                        BiFunction<String, Integer, String> keyMaker,
                        Function<String, String> keyExtractor,
                        OptionSource optionSource,
                        SubFormDataLoader subFormDataLoader) {
        super(valueSource, keyMaker, keyExtractor);
        this.optionSource = optionSource;
        this.subFormDataLoader = subFormDataLoader;
        setupChangeListeners();
        villageData = new SimpleListProperty<>(FXCollections.observableArrayList());
        roomData = new SimpleListProperty<>(FXCollections.observableArrayList());
        financialStatsData = new SimpleListProperty<>(FXCollections.observableArrayList());
        archiveStatsData = new SimpleListProperty<>(FXCollections.observableArrayList());
        staffData = new SimpleListProperty<>(FXCollections.observableArrayList());
        deedsData = new SimpleListProperty<>(FXCollections.observableArrayList());
    }

    @SuppressWarnings("unchecked")
    private void setupChangeListeners() {
        final var divisionProperty = (ObjectProperty<Option>) getPropertyFor(FieldKeys.CSC.Identification.DIVISION);
        final var municipalityOptions = getOptionsFor(FieldKeys.CSC.Identification.MUNICIPALITY);
        final var municipalityProperty = (ObjectProperty<Option>) getPropertyFor(
                FieldKeys.CSC.Identification.MUNICIPALITY);
        divisionProperty.addListener((ob, ov, nv) -> {
            if (nv == null) {
                municipalityOptions.clear();
                municipalityProperty.set(null);
            } else {
                municipalityOptions.setAll(optionSource.findOptions("commune", (String) nv.value()));
            }
        });
    }

    @Override
    public void loadInitialOptions() {
        getOptionsFor(FieldKeys.CSC.RecordProcurement.HAS_THERE_BEEN_LACK_OF_REGISTERS).setAll(optionSource.findOptions("tw32q01"));
        getOptionsFor(FieldKeys.CSC.RecordProcurement.RECORDS_PROVIDER).setAll(optionSource.findOptions("sl8yh95"));
        getOptionsFor(FieldKeys.CSC.Identification.DIVISION).setAll(optionSource.findOptions("division", REGION_IDS));
        getOptionsFor(FieldKeys.CSC.Identification.MUNICIPALITY).setAll(optionSource.findOptions("commune"));
        getOptionsFor(FieldKeys.CSC.Identification.CATEGORY).setAll(optionSource.findOptions("mx3gb95"));
        getOptionsFor(FieldKeys.CSC.Identification.CHIEFDOM_DEGREE).setAll(optionSource.findOptions("sl95o71"));
        getOptionsFor(FieldKeys.CSC.Identification.TOWN_SIZE).setAll(optionSource.findOptions("pq1hw83"));
        getOptionsFor(FieldKeys.CSC.Identification.MILIEU).setAll(optionSource.findOptions("vb2qk85"));
        getOptionsFor(FieldKeys.CSC.Identification.NON_FUNCTION_REASON).setAll(optionSource.findOptions("ti6lo46"));
        getOptionsFor(FieldKeys.CSC.Identification.NON_FUNCTION_DURATION).setAll(optionSource.findOptions("kq18p63"));
        getOptionsFor(FieldKeys.CSC.Accessibility.ROAD_TYPE).setAll(optionSource.findOptions("tr2ph17"));
        getOptionsFor(FieldKeys.CSC.Accessibility.ROAD_OBSTACLE).setAll(optionSource.findOptions("hb0ui59"));
        getOptionsFor(FieldKeys.CSC.Accessibility.COVER_RADIUS).setAll(optionSource.findOptions("da2cb00"));
        getOptionsFor(FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES).setAll(optionSource.findOptions("wa8hl88"));
        getOptionsFor(FieldKeys.CSC.Infrastructure.WATER_SOURCES).setAll(optionSource.findOptions("on8vp92"));
        getOptionsFor(FieldKeys.CSC.Infrastructure.HAS_FIBER_CONNECTION).setAll(optionSource.findOptions("hy7qe58"));
        getOptionsFor(FieldKeys.CSC.Infrastructure.NETWORK_TYPE).setAll(optionSource.findOptions("hy3mz13"));
        getOptionsFor(FieldKeys.CSC.Infrastructure.INTERNET_TYPE).setAll(optionSource.findOptions("hy3mz13"));
        getOptionsFor(FieldKeys.CSC.Infrastructure.INTERNET_SPONSOR).setAll(optionSource.findOptions("eb2cq25"));
        getOptionsFor(FieldKeys.CSC.Areas.Rooms.CONDITION).setAll(optionSource.findOptions("hg4oe04"));
        getOptionsFor(FieldKeys.CSC.Areas.Rooms.RENOVATION_NATURE).setAll(optionSource.findOptions("se9tm32"));
        getOptionsFor(FieldKeys.CSC.Digitization.CS_SOFTWARE_LICENSE_SPONSOR)
                .setAll(optionSource.findOptions("pt2hk19"));
        getOptionsFor(FieldKeys.CSC.Digitization.SOFTWARE_FEEDBACK).setAll(optionSource.findOptions("ja3ja10"));
        getOptionsFor(FieldKeys.CSC.RecordIndexing.STAFF_TRAINED).setAll(optionSource.findOptions("fv5nn38"));
        getOptionsFor(FieldKeys.CSC.RecordIndexing.DATA_INDEXED).setAll(optionSource.findOptions("fw78n80"));
        getOptionsFor(FieldKeys.CSC.Archiving.ARCHIVE_ROOM_ELECTRIC_CONDITION)
                .setAll(optionSource.findOptions("hv1un42"));
        getOptionsFor(FieldKeys.CSC.Archiving.REGISTER_ARCHIVING_TYPE).setAll(optionSource.findOptions("xi0eq24"));
        getOptionsFor(FieldKeys.CSC.Archiving.REGISTERS_DEPOSITED).setAll(optionSource.findOptions("gw85g70"));
        getOptionsFor(FieldKeys.CSC.Deeds.YEAR).setAll(optionSource.findOptions("dj0uq71"));
        getOptionsFor(FieldKeys.CSC.StatusOfArchivedRecords.YEAR).setAll(optionSource.findOptions("ue0vo43"));
        getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_POSITION).setAll(optionSource.findOptions("ts8cb25"));
        getOptionsFor(FieldKeys.CSC.PersonnelInfo.Officers.STATUS).setAll(optionSource.findOptions("kr15v52"));
        getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_GENDER).setAll(optionSource.findOptions("xw39g10"));
        getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL).setAll(optionSource.findOptions("ta2og93"));
        getOptionsFor(FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL).setAll(optionSource.findOptions("nz2pr56"));
        getOptionsFor(FieldKeys.CSC.Infrastructure.STATUS).setAll(optionSource.findOptions("stat_bat"));
    }

    @Override
    public void trackFieldChanges() {
        if (trackingChanges) {
            log.debug("Already tracking fields, skipping.");
            return;
        }
        Stream.of(FieldKeys.CSC.TRACKABLE_FIELDS).forEach(this::trackChangesForField);

        trackingChanges = true;
        log.debug("Tracking field changes");
    }

    @SuppressWarnings("unchecked")
    protected void unTrackFieldChanges(String field) {
        changes.remove(field);
        final var property = valueProperties.get(field);
        if (property instanceof ChangeListener<?> c) {
            property.removeListener(c);
        } else if (property instanceof ListChangeListener<?> c && property instanceof ListProperty l) {
            l.removeListener(c);
        }
    }

    public void trackSubFormProperty(String key, Property property) {
        log.debug("tracking: {}", key);
        if (valueProperties.containsKey(key)) {
            log.warn("field: {} is already being tracked. Removing previously tracked property", key);

        }
        valueProperties.put(key, property);
        trackChangesForField(key);
        log.debug("now tracking");
    }

    @Override
    public void loadValues() {
        super.loadValues();
        Arrays.stream(FieldKeys.CSC.TRACKABLE_FIELDS)
                .forEach(k -> loadValue(k, getDefaultValueFor(k)));
        loadVillageValues();
        loadRoomValues();
        loadArchivedDataValues();
        loadStaffValues();
        loadDeedValues();
    }

    private void loadDeedValues() {
        final var maps = subFormDataLoader.loadSubFormData(FieldKeys.CSC.Deeds.ALL_FIELDS);
        deserializeSubFormValues(maps, deedsData);
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

    @SuppressWarnings("unchecked")
    public <V> Property<V> provideVillageDataFieldProperty(String fieldKey, int ordinal) {
        return provideSubFormDataProperty(villageData.get(ordinal), fieldKey, ordinal, (V) getDefaultValueFor(fieldKey));
    }

    @SuppressWarnings("unchecked")
    public <V> Property<V> provideStaffDataFieldProperty(String fieldKey, int ordinal) {
        return provideSubFormDataProperty(staffData.get(ordinal), fieldKey, ordinal, (V) getDefaultValueFor(fieldKey));
    }

    public <V> Property<V> provideRoomDataFieldProperty(String fieldKey, int ordinal) {
        return provideSubFormDataProperty(roomData.get(ordinal), fieldKey, ordinal, null);
    }

    public <V> Property<V> provideDeedFieldProperty(String fieldKey, int ordinal) {
        return provideSubFormDataProperty(deedsData.get(ordinal), fieldKey, ordinal, null);
    }

    private void loadArchivedDataValues() {
        final var maps = subFormDataLoader.loadSubFormData(FieldKeys.CSC.StatusOfArchivedRecords.ALL_FIELDS);
        deserializeSubFormValues(maps, archiveStatsData);
    }

    private void loadStaffValues() {
        final var maps = subFormDataLoader.loadSubFormData(FieldKeys.CSC.PersonnelInfo.STAFF_FIELDS);
        deserializeSubFormValues(maps, staffData);
    }

    private void loadRoomValues() {
        final var maps = subFormDataLoader.loadSubFormData(FieldKeys.CSC.Areas.Rooms.ALL_FIELDS);
        deserializeSubFormValues(maps, roomData);
    }

    private void loadVillageValues() {
        var maps = subFormDataLoader.loadSubFormData(FieldKeys.CSC.Accessibility.Villages.ALL_FIELDS);
        deserializeSubFormValues(maps, villageData);
    }

    @Override
    public String getIndexFieldKey() {
        return FieldKeys.CSC.INDEX;
    }

    @Override
    protected String getValidationCodeFieldKey() {
        return FieldKeys.CSC.VALIDATION_CODE;
    }

    @Override
    public ListProperty<Option> getOptionsFor(String field) {
        return options.computeIfAbsent(field, k -> new SimpleListProperty<>(FXCollections.observableArrayList()));
    }

    @Override
    public Property getPropertyFor(String id) {
        final var key = keyExtractor.apply(id);
        if (FieldKeys.CSC.INDEX.equals(key) || FieldKeys.CSC.VALIDATION_CODE.equals(key))
            return super.getPropertyFor(id);
        return valueProperties.computeIfAbsent(id, this::createValueProperty);
    }

    @Override
    protected Class<?> getPropertyTypeFor(String id) {
        return switch (id) {
            case FieldKeys.CSC.Digitization.OTHER_CS_SOFTWARE_LICENSE_SPONSOR, FieldKeys.PersonnelInfo.PERSONNEL_NAME,
                    FieldKeys.CSC.Respondent.POSITION,
                    FieldKeys.CSC.PersonnelInfo.Officers.OTHER_STATUS,
                    FieldKeys.CSC.Accessibility.Villages.OBSERVATIONS, FieldKeys.CSC.Accessibility.Villages.NAME,
                    FieldKeys.CSC.Identification.OTHER_NON_FUNCTION_REASON, FieldKeys.CSC.Respondent.NAME,
                    FieldKeys.CSC.Respondent.PHONE, FieldKeys.CSC.Respondent.EMAIL,
                    FieldKeys.CSC.Identification.QUARTER, FieldKeys.CSC.Identification.FACILITY_NAME,
                    FieldKeys.CSC.Identification.LOCALITY, FieldKeys.CSC.Identification.SECONDARY_CREATION_ORDER,
                    FieldKeys.CSC.Identification.OFFICER_APPOINTMENT_ORDER, FieldKeys.CSC.Identification.PHOTO_URL,
                    FieldKeys.CSC.Infrastructure.OTHER_BUILDING, FieldKeys.CSC.Infrastructure.OTHER_POWER_SOURCE,
                    FieldKeys.CSC.Infrastructure.OTHER_NETWORK_TYPE, FieldKeys.CSC.Infrastructure.OTHER_INTERNET_TYPE,
                    FieldKeys.CSC.Digitization.CS_SOFTWARE_NAME, FieldKeys.CSC.Digitization.SOFTWARE_DYSFUNCTION_REASON,
                    FieldKeys.CSC.RecordIndexing.DATA_USAGE, FieldKeys.CSC.RecordProcurement.OTHER_RECORDS_PROVIDER,
                    FieldKeys.CSC.Archiving.OTHER_ARCHIVING_TYPE, FieldKeys.PersonnelInfo.PERSONNEL_PHONE,
                    FieldKeys.PersonnelInfo.PERSONNEL_EMAIL, FieldKeys.CSC.Comments.RELEVANT_INFO,
                    FieldKeys.CSC.Archiving.VANDALIZED_DATE,
                    FieldKeys.CSC.Areas.Rooms.NAME -> String.class;
            case FieldKeys.CSC.Identification.CHIEFDOM_DEGREE, FieldKeys.CSC.Identification.DIVISION,
                    FieldKeys.CSC.Identification.MUNICIPALITY, FieldKeys.CSC.Identification.CATEGORY,
                    FieldKeys.CSC.Identification.TOWN_SIZE, FieldKeys.CSC.Identification.NON_FUNCTION_DURATION,
                    FieldKeys.CSC.Identification.MILIEU, FieldKeys.CSC.Accessibility.ROAD_OBSTACLE,
                    FieldKeys.CSC.RecordIndexing.DATA_INDEXED, FieldKeys.CSC.Accessibility.ROAD_TYPE,
                    FieldKeys.CSC.Accessibility.COVER_RADIUS, FieldKeys.CSC.Infrastructure.STATUS,
                    FieldKeys.CSC.Infrastructure.WATER_SOURCES, FieldKeys.CSC.Infrastructure.HAS_FIBER_CONNECTION,
                    FieldKeys.CSC.Infrastructure.INTERNET_SPONSOR,
                    FieldKeys.CSC.Digitization.CS_SOFTWARE_LICENSE_SPONSOR,
                    FieldKeys.CSC.Digitization.SOFTWARE_FEEDBACK,
                    FieldKeys.CSC.Archiving.ARCHIVE_ROOM_ELECTRIC_CONDITION,
                    FieldKeys.CSC.Archiving.REGISTERS_DEPOSITED, FieldKeys.CSC.PersonnelInfo.Officers.OTHER_POSITION,
                    FieldKeys.PersonnelInfo.PERSONNEL_GENDER, FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL,
                    FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL, FieldKeys.CSC.PersonnelInfo.Officers.STATUS,
                    FieldKeys.CSC.Deeds.YEAR, FieldKeys.CSC.Areas.Rooms.CONDITION,
                    FieldKeys.PersonnelInfo.PERSONNEL_POSITION,
                    FieldKeys.CSC.StatusOfArchivedRecords.YEAR -> Option.class;
            case FieldKeys.CSC.Areas.Rooms.AREA, FieldKeys.CSC.Accessibility.Villages.DISTANCE,
                    FieldKeys.CSC.Accessibility.ATTACHED_VILLAGES_NUMBER -> Double.class;
            case FieldKeys.CSC.Identification.CREATION_DATE, FieldKeys.CSC.Respondent.CREATION_DATE,
                    FieldKeys.CSC.Digitization.SOFTWARE_ACTIVATION_DATE -> LocalDate.class;
            case FieldKeys.CSC.Identification.GPS_COORDS -> GeoPoint.class;
            case FieldKeys.CSC.Digitization.USERS_RECEIVE_DIGITAL_ACTS, FieldKeys.CSC.Respondent.KNOWS_CREATION_DATE,
                    FieldKeys.CSC.Identification.IS_CHIEFDOM, FieldKeys.CSC.Identification.IS_FUNCTIONAL,
                    FieldKeys.CSC.Identification.IS_OFFICER_APPOINTED,
                    FieldKeys.CSC.Accessibility.DOES_ROAD_DETERIORATE, FieldKeys.CSC.Infrastructure.ENEO_CONNECTION,
                    FieldKeys.CSC.Infrastructure.POWER_OUTAGES, FieldKeys.CSC.Infrastructure.STABLE_POWER,
                    FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES_AVAILABLE,
                    FieldKeys.CSC.Infrastructure.TOILETS_AVAILABLE,
                    FieldKeys.CSC.Infrastructure.SEPARATE_TOILETS_AVAILABLE, FieldKeys.CSC.Infrastructure.HAS_INTERNET,
                    FieldKeys.CSC.Areas.DEDICATED_CS_ROOMS, FieldKeys.CSC.Areas.MOVING,
                    FieldKeys.CSC.Digitization.EXTERNAL_CR_USES_INTERNET,
                    FieldKeys.CSC.Digitization.EXTERNAL_SERVICE_FROM_CR, FieldKeys.CSC.Digitization.HAS_CS_SOFTWARE,
                    FieldKeys.CSC.Digitization.SOFTWARE_IS_WORKING, FieldKeys.CSC.RecordIndexing.RECORDS_SCANNED,
                    FieldKeys.CSC.RecordIndexing.STAFF_TRAINED, FieldKeys.CSC.RecordIndexing.IS_DATA_USED_BY_CSC,
                    FieldKeys.CSC.RecordProcurement.NON_COMPLIANT_REGISTERS_USED,
                    FieldKeys.CSC.FinancialStats.RATES_UNDER_DELIBERATION, FieldKeys.CSC.FinancialStats.PRICES_DISPLAYED,
                    FieldKeys.CSC.Archiving.HAS_ARCHIVING_ROOM, FieldKeys.CSC.Archiving.HAS_FIRE_EXTINGUISHERS,
                    FieldKeys.CSC.Archiving.LOCKED_DOOR, FieldKeys.CSC.Archiving.IS_ARCHIVE_ROOM_ACCESS_LIMITED,
                    FieldKeys.CSC.Archiving.ROOM_HAS_HUMIDITY, FieldKeys.CSC.Archiving.WRITTEN_ARCHIVING_PLAN,
                    FieldKeys.CSC.Archiving.REGISTERS_DEPOSITED_SYSTEMATICALLY, FieldKeys.CSC.Archiving.VANDALIZED,
                    FieldKeys.CSC.PersonnelInfo.HAS_COMPUTER_TRAINING,
                    FieldKeys.CSC.PersonnelInfo.HAS_ARCHIVING_TRAINING,
                    FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING -> Boolean.class;
            case FieldKeys.CSC.Identification.NON_FUNCTION_REASON, FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES,
                    FieldKeys.CSC.Infrastructure.NETWORK_TYPE,
                    FieldKeys.CSC.RecordProcurement.HAS_THERE_BEEN_LACK_OF_REGISTERS,
                    FieldKeys.CSC.RecordProcurement.RECORDS_PROVIDER, FieldKeys.CSC.Infrastructure.INTERNET_TYPE,
                    FieldKeys.CSC.Archiving.REGISTER_ARCHIVING_TYPE, FieldKeys.CSC.Areas.Rooms.RENOVATION_NATURE ->
                    List.class;
            case FieldKeys.CSC.Identification.ATTACHED_CENTERS, FieldKeys.CSC.Areas.OFFICE_COUNT,
                    FieldKeys.CSC.Equipment.COMPUTER_COUNT, FieldKeys.CSC.Equipment.SERVER_COUNT,
                    FieldKeys.CSC.Equipment.PRINTER_COUNT, FieldKeys.CSC.Equipment.SCANNER_COUNT,
                    FieldKeys.CSC.Equipment.INVERTERS_COUNT, FieldKeys.CSC.Equipment.AIR_CONDITIONER_COUNT,
                    FieldKeys.CSC.Equipment.FAN_COUNT, FieldKeys.CSC.Equipment.PROJECTOR_COUNT,
                    FieldKeys.CSC.Equipment.OFFICE_TABLE_COUNT, FieldKeys.CSC.Equipment.CHAIR_COUNT,
                    FieldKeys.CSC.Equipment.BIKE_COUNT, FieldKeys.CSC.Equipment.TABLET_COUNT,
                    FieldKeys.CSC.Equipment.CAR_COUNT, FieldKeys.CSC.Digitization.SOFTWARE_TRAINED_USER_COUNT,
                    FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_MARRIAGE_COUNT,
                    FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_BIRTHS_COUNT,
                    FieldKeys.CSC.Digitization.SOFTWARE_RECORDED_DEATH_COUNT,
                    FieldKeys.CSC.RecordIndexing.BIRTHS_SCANNED, FieldKeys.CSC.RecordIndexing.BIRTHS_INDEXED,
                    FieldKeys.CSC.RecordIndexing.DEATHS_INDEXED, FieldKeys.CSC.RecordIndexing.DEATHS_SCANNED,
                    FieldKeys.CSC.RecordIndexing.MARRIAGES_INDEXED, FieldKeys.CSC.RecordIndexing.MARRIAGES_SCANNED,
                    FieldKeys.CSC.RecordProcurement.BLANK_REGISTRIES_COUNT,
                    FieldKeys.CSC.RecordProcurement.BLANK_MARRIAGES, FieldKeys.CSC.RecordProcurement.BLANK_BIRTHS,
                    FieldKeys.CSC.RecordProcurement.BLANK_DEATHS, FieldKeys.CSC.FinancialStats.BIRTH_CERT_COST,
                    FieldKeys.CSC.FinancialStats.BIRTH_CERT_COPY_COST, FieldKeys.CSC.FinancialStats.MARRIAGE_CERT_COPY_COST,
                    FieldKeys.CSC.FinancialStats.DEATH_CERT_COPY_COST, FieldKeys.CSC.FinancialStats.CELIBACY_CERT_COPY_COST,
                    FieldKeys.CSC.FinancialStats.NON_REGISTERED_CERTS, FieldKeys.CSC.FinancialStats.MUNICIPALITY_BUDGET_2024,
                    FieldKeys.CSC.FinancialStats.CS_BUDGET_2024/*, FieldKeys.CSC.FinancialStats.CS_REVENUE_2024*/,
                    FieldKeys.CSC.PersonnelInfo.FEMALE_COUNT, FieldKeys.CSC.PersonnelInfo.MALE_COUNT,
                    FieldKeys.CSC.PersonnelInfo.NON_OFFICER_MALE_COUNT,
                    FieldKeys.CSC.PersonnelInfo.NON_OFFICER_FEMALE_COUNT, FieldKeys.PersonnelInfo.PERSONNEL_AGE,
                    FieldKeys.CSC.PersonnelInfo.Officers.CS_SENIORITY,
                    FieldKeys.CSC.PersonnelInfo.Officers.TOTAL_ALLOWANCE_2022,
                    FieldKeys.CSC.PersonnelInfo.Officers.TOTAL_REVENUE_2022, FieldKeys.CSC.Deeds.BIRTH_CERT_DRAWN,
                    FieldKeys.CSC.Deeds.BIRTH_CERT_NOT_DRAWN, FieldKeys.CSC.Deeds.MARRIAGE_CERT_DRAWN,
                    FieldKeys.CSC.Deeds.MARRIAGE_CERT_NOT_DRAWN, FieldKeys.CSC.Deeds.DEATH_CERT_DRAWN,
                    FieldKeys.CSC.Deeds.DEATH_CERT_NOT_DRAWN, FieldKeys.CSC.Areas.Rooms.NUMBER,
                    FieldKeys.CSC.StatusOfArchivedRecords.BIRTH_COUNT,
                    FieldKeys.CSC.StatusOfArchivedRecords.MARRIAGE_COUNT,
                    FieldKeys.CSC.RecordIndexing.DOCUMENT_SCAN_START_DATE,
                    FieldKeys.CSC.StatusOfArchivedRecords.DEATH_COUNT -> Integer.class;
            default -> super.getPropertyTypeFor(id);
        };
    }

    public void updateGpsCoords() {

    }

    public ObservableBooleanValue centerHasBeenVandalized() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Archiving.VANDALIZED);
    }

    public ObservableBooleanValue centerIsNeitherPrimaryNorSecondary() {
        final var binding = structureIsPrimaryOrSecondary();
        return bindings.computeIfAbsent("!structureIsPrimaryOrSecondary", __ -> Bindings.not(binding));
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerUsesCustomArchivingType() {
        final var archivingType = (ListProperty<Option>) getPropertyFor(FieldKeys.CSC.Archiving.REGISTER_ARCHIVING_TYPE);
        final var targetValue = "7";
        return bindings.computeIfAbsent("%s=%s".formatted(FieldKeys.CSC.Archiving.REGISTER_ARCHIVING_TYPE, targetValue), __ -> Bindings.createBooleanBinding(() -> Optional.ofNullable(archivingType.getValue())
                        .map(Collection::stream)
                        .stream()
                        .flatMap(Function.identity())
                        .map(Option::value)
                        .anyMatch(targetValue::equals),
                archivingType));
    }

    public ObservableBooleanValue structureIsPrimaryOrSecondary() {
        return structureCategoryIsIn("1", "2");
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerHasCustomRecordsProvider() {
        final var providers = (ListProperty<Option>) getPropertyFor(FieldKeys.CSC.RecordProcurement.RECORDS_PROVIDER);
        final var targetValue = "4";
        return bindings.computeIfAbsent("%s=%s".formatted(FieldKeys.CSC.RecordProcurement.RECORDS_PROVIDER, targetValue), __ -> Bindings.createBooleanBinding(() -> Optional.ofNullable(providers.getValue())
                .filter(Predicate.not(Collection::isEmpty))
                .stream()
                .flatMap(Collection::stream)
                .map(Option::value)
                .anyMatch(targetValue::equals), providers));
    }

    public ObservableBooleanValue centerUsesIndexedData() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.RecordIndexing.IS_DATA_USED_BY_CSC);
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerIndexesData() {
        final var indexing = (ObjectProperty<Option>) getPropertyFor(FieldKeys.CSC.RecordIndexing.DATA_INDEXED);
        return bindings.computeIfAbsent("%s=1||%s=2".formatted(FieldKeys.CSC.RecordIndexing.DATA_INDEXED,
                        FieldKeys.CSC.RecordIndexing.DATA_INDEXED),
                __ -> Bindings.createBooleanBinding(() -> Optional.ofNullable(indexing.getValue())
                        .map(Option::value)
                        .filter(v -> "1".equals(v) || "2".equals(v))
                        .isPresent(), indexing));
    }

    public ObservableBooleanValue centerHasScannedDocuments() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.RecordIndexing.RECORDS_SCANNED);
    }

    public ObservableBooleanValue respondentKnowsCreationDate() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Respondent.KNOWS_CREATION_DATE);
    }

    public ObservableBooleanValue centerSoftwareIsNotFunctional() {
        return bindings.computeIfAbsent("%s=false".formatted(FieldKeys.CSC.Digitization.SOFTWARE_IS_WORKING),
                __ -> Bindings.not(centerSoftwareIsFunctioning()).and(centerIsEquippedWithCSSoftware()));
    }

    public ObservableBooleanValue centerSoftwareIsFunctioning() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Digitization.SOFTWARE_IS_WORKING);
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerUsesCustomSponsor() {
        final var sponsor = (ObjectProperty<Option>) getPropertyFor(
                FieldKeys.CSC.Digitization.CS_SOFTWARE_LICENSE_SPONSOR);
        return bindings.computeIfAbsent("%s=4".formatted(FieldKeys.CSC.Digitization.CS_SOFTWARE_LICENSE_SPONSOR),
                __ -> Bindings.createBooleanBinding(() -> Optional.ofNullable(sponsor.getValue())
                        .map(Option::value)
                        .filter("4"::equals)
                        .isPresent(), sponsor));
    }

    public ObservableBooleanValue centerIsEquippedWithCSSoftware() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Digitization.HAS_CS_SOFTWARE);
    }

    public ObservableBooleanValue centerUsesComputerizedSystem() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Digitization.EXTERNAL_SERVICE_FROM_CR);
    }

    public ObservableBooleanValue centerHasDedicatedRooms() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Areas.DEDICATED_CS_ROOMS);
    }

    public ObservableBooleanValue centerCanHaveStats() {
        ObservableBooleanValue categoryCheck = structureIsPrimaryOrSecondary();
        ObservableBooleanValue functional = structureIsFunctional();
        return bindings.computeIfAbsent("center_can_have_stats", __ -> Bindings.and(functional, categoryCheck));
    }

    public ObservableBooleanValue centerHasInternetConnection() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Infrastructure.HAS_INTERNET);
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerHasOtherInternetType() {
        final var internetTypeProperty = (ListProperty<Option>) getPropertyFor(
                FieldKeys.CSC.Infrastructure.INTERNET_TYPE);
        return bindings.computeIfAbsent(FieldKeys.CSC.Infrastructure.INTERNET_TYPE,
                __ -> Bindings.createBooleanBinding(() -> internetTypeProperty.stream()
                        .map(Option::value)
                        .anyMatch("4"::equals), internetTypeProperty));
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerHasOtherNetworkType() {
        final var networkTypeProperty = (ListProperty<Option>) getPropertyFor(
                FieldKeys.CSC.Infrastructure.NETWORK_TYPE);
        return bindings.computeIfAbsent(FieldKeys.CSC.Infrastructure.NETWORK_TYPE,
                __ -> Bindings.createBooleanBinding(() -> networkTypeProperty.stream()
                        .map(Option::value)
                        .anyMatch("4"::equals), networkTypeProperty));
    }

    public ObservableBooleanValue centerHasToilets() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Infrastructure.TOILETS_AVAILABLE);
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerHasOtherBackupPower() {
        final var backupPower = (ListProperty<Option>) getPropertyFor(
                FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES);
        return bindings.computeIfAbsent(FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES,
                __ -> Bindings.createBooleanBinding(() -> backupPower.stream()
                        .map(Option::value)
                        .anyMatch("autre_precisez"::equals), backupPower));
    }

    public ObservableBooleanValue centerHasBackupPower() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Infrastructure.BACKUP_POWER_SOURCES_AVAILABLE);
    }

    public ObservableBooleanValue centerHasEneoConnection() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Infrastructure.ENEO_CONNECTION);
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue centerHasTarredRoad() {
        final var roadTypeProperty = (ObjectProperty<Option>) getPropertyFor(FieldKeys.CSC.Accessibility.ROAD_OBSTACLE);
        return bindings.computeIfAbsent(FieldKeys.CSC.Accessibility.ROAD_OBSTACLE,
                __ -> Bindings.createBooleanBinding(() -> Optional.ofNullable(roadTypeProperty.getValue())
                                .map(Option::value)
                                .filter("1"::equals)
                                .isPresent(),
                        roadTypeProperty));
    }

    public ObservableBooleanValue structureIsChiefdom() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Identification.IS_CHIEFDOM);
    }

    @SuppressWarnings("unchecked")
    public ObservableBooleanValue nonFunctionalReasonIsUnknown() {
        final var reasonProperty = (ListProperty<Option>) getPropertyFor(
                FieldKeys.CSC.Identification.NON_FUNCTION_REASON);
        return bindings.computeIfAbsent(FieldKeys.CSC.Identification.NON_FUNCTION_REASON,
                __ -> Bindings.createBooleanBinding(() -> Optional.ofNullable(reasonProperty.getValue())
                                .filter(l -> l.stream().map(Option::value).anyMatch("6"::equals))
                                .isPresent(),
                        reasonProperty));
    }

    public ObservableBooleanValue structureOfficerAppointed() {
        return ((BooleanProperty) getPropertyFor(FieldKeys.CSC.Identification.IS_OFFICER_APPOINTED));
    }

    public ObservableBooleanValue structureIsSpecialized() {
        return structureCategoryIsIn("4");
    }

    public ObservableBooleanValue structureIsNonFunctional() {
        return ((BooleanProperty) getPropertyFor(FieldKeys.CSC.Identification.IS_FUNCTIONAL)).not();
    }

    public ObservableBooleanValue structureIsFunctional() {
        return (BooleanProperty) getPropertyFor(FieldKeys.CSC.Identification.IS_FUNCTIONAL);
    }

    public ObservableBooleanValue isStructurePrimary() {
        return structureCategoryIsIn("1");
    }

    public ObservableBooleanValue isStructureSecondary() {
        return structureCategoryIsIn("3");
    }

    @SuppressWarnings("unchecked")
    private ObservableBooleanValue structureCategoryIsIn(String... options) {
        final var categoryProperty = (ObjectProperty<Option>) getPropertyFor(FieldKeys.CSC.Identification.CATEGORY);
        return bindings.computeIfAbsent("%s=%s".formatted(FieldKeys.CSC.Identification.CATEGORY, String.join(",", options)), __ -> Bindings.createBooleanBinding(() -> {
            final var wrapper = Optional.ofNullable(categoryProperty.getValue());
            return wrapper.isPresent() && Arrays.stream(options)
                    .anyMatch(v -> v.equals(wrapper.get().value()));
        }, categoryProperty));
    }
}
