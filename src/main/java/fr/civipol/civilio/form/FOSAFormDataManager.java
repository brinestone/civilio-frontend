package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.DataUpdate;
import fr.civipol.civilio.entity.FosaStat;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.field.Option;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import javafx.beans.value.ObservableBooleanValue;
import javafx.collections.FXCollections;
import javafx.collections.MapChangeListener;
import javafx.collections.ObservableList;
import org.apache.commons.lang3.StringUtils;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

@SuppressWarnings("unchecked")
public class FOSAFormDataManager extends FormDataManager {
    private static final String DELIMITER_TOKEN_PATTERN = "[, ]";
    private static final String FORM_ID = "am5nSncmYooy8nknSHzYaz";
    private final StringProperty attachedCsc, officeName, respondentNames, position, phone, email, locality, quarter;
    private final ObjectProperty<LocalDate> creationDate;
    private final ListProperty<Option> waterSourceTypes, waterSources, registeredEventTypes, eventRegistrationTypes,
            districts, regions, divisions,
            municipalities, healthAreas, environmentTypes, emergencyPowerSourceTypes, emergencyPowerSources,
            fosaTypes,
            genders, educationLevels, computerKnowledgeLevels,
            fosaStatusTypes;
    private final ObjectProperty<Option> district, region, division, municipality, healthArea, environmentType,
            fosaType, fosaStatusType;
    private final ObjectProperty<GeoPoint> geoPoint;
    private final BooleanProperty internetConnectionAvailable, emergencyPowerSourceAvailable,
            eneoConnection, toiletAvailable, maternityAvailable, dhis2Usage, bunecBirthFormUsage, dhis2FormUsage,
            birthDeclarationToCsc;
    private final DoubleProperty cscDistance;
    private final MapProperty<String, FosaStat> vitalCSCStats;
    private final MapProperty<String, PersonnelInfo> personnelInfoMap;
    private final ListProperty<FosaStat> vitalCSCStatsValue;
    private final ListProperty<PersonnelInfo> personnelInfo;
    private final IntegerProperty personnelCount,
            pcCount,
            printerCount,
            tabletCount,
            carCount,
            bikeCount;
    private final OptionSource optionSource;
    private boolean trackingUpdates = false;

    public FOSAFormDataManager(
            Function<String, ?> valueExtractor,
            Function<String, String> fieldExtractor,
            OptionSource optionSource
    ) {
        super(valueExtractor, fieldExtractor);
        this.optionSource = optionSource;
        genders = new SimpleListProperty<>(FXCollections.observableArrayList());
        educationLevels = new SimpleListProperty<>(FXCollections.observableArrayList());
        computerKnowledgeLevels = new SimpleListProperty<>(FXCollections.observableArrayList());
        personnelInfo = new SimpleListProperty<>(FXCollections.observableArrayList());
        fosaStatusTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        municipalities = new SimpleListProperty<>(FXCollections.observableArrayList());
        fosaTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        districts = new SimpleListProperty<>(FXCollections.observableArrayList());
        environmentTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        emergencyPowerSourceTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        emergencyPowerSources = new SimpleListProperty<>(FXCollections.observableArrayList());
        healthAreas = new SimpleListProperty<>(FXCollections.observableArrayList());
        regions = new SimpleListProperty<>(FXCollections.observableArrayList());
        divisions = new SimpleListProperty<>(FXCollections.observableArrayList());
        eventRegistrationTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        registeredEventTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        waterSources = new SimpleListProperty<>(FXCollections.observableArrayList());
        waterSourceTypes = new SimpleListProperty<>(FXCollections.observableArrayList());

        pcCount = new SimpleIntegerProperty(this, "pcCount");
        personnelCount = new SimpleIntegerProperty(this, "personnelCount");
        printerCount = new SimpleIntegerProperty(this, "printerCount");
        tabletCount = new SimpleIntegerProperty(this, "tableCount");
        carCount = new SimpleIntegerProperty(this, "carCount");
        bikeCount = new SimpleIntegerProperty(this, "bikeCount");
        email = new SimpleStringProperty(this, "email", "");
        district = new SimpleObjectProperty<>(this, "district");
        phone = new SimpleStringProperty(this, "phone", "");
        maternityAvailable = new SimpleBooleanProperty(this, "hasMaternity");
        toiletAvailable = new SimpleBooleanProperty(this, "toiletAvailable");
        emergencyPowerSourceAvailable = new SimpleBooleanProperty(this, "emergencyPowerSource");
        eneoConnection = new SimpleBooleanProperty(this, "eneoConnection");
        position = new SimpleStringProperty(this, "position", "");
        attachedCsc = new SimpleStringProperty(this, "position", "");
        respondentNames = new SimpleStringProperty(this, "respondentNames", "");
        creationDate = new SimpleObjectProperty<>(this, "creationDate");
        municipality = new SimpleObjectProperty<>(this, "municipality");
        officeName = new SimpleStringProperty(this, "officeName", "");
        quarter = new SimpleStringProperty(this, "quarter", "");
        locality = new SimpleStringProperty(this, "locality", "");
        fosaStatusType = new SimpleObjectProperty<>(this, "statusType");
        geoPoint = new SimpleObjectProperty<>(this, "geoPoint");
        fosaType = new SimpleObjectProperty<>(this, "fosaType");
        environmentType = new SimpleObjectProperty<>(this, "environmentType");
        healthArea = new SimpleObjectProperty<>(this, "healthArea");
        region = new SimpleObjectProperty<>(this, "region");
        division = new SimpleObjectProperty<>(this, "department");
        cscDistance = new SimpleDoubleProperty(this, "cscDistance");
        dhis2Usage = new SimpleBooleanProperty(this, "dhis2Usage");
        bunecBirthFormUsage = new SimpleBooleanProperty(this, "bunecBirthFormUsage");
        dhis2FormUsage = new SimpleBooleanProperty(this, "dhis2FormUsage");
        birthDeclarationToCsc = new SimpleBooleanProperty(this, "birthDeclarationToCsc");
        internetConnectionAvailable = new SimpleBooleanProperty(this, "internetConnectionAvailable");
        vitalCSCStats = new SimpleMapProperty<>(this, "vitalCSCStat", FXCollections.observableHashMap());
        personnelInfoMap = new SimpleMapProperty<>(this, "personnelInfo_", FXCollections.observableHashMap());
        vitalCSCStatsValue = new SimpleListProperty<>(this, "vitalCSCStatsValue", FXCollections.observableArrayList());

        setupChangeListeners();
    }

    @SuppressWarnings("DuplicatedCode")
    private void trackMultiValueUpdates() {

    }

    @Override
    @SuppressWarnings("DuplicatedCode")
    public void trackFieldChanges() {
        if (trackingUpdates) return;
        trackUpdatesForField(FieldKeys.Fosa.PERSONNEL_COUNT);
        trackUpdatesForField(FieldKeys.Fosa.BIKE_COUNT);
        trackUpdatesForField(FieldKeys.Fosa.CAR_COUNT);
        trackUpdatesForField(FieldKeys.Fosa.TABLET_COUNT);
        trackUpdatesForField(FieldKeys.Fosa.PRINTER_COUNT);
        trackUpdatesForField(FieldKeys.Fosa.PC_COUNT);
        trackUpdatesForField(FieldKeys.Fosa.ENVIRONMENT_TYPE);
        trackUpdatesForField(FieldKeys.Fosa.WATER_SOURCES);
        trackUpdatesForField(FieldKeys.Fosa.HAS_INTERNET_CONNECTION);
        trackUpdatesForField(FieldKeys.Fosa.HAS_BACKUP_POWER_SOURCE);
        trackUpdatesForField(FieldKeys.Fosa.HAS_ENEO_CONNECTION);
        trackUpdatesForField(FieldKeys.Fosa.HAS_TOILET_FIELD);
        trackUpdatesForField(FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS);
        trackUpdatesForField(FieldKeys.Fosa.SEND_BIRTH_DECLARATIONS_TO_CSC);
        trackUpdatesForField(FieldKeys.Fosa.USES_DHIS_FORMS);
        trackUpdatesForField(FieldKeys.Fosa.USES_BUNEC_BIRTH_FORM);
        trackUpdatesForField(FieldKeys.Fosa.USES_DHIS);
        trackUpdatesForField(FieldKeys.Fosa.GEO_POINT);
        trackUpdatesForField(FieldKeys.Fosa.CSC_DISTANCE);
        trackUpdatesForField(FieldKeys.Fosa.ATTACHED_CSC);
        trackUpdatesForField(FieldKeys.Fosa.HAS_MATERNITY);
        trackUpdatesForField(FieldKeys.Fosa.STATUS);
        trackUpdatesForField(FieldKeys.Fosa.FACILITY_TYPE);
        trackUpdatesForField(FieldKeys.Fosa.HEALTH_AREA);
        trackUpdatesForField(FieldKeys.Fosa.DISTRICT);
        trackUpdatesForField(FieldKeys.Fosa.OFFICE_NAME);
        trackUpdatesForField(FieldKeys.Fosa.LOCALITY);
        trackUpdatesForField(FieldKeys.Fosa.QUARTER);
        trackUpdatesForField(FieldKeys.Fosa.MUNICIPALITY);
        trackUpdatesForField(FieldKeys.Fosa.DIVISION);
        trackUpdatesForField(FieldKeys.Fosa.REGION);
        trackUpdatesForField(FieldKeys.Fosa.CREATION_DATE);
        trackUpdatesForField(FieldKeys.Fosa.RESPONDENT_NAME);
        trackUpdatesForField(FieldKeys.Fosa.POSITION);
        trackUpdatesForField(FieldKeys.Fosa.PHONE);
        trackUpdatesForField(FieldKeys.Fosa.MAIL);
        trackMultiValueUpdates();
        trackingUpdates = true;
    }

    @Override
    protected String getIndexFieldKey() {
        return FieldKeys.Fosa.INDEX;
    }

    @Override
    protected String getValidationCodeFieldKey() {
        return FieldKeys.Fosa.VALIDATION_CODE;
    }

    public void updateGeoPointUpdates() {
        final var entry = updates.computeIfAbsent(FieldKeys.Fosa.GEO_POINT, k -> new DataUpdate(k, null, this.geoPoint.getValue()));
        entry.setNewValue(this.geoPoint.getValue());
    }

    @SuppressWarnings("DuplicatedCode")
    public void updateTrackedCSCStatsFields() {
        // TODO: implement this
    }

    @SuppressWarnings("DuplicatedCode")
    public void updateTrackedPersonnelFields() {
        // TODO: implement this
    }

    private void setupChangeListeners() {
        region.addListener((ob, ov, nv) -> {
            if (nv == null) {
                divisionsProperty().clear();
                division.set(null);
                return;
            }
            optionSource.get(FORM_ID, "division", ((String) nv.value()), divisionsProperty()::setAll);
        });

        division.addListener((ob, ov, nv) -> {
            if (nv == null) {
                municipalitiesProperty().clear();
                municipality.set(null);
                return;
            }
            optionSource.get(FORM_ID, "commune", ((String) nv.value()), municipalitiesProperty()::setAll);
        });

        municipality.addListener((ob, ov, nv) -> {
            if (nv != null)
                return;
            quarter.set("");
            locality.set("");
        });
        district.addListener((ob, ov, nv) -> {
            healthArea.set(null);
            if (nv == null)
                return;
            optionSource.get(FORM_ID, "airesante", ((String) nv.value()), healthAreasProperty()::setAll);
        });
        vitalCSCStats.addListener((MapChangeListener<String, FosaStat>) change -> vitalCSCStatsValue.setValue(FXCollections.observableArrayList(vitalCSCStats.values())));
        personnelInfoMap.addListener((MapChangeListener<String, PersonnelInfo>) change -> personnelInfo.setValue(FXCollections.observableArrayList(personnelInfoMap.values())));
    }

    private void loadPersonnelInfo() {
        // TODO: implement this
    }

    private void loadVitalStats() {
        // TODO: implement this
    }

    public void loadValues() {
        super.loadValues();
        loadVitalStats();
        loadPersonnelInfo();
        loadValue(FieldKeys.Fosa.PERSONNEL_COUNT, 0);
        loadValue(FieldKeys.Fosa.PC_COUNT, 0);
        loadValue(FieldKeys.Fosa.PRINTER_COUNT, 0);
        loadValue(FieldKeys.Fosa.TABLET_COUNT, 0);
        loadValue(FieldKeys.Fosa.CAR_COUNT, 0);
        loadValue(FieldKeys.Fosa.BIKE_COUNT, 0);
        loadValue(FieldKeys.Fosa.HAS_ENEO_CONNECTION, false);
        loadValue(FieldKeys.Fosa.HAS_BACKUP_POWER_SOURCE, false);
        loadValue(FieldKeys.Fosa.HAS_INTERNET_CONNECTION, false);
        loadValue(FieldKeys.Fosa.HAS_TOILET_FIELD, false);
        loadValue(FieldKeys.Fosa.USES_DHIS, false);
        loadValue(FieldKeys.Fosa.CSC_DISTANCE, 0.0);
        loadValue(FieldKeys.Fosa.ATTACHED_CSC, "");
        loadValue(FieldKeys.Fosa.HAS_MATERNITY, false);
        loadValue(FieldKeys.Fosa.OFFICE_NAME, "");
        loadValue(FieldKeys.Fosa.MAIL, "");
        loadValue(FieldKeys.Fosa.PHONE, "");
        loadValue(FieldKeys.Fosa.POSITION, "");
        loadValue(FieldKeys.Fosa.RESPONDENT_NAME, "");
        loadValue(FieldKeys.Fosa.CREATION_DATE, null);
        loadValue(FieldKeys.Fosa.GEO_POINT, GeoPoint.builder()
                .latitude(3.8542679f)
                .longitude(11.4661458f)
                .build());

        loadOptionValue(FieldKeys.Fosa.ENVIRONMENT_TYPE);
        loadOptionValue(FieldKeys.Fosa.WATER_SOURCES);
        loadOptionValue(FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS);
        loadOptionValue(FieldKeys.Fosa.HEALTH_AREA);
        loadOptionValue(FieldKeys.Fosa.DISTRICT);
        loadOptionValue(FieldKeys.Fosa.REGION);
        loadOptionValue(FieldKeys.Fosa.FACILITY_TYPE);
        loadOptionValue(FieldKeys.Fosa.STATUS);
        loadPowerSources();
    }

    private void loadPowerSources() {
        // TODO: implement this
    }

    private void loadOptionValue(String field) {
        Optional.ofNullable(valueSource.apply(field))
                .map(String::valueOf)
                .filter(StringUtils::isNotBlank)
                .map(v -> deserializeValue(v, field))
                .ifPresent(v -> this.getPropertyFor(field).setValue(v));
    }

    public void loadOptions(OptionSource optionSource, Runnable callback) {
        Function<ObservableList<Option>, Consumer<Collection<Option>>> consumer = list -> v -> {
            if (Platform.isFxApplicationThread()) list.setAll(v);
            else Platform.runLater(() -> list.setAll(v));
        };
        optionSource.get(FORM_ID, "region", null, consumer.apply(regions));
        optionSource.get(FORM_ID, "vb2qk85", null, consumer.apply(environmentTypes));
        optionSource.get(FORM_ID, "district", null, consumer.apply(districts));
        optionSource.get(FORM_ID, "pa9ii12", null, consumer.apply(fosaTypes));
        optionSource.get(FORM_ID, "qy7we33", null, consumer.apply(fosaStatusTypes));
        optionSource.get(FORM_ID, "ij2ql10", null, consumer.apply(eventRegistrationTypes));
        optionSource.get(FORM_ID, "xt53f30", null, consumer.apply(emergencyPowerSourceTypes));
        optionSource.get(FORM_ID, "zp4ec39", null, consumer.apply(waterSourceTypes));
        optionSource.get(FORM_ID, "xw39g10", null, consumer.apply(genders));
        optionSource.get(FORM_ID, "ta2og93", null, consumer.apply(educationLevels));
        optionSource.get(FORM_ID, "nz2pr56", null, consumer.apply(computerKnowledgeLevels));
        Optional.ofNullable(callback).ifPresent(Runnable::run);
    }

    @Override
    public ObservableBooleanValue pristine() {
        return Bindings.isEmpty(updates);
    }

    @Override
    public Collection<DataUpdate> getPendingUpdates() {
        return updates.values().stream()
                .peek(u -> u.setNewValue(serializeValue(u.getNewValue())))
                .toList();
    }

    @Override
    @SuppressWarnings("rawtypes,DuplicatedCode")
    public Property getPropertyFor(String id) {
        if (StringUtils.isBlank(id)) return null;
        return switch (id) {
            case FieldKeys.Fosa.PERSONNEL_COUNT -> personnelCount;
            case FieldKeys.Fosa.CREATION_DATE -> creationDate;
            case FieldKeys.Fosa.MAIL -> email;
            case FieldKeys.Fosa.PHONE -> phone;
            case FieldKeys.Fosa.POSITION -> position;
            case FieldKeys.Fosa.RESPONDENT_NAME -> respondentNames;
            case FieldKeys.Fosa.DIVISION -> division;
            case FieldKeys.Fosa.MUNICIPALITY -> municipality;
            case FieldKeys.Fosa.REGION -> region;
            case FieldKeys.Fosa.QUARTER -> quarter;
            case FieldKeys.Fosa.LOCALITY -> locality;
            case FieldKeys.Fosa.OFFICE_NAME -> officeName;
            case FieldKeys.Fosa.DISTRICT -> district;
            case FieldKeys.Fosa.HEALTH_AREA -> healthArea;
            case FieldKeys.Fosa.FACILITY_TYPE -> fosaType;
            case FieldKeys.Fosa.STATUS -> fosaStatusType;
            case FieldKeys.Fosa.HAS_MATERNITY -> maternityAvailable;
            case FieldKeys.Fosa.ATTACHED_CSC -> attachedCsc;
            case FieldKeys.Fosa.CSC_DISTANCE -> cscDistance;
            case FieldKeys.Fosa.GEO_POINT -> geoPoint;
            case FieldKeys.Fosa.USES_DHIS -> dhis2Usage;
            case FieldKeys.Fosa.USES_BUNEC_BIRTH_FORM -> this.bunecBirthFormUsage;
            case FieldKeys.Fosa.USES_DHIS_FORMS -> this.dhis2FormUsage;
            case FieldKeys.Fosa.SEND_BIRTH_DECLARATIONS_TO_CSC -> this.birthDeclarationToCsc;
            case FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS -> this.registeredEventTypes;
            case FieldKeys.Fosa.HAS_TOILET_FIELD -> toiletAvailable;
            case FieldKeys.Fosa.HAS_ENEO_CONNECTION -> eneoConnection;
            case FieldKeys.Fosa.HAS_BACKUP_POWER_SOURCE -> emergencyPowerSourceAvailable;
            case FieldKeys.Fosa.HAS_INTERNET_CONNECTION -> internetConnectionAvailable;
            case FieldKeys.Fosa.WATER_SOURCES -> waterSources;
            case FieldKeys.Fosa.ENVIRONMENT_TYPE -> environmentType;
            case FieldKeys.Fosa.PC_COUNT -> pcCount;
            case FieldKeys.Fosa.PRINTER_COUNT -> printerCount;
            case FieldKeys.Fosa.TABLET_COUNT -> tabletCount;
            case FieldKeys.Fosa.CAR_COUNT -> carCount;
            case FieldKeys.Fosa.BIKE_COUNT -> bikeCount;
            default -> super.getPropertyFor(id);
        };
    }

    @SuppressWarnings("DuplicatedCode")
    private ListProperty<Option> getOptionsFor(String id) {
        return switch (id) {
            case FieldKeys.Fosa.REGION -> regions;
            case FieldKeys.Fosa.STATUS -> fosaStatusTypes;
            case FieldKeys.Fosa.FACILITY_TYPE -> fosaTypes;
            case FieldKeys.Fosa.HEALTH_AREA -> healthAreas;
            case FieldKeys.Fosa.DISTRICT -> districts;
            case FieldKeys.Fosa.DIVISION -> divisions;
            case FieldKeys.Fosa.MUNICIPALITY -> municipalities;
            case FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS -> eventRegistrationTypes;
            case FieldKeys.Fosa.WATER_SOURCES -> waterSourceTypes;
            case FieldKeys.Fosa.ENVIRONMENT_TYPE -> environmentTypes;
            default -> null;
        };
    }

    @Override
    public Class<?> getPropertyTypeFor(String id) {
        return switch (id) {
            case FieldKeys.Fosa.CREATION_DATE -> LocalDate.class;
            case FieldKeys.Fosa.MAIL, FieldKeys.Fosa.ATTACHED_CSC, FieldKeys.Fosa.OFFICE_NAME, FieldKeys.Fosa.PHONE, FieldKeys.Fosa.POSITION, FieldKeys.Fosa.RESPONDENT_NAME, FieldKeys.Fosa.QUARTER, FieldKeys.Fosa.LOCALITY ->
                    String.class;
            case FieldKeys.Fosa.REGION, FieldKeys.Fosa.STATUS, FieldKeys.Fosa.FACILITY_TYPE, FieldKeys.Fosa.HEALTH_AREA, FieldKeys.Fosa.DISTRICT, FieldKeys.Fosa.DIVISION, FieldKeys.Fosa.MUNICIPALITY, FieldKeys.Fosa.ENVIRONMENT_TYPE ->
                    Option.class;
            case FieldKeys.Fosa.HAS_INTERNET_CONNECTION, FieldKeys.Fosa.HAS_TOILET_FIELD, FieldKeys.Fosa.SEND_BIRTH_DECLARATIONS_TO_CSC, FieldKeys.Fosa.USES_DHIS_FORMS, FieldKeys.Fosa.USES_BUNEC_BIRTH_FORM, FieldKeys.Fosa.HAS_MATERNITY, FieldKeys.Fosa.HAS_ENEO_CONNECTION, FieldKeys.Fosa.HAS_BACKUP_POWER_SOURCE, FieldKeys.Fosa.USES_DHIS ->
                    Boolean.class;
            case FieldKeys.Fosa.CSC_DISTANCE -> Double.class;
            case FieldKeys.Fosa.GEO_POINT -> GeoPoint.class;
            case FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS, FieldKeys.Fosa.WATER_SOURCES, FieldKeys.Fosa.BACKUP_POWER_SOURCES ->
                    List.class;
            case FieldKeys.Fosa.PERSONNEL_COUNT, FieldKeys.Fosa.PC_COUNT, FieldKeys.Fosa.PRINTER_COUNT, FieldKeys.Fosa.TABLET_COUNT, FieldKeys.Fosa.CAR_COUNT, FieldKeys.Fosa.BIKE_COUNT ->
                    Integer.class;
            default -> super.getPropertyTypeFor(id);
        };
    }

    @Override
    @SuppressWarnings("rawtypes")
    protected final Object deserializeValue(Object raw, String id) {
        if (Optional.ofNullable(getPropertyTypeFor(id)).filter(LocalDate.class::equals).isPresent()) {
            if (raw instanceof String s)
                return Timestamp.valueOf(s).toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
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
            else if (raw instanceof Double d) return d.intValue();
            else return 0;
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
            else if (raw instanceof String) {
                final var values = Arrays.asList(((String) raw).split(DELIMITER_TOKEN_PATTERN));
                final var x = getOptionsFor(id).stream()
                        .filter(o -> values.stream().anyMatch(s -> o.value().equals(s)))
                        .toList();
                final var property = (ListProperty) getPropertyFor(id);
                property.addAll(x);
                return property.getValue();
            }
        } else if (raw instanceof String
                   && Optional.ofNullable(getPropertyTypeFor(id)).filter(FosaStat.class::equals).isPresent()) {
            final var isYearField = id.equals(FieldKeys.Fosa.STATS_YEAR);
            final var isBirthField = id.equals(FieldKeys.Fosa.STATS_BIRTH_COUNT);
            final var isDeathsField = id.endsWith(FieldKeys.Fosa.STATS_DEATH_COUNT);

            final var entry = vitalCSCStats.computeIfAbsent(id, __ -> FosaStat.builder().build());
            final var stringValue = String.valueOf(raw);
            if (stringValue.matches("\\d+")) {
                final var value = stringValue.chars()
                        .mapToObj(Character.class::cast)
                        .filter(Character::isDigit)
                        .map(String::valueOf)
                        .collect(Collectors.joining(""));
                final var intValue = Integer.parseUnsignedInt(value);

                if (isYearField)
                    entry.setYear(intValue);
                else if (isBirthField)
                    entry.setRegisteredBirths(intValue);
                else if (isDeathsField)
                    entry.setRegisteredDeaths(intValue);
                vitalCSCStats.remove(id);
                vitalCSCStats.put(id, entry);
                return vitalCSCStats.get();
            }
        } else if (raw instanceof String && Optional.ofNullable(getPropertyTypeFor(id)).filter(PersonnelInfo.class::equals).isPresent()) {
            final var isNameField = id.equals(FieldKeys.Fosa.PERSONNEL_NAME);
            final var isPositionField = id.equals(FieldKeys.Fosa.PERSONNEL_POSITION);
            final var isGenderField = id.equals(FieldKeys.Fosa.PERSONNEL_GENDER);
            final var isPhoneField = id.equals(FieldKeys.Fosa.PERSONNEL_PHONE);
            final var isAgeField = id.equals(FieldKeys.Fosa.PERSONNEL_AGE);
            final var isCSTrainingField = id.equals(FieldKeys.Fosa.PERSONNEL_CS_TRAINING);
            final var isEdLevelField = id.equals(FieldKeys.Fosa.PERSONNEL_ED_LEVEL);
            final var isComputerLevelField = id.equals(FieldKeys.Fosa.PERSONNEL_COMPUTER_LEVEL);
            final var isEmailField = id.equals(FieldKeys.Fosa.PERSONNEL_EMAIL);

            final var entry = personnelInfoMap.computeIfAbsent(id, __ -> PersonnelInfo.builder()
                    .parentIndex((String) valueSource.apply("_index"))
                    .parentSubmissionId((String) valueSource.apply("_id"))
                    .build());
            final var stringValue = String.valueOf(raw);

            if (stringValue.matches("^\\d+$") && isAgeField) {
                entry.setAge(Integer.parseInt(stringValue));
            } else if (isNameField) entry.setNames(stringValue);
            else if (isPositionField) entry.setRole(stringValue);
            else if (isPhoneField) entry.setPhone(stringValue);
            else if (isCSTrainingField) entry.setCivilStatusTraining("1".equals(stringValue));
            else if (isEdLevelField) entry.setEducationLevel(stringValue);
            else if (isGenderField) entry.setGender(stringValue);
            else if (isComputerLevelField) entry.setComputerKnowledgeLevel(stringValue);
            else if (isEmailField) entry.setEmail(stringValue);

            personnelInfoMap.remove(id);
            personnelInfoMap.put(id, entry);
            return personnelInfoMap.getValue();
        }

        return raw;
    }

    public ListProperty<Option> gendersProperty() {
        return genders;
    }

    public ListProperty<Option> educationLevelsProperty() {
        return educationLevels;
    }

    public ListProperty<PersonnelInfo> personnelInfoProperty() {
        return personnelInfo;
    }

    public ListProperty<Option> computerKnowledgeLevelsProperty() {
        return computerKnowledgeLevels;
    }

    public IntegerProperty personnelCountProperty() {
        return personnelCount;
    }

    public IntegerProperty carCountProperty() {
        return carCount;
    }

    public IntegerProperty bikeCountProperty() {
        return bikeCount;
    }

    public IntegerProperty tabletCountProperty() {
        return tabletCount;
    }

    public IntegerProperty printerCountProperty() {
        return printerCount;
    }

    public IntegerProperty pcCountProperty() {
        return pcCount;
    }

    public ListProperty<Option> waterSourcesProperty() {
        return waterSources;
    }

    public ListProperty<Option> waterSourceTypesProperty() {
        return waterSourceTypes;
    }

    public BooleanProperty internetConnectionAvailableProperty() {
        return internetConnectionAvailable;
    }

    public ListProperty<Option> emergencyPowerSourceTypesProperty() {
        return emergencyPowerSourceTypes;
    }

    public ListProperty<Option> emergencyPowerSourcesProperty() {
        return emergencyPowerSources;
    }

    public BooleanProperty emergencyPowerSourceAvailableProperty() {
        return emergencyPowerSourceAvailable;
    }

    public BooleanProperty eneoConnectionProperty() {
        return eneoConnection;
    }

    public BooleanProperty toiletAvailableProperty() {
        return toiletAvailable;
    }

    public ListProperty<FosaStat> vitalCSCStatsValueProperty() {
        return vitalCSCStatsValue;
    }

    public ListProperty<Option> registeredEventTypesProperty() {
        return registeredEventTypes;
    }

    public ListProperty<Option> eventRegistrationTypesProperty() {
        return eventRegistrationTypes;
    }

    public BooleanProperty birthDeclarationToCscProperty() {
        return birthDeclarationToCsc;
    }

    public BooleanProperty dhis2FormUsageProperty() {
        return dhis2FormUsage;
    }

    public BooleanProperty bunecBirthFormUsageProperty() {
        return bunecBirthFormUsage;
    }

    public BooleanProperty dhis2UsageProperty() {
        return dhis2Usage;
    }

    public ObjectProperty<GeoPoint> geoPointProperty() {
        return geoPoint;
    }

    public DoubleProperty cscDistanceProperty() {
        return cscDistance;
    }

    public BooleanProperty maternityAvailableProperty() {
        return maternityAvailable;
    }

    public ObjectProperty<Option> fosaTypeProperty() {
        return fosaType;
    }

    public StringProperty officeNameProperty() {
        return officeName;
    }

    public ObjectProperty<Option> healthAreaProperty() {
        return healthArea;
    }

    public ObjectProperty<Option> districtProperty() {
        return district;
    }

    public ListProperty<Option> districtsProperty() {
        return districts;
    }

    public ObjectProperty<Option> environmentTypeProperty() {
        return environmentType;
    }

    public StringProperty localityProperty() {
        return locality;
    }

    public StringProperty quarterProperty() {
        return quarter;
    }

    public ObjectProperty<Option> municipalityProperty() {
        return municipality;
    }

    public ObjectProperty<Option> regionProperty() {
        return region;
    }

    public ListProperty<Option> municipalitiesProperty() {
        return municipalities;
    }

    public ListProperty<Option> fosaStatusTypesProperty() {
        return fosaStatusTypes;
    }

    public ObjectProperty<Option> fosaStatusTypeProperty() {
        return fosaStatusType;
    }

    public ListProperty<Option> fosaTypesProperty() {
        return fosaTypes;
    }

    public ListProperty<Option> environmentTypesProperty() {
        return environmentTypes;
    }

    public ListProperty<Option> healthAreasProperty() {
        return healthAreas;
    }

    public ObjectProperty<Option> divisionProperty() {
        return division;
    }

    public ListProperty<Option> regionsProperty() {
        return regions;
    }

    public ListProperty<Option> divisionsProperty() {
        return divisions;
    }

    public StringProperty attachedCscProperty() {
        return attachedCsc;
    }

    public ObjectProperty<LocalDate> creationDateProperty() {
        return creationDate;
    }

    public StringProperty emailProperty() {
        return email;
    }

    public StringProperty phoneProperty() {
        return phone;
    }

    public StringProperty positionProperty() {
        return position;
    }

    public StringProperty respondentNamesProperty() {
        return respondentNames;
    }
}
