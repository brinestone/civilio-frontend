package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.field.Option;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Supplier;

@Slf4j
@SuppressWarnings("unchecked")
public class FOSAFormDataManager extends FormDataManager {
    private final StringProperty attachedCsc, officeName, respondentNames, position, phone, email, locality, quarter;
    private final ObjectProperty<LocalDate> creationDate;
    private final ListProperty<Option> deviceOptions, waterSourceTypes, waterSources, registeredEventTypes, eventRegistrationTypes,
            districts, divisions,
            municipalities, healthAreas, environmentTypes, emergencyPowerSourceTypes, emergencyPowerSources,
            fosaTypes,
            genders, educationLevels, computerKnowledgeLevels,
            fosaStatusTypes;
    private final ObjectProperty<Option> device, district, division, municipality, healthArea, environmentType,
            fosaType, fosaStatusType;
    private final ObjectProperty<GeoPoint> geoPoint;
    private final BooleanProperty internetConnectionAvailable, emergencyPowerSourceAvailable,
            eneoConnection, toiletAvailable, maternityAvailable, dhis2Usage, bunecBirthFormUsage, dhis2FormUsage,
            birthDeclarationToCsc;
    private final DoubleProperty cscDistance;
    private final ListProperty<PersonnelInfo> personnelInfo;
    private final IntegerProperty personnelCount,
            pcCount,
            printerCount,
            tabletCount,
            carCount,
            bikeCount,
            statsYear1,
            statsYear2,
            statsYear3,
            statsYear4,
            statsYear5,
            deathCount1,
            deathCount2,
            deathCount3,
            deathCount4,
            deathCount5,
            birthCount1,
            birthCount2,
            birthCount3,
            birthCount4,
            birthCount5;
    private final Supplier<Collection<PersonnelInfo>> personnelSource;
    private final OptionSource optionSource;
    private boolean trackingUpdates = false;

    public FOSAFormDataManager(
            Function<String, ?> valueExtractor,
            Supplier<Collection<PersonnelInfo>> personnelSource,
            BiFunction<String, Integer, String> keyMaker,
            Function<String, String> keyExtractor,
            OptionSource optionSource) {
        super(valueExtractor, keyMaker, keyExtractor);
        this.personnelSource = personnelSource;
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
        division = new SimpleObjectProperty<>(this, "department");
        cscDistance = new SimpleDoubleProperty(this, "cscDistance");
        dhis2Usage = new SimpleBooleanProperty(this, "dhis2Usage");
        bunecBirthFormUsage = new SimpleBooleanProperty(this, "bunecBirthFormUsage");
        dhis2FormUsage = new SimpleBooleanProperty(this, "dhis2FormUsage");
        birthDeclarationToCsc = new SimpleBooleanProperty(this, "birthDeclarationToCsc");
        internetConnectionAvailable = new SimpleBooleanProperty(this, "internetConnectionAvailable");
        statsYear1 = new SimpleIntegerProperty();
        statsYear2 = new SimpleIntegerProperty();
        statsYear3 = new SimpleIntegerProperty();
        statsYear4 = new SimpleIntegerProperty();
        statsYear5 = new SimpleIntegerProperty();
        deathCount1 = new SimpleIntegerProperty();
        deathCount2 = new SimpleIntegerProperty();
        deathCount3 = new SimpleIntegerProperty();
        deathCount4 = new SimpleIntegerProperty();
        deathCount5 = new SimpleIntegerProperty();
        birthCount1 = new SimpleIntegerProperty();
        birthCount2 = new SimpleIntegerProperty();
        birthCount3 = new SimpleIntegerProperty();
        birthCount4 = new SimpleIntegerProperty();
        birthCount5 = new SimpleIntegerProperty();
        device = new SimpleObjectProperty<>();
        deviceOptions = new SimpleListProperty<>(FXCollections.observableArrayList());
        setupChangeListeners();
    }

    @Override
    @SuppressWarnings("DuplicatedCode")
    public void trackFieldChanges() {
        if (trackingUpdates) {
            log.debug("Already tracking fields, skipping.");
            return;
        }
        trackUpdatesForField(FieldKeys.Fosa.RESPONDING_DEVICE);
        trackUpdatesForField(FieldKeys.Fosa.STATS_YEAR_1);
        trackUpdatesForField(FieldKeys.Fosa.STATS_YEAR_2);
        trackUpdatesForField(FieldKeys.Fosa.STATS_YEAR_3);
        trackUpdatesForField(FieldKeys.Fosa.STATS_YEAR_4);
        trackUpdatesForField(FieldKeys.Fosa.STATS_YEAR_5);
        trackUpdatesForField(FieldKeys.Fosa.STATS_BIRTH_COUNT_1);
        trackUpdatesForField(FieldKeys.Fosa.STATS_BIRTH_COUNT_2);
        trackUpdatesForField(FieldKeys.Fosa.STATS_BIRTH_COUNT_3);
        trackUpdatesForField(FieldKeys.Fosa.STATS_BIRTH_COUNT_4);
        trackUpdatesForField(FieldKeys.Fosa.STATS_BIRTH_COUNT_5);
        trackUpdatesForField(FieldKeys.Fosa.STATS_DEATH_COUNT_1);
        trackUpdatesForField(FieldKeys.Fosa.STATS_DEATH_COUNT_2);
        trackUpdatesForField(FieldKeys.Fosa.STATS_DEATH_COUNT_3);
        trackUpdatesForField(FieldKeys.Fosa.STATS_DEATH_COUNT_4);
        trackUpdatesForField(FieldKeys.Fosa.STATS_DEATH_COUNT_5);
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
        trackUpdatesForField(FieldKeys.Fosa.CREATION_DATE);
        trackUpdatesForField(FieldKeys.Fosa.RESPONDENT_NAME);
        trackUpdatesForField(FieldKeys.Fosa.POSITION);
        trackUpdatesForField(FieldKeys.Fosa.PHONE);
        trackUpdatesForField(FieldKeys.Fosa.MAIL);
        trackingUpdates = true;
        log.debug("Tracking field changes");
    }

    @Override
    public String getIndexFieldKey() {
        return FieldKeys.Fosa.INDEX;
    }

    @Override
    protected String getValidationCodeFieldKey() {
        return FieldKeys.Fosa.VALIDATION_CODE;
    }

    public void updateGeoPointUpdates() {
        final var entry = changes.computeIfAbsent(FieldKeys.Fosa.GEO_POINT,
                k -> new FieldChange(k, null, this.geoPoint.getValue(), 0, false));
        entry.setNewValue(this.geoPoint.getValue());
    }

    private void setupChangeListeners() {
        division.addListener((ob, ov, nv) -> {
            if (nv == null) {
                municipalitiesProperty().clear();
                municipality.set(null);
                return;
            }
            municipalities.setAll(optionSource.findOptions("commune", ((String) nv.value())));
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
            healthAreas.setAll(optionSource.findOptions("airesante", ((String) nv.value())));
        });
    }

    private void loadPersonnelInfo() {
        final var allPersonnel = personnelSource.get();
        personnelInfo.clear();
        personnelInfo.addAll(allPersonnel);
    }

    public void loadValues() {
        super.loadValues();
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
                .build());

        loadOptionValue(FieldKeys.Fosa.RESPONDING_DEVICE);
        loadOptionValue(FieldKeys.Fosa.ENVIRONMENT_TYPE);
        loadOptionValue(FieldKeys.Fosa.WATER_SOURCES);
        loadOptionValue(FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS);
        loadOptionValue(FieldKeys.Fosa.HEALTH_AREA);
        loadOptionValue(FieldKeys.Fosa.DISTRICT);
        loadOptionValue(FieldKeys.Fosa.FACILITY_TYPE);
        loadOptionValue(FieldKeys.Fosa.STATUS);
        loadOptionValue(FieldKeys.Fosa.BACKUP_POWER_SOURCES);
        loadOptionValue(FieldKeys.Fosa.STATS_YEAR_1);
        loadOptionValue(FieldKeys.Fosa.STATS_YEAR_2);
        loadOptionValue(FieldKeys.Fosa.STATS_YEAR_3);
        loadOptionValue(FieldKeys.Fosa.STATS_YEAR_4);
        loadOptionValue(FieldKeys.Fosa.STATS_YEAR_5);
        loadOptionValue(FieldKeys.Fosa.STATS_BIRTH_COUNT_1);
        loadOptionValue(FieldKeys.Fosa.STATS_BIRTH_COUNT_2);
        loadOptionValue(FieldKeys.Fosa.STATS_BIRTH_COUNT_3);
        loadOptionValue(FieldKeys.Fosa.STATS_BIRTH_COUNT_4);
        loadOptionValue(FieldKeys.Fosa.STATS_BIRTH_COUNT_5);
        loadOptionValue(FieldKeys.Fosa.STATS_DEATH_COUNT_1);
        loadOptionValue(FieldKeys.Fosa.STATS_DEATH_COUNT_2);
        loadOptionValue(FieldKeys.Fosa.STATS_DEATH_COUNT_3);
        loadOptionValue(FieldKeys.Fosa.STATS_DEATH_COUNT_4);
        loadOptionValue(FieldKeys.Fosa.STATS_DEATH_COUNT_5);
    }

    private void loadOptionValue(String field) {
        Optional.ofNullable(valueSource.apply(field))
                .map(String::valueOf)
                .filter(StringUtils::isNotBlank)
                .map(v -> deserializeValue(v, field))
                .ifPresent(v -> this.getPropertyFor(field).setValue(v));
    }

    @Override
    @SuppressWarnings("rawtypes,DuplicatedCode")
    public Property getPropertyFor(String id) {
        if (StringUtils.isBlank(id))
            return null;
        else if (Arrays.stream(FieldKeys.PersonnelInfo.ALL_FIELDS).anyMatch(id::startsWith))
            return personnelInfo;
        return switch (id) {
            case FieldKeys.Fosa.STATS_YEAR_1 -> statsYear1;
            case FieldKeys.Fosa.STATS_DEATH_COUNT_1 -> deathCount1;
            case FieldKeys.Fosa.STATS_BIRTH_COUNT_1 -> birthCount1;
            case FieldKeys.Fosa.STATS_YEAR_2 -> statsYear2;
            case FieldKeys.Fosa.STATS_DEATH_COUNT_2 -> deathCount2;
            case FieldKeys.Fosa.STATS_BIRTH_COUNT_2 -> birthCount2;
            case FieldKeys.Fosa.STATS_YEAR_3 -> statsYear3;
            case FieldKeys.Fosa.STATS_DEATH_COUNT_3 -> deathCount3;
            case FieldKeys.Fosa.STATS_BIRTH_COUNT_3 -> birthCount3;
            case FieldKeys.Fosa.STATS_YEAR_4 -> statsYear4;
            case FieldKeys.Fosa.STATS_DEATH_COUNT_4 -> deathCount4;
            case FieldKeys.Fosa.STATS_BIRTH_COUNT_4 -> birthCount4;
            case FieldKeys.Fosa.STATS_YEAR_5 -> statsYear5;
            case FieldKeys.Fosa.STATS_DEATH_COUNT_5 -> deathCount5;
            case FieldKeys.Fosa.STATS_BIRTH_COUNT_5 -> birthCount5;
            case FieldKeys.Fosa.PERSONNEL_COUNT -> personnelCount;
            case FieldKeys.Fosa.CREATION_DATE -> creationDate;
            case FieldKeys.Fosa.MAIL -> email;
            case FieldKeys.Fosa.PHONE -> phone;
            case FieldKeys.Fosa.POSITION -> position;
            case FieldKeys.Fosa.RESPONDENT_NAME -> respondentNames;
            case FieldKeys.Fosa.DIVISION -> division;
            case FieldKeys.Fosa.MUNICIPALITY -> municipality;
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
            case FieldKeys.Fosa.BACKUP_POWER_SOURCES -> emergencyPowerSources;
            case FieldKeys.Fosa.HAS_INTERNET_CONNECTION -> internetConnectionAvailable;
            case FieldKeys.Fosa.WATER_SOURCES -> waterSources;
            case FieldKeys.Fosa.ENVIRONMENT_TYPE -> environmentType;
            case FieldKeys.Fosa.PC_COUNT -> pcCount;
            case FieldKeys.Fosa.PRINTER_COUNT -> printerCount;
            case FieldKeys.Fosa.TABLET_COUNT -> tabletCount;
            case FieldKeys.Fosa.CAR_COUNT -> carCount;
            case FieldKeys.Fosa.BIKE_COUNT -> bikeCount;
            case FieldKeys.Fosa.RESPONDING_DEVICE -> device;
            default -> super.getPropertyFor(id);
        };
    }

    @Override
    @SuppressWarnings("DuplicatedCode")
    public ListProperty<Option> getOptionsFor(String id) {
        return switch (id) {
            case FieldKeys.Fosa.STATUS -> fosaStatusTypes;
            case FieldKeys.Fosa.FACILITY_TYPE -> fosaTypes;
            case FieldKeys.Fosa.HEALTH_AREA -> healthAreas;
            case FieldKeys.Fosa.DISTRICT -> districts;
            case FieldKeys.Fosa.DIVISION -> divisions;
            case FieldKeys.Fosa.MUNICIPALITY -> municipalities;
            case FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS -> eventRegistrationTypes;
            case FieldKeys.Fosa.WATER_SOURCES -> waterSourceTypes;
            case FieldKeys.Fosa.ENVIRONMENT_TYPE -> environmentTypes;
            case FieldKeys.Fosa.BACKUP_POWER_SOURCES -> emergencyPowerSourceTypes;
            case FieldKeys.Fosa.RESPONDING_DEVICE -> deviceOptions;
            default -> null;
        };
    }

    @Override
    public Class<?> getPropertyTypeFor(String id) {
        if (Arrays.stream(FieldKeys.PersonnelInfo.ALL_FIELDS).anyMatch(id::startsWith))
            return PersonnelInfo.class;
        return switch (id) {
            case FieldKeys.Fosa.CREATION_DATE -> LocalDate.class;
            case FieldKeys.Fosa.MAIL, FieldKeys.Fosa.ATTACHED_CSC, FieldKeys.Fosa.OFFICE_NAME, FieldKeys.Fosa.PHONE,
                    FieldKeys.Fosa.POSITION, FieldKeys.Fosa.RESPONDENT_NAME, FieldKeys.Fosa.QUARTER,
                    FieldKeys.Fosa.LOCALITY -> String.class;
            case FieldKeys.Fosa.RESPONDING_DEVICE,
                    FieldKeys.Fosa.STATUS, FieldKeys.Fosa.FACILITY_TYPE, FieldKeys.Fosa.HEALTH_AREA,
                    FieldKeys.Fosa.DISTRICT, FieldKeys.Fosa.DIVISION, FieldKeys.Fosa.MUNICIPALITY,
                    FieldKeys.Fosa.ENVIRONMENT_TYPE -> Option.class;
            case FieldKeys.Fosa.HAS_INTERNET_CONNECTION, FieldKeys.Fosa.HAS_TOILET_FIELD,
                    FieldKeys.Fosa.SEND_BIRTH_DECLARATIONS_TO_CSC, FieldKeys.Fosa.USES_DHIS_FORMS,
                    FieldKeys.Fosa.USES_BUNEC_BIRTH_FORM, FieldKeys.Fosa.HAS_MATERNITY,
                    FieldKeys.Fosa.HAS_ENEO_CONNECTION, FieldKeys.Fosa.HAS_BACKUP_POWER_SOURCE,
                    FieldKeys.Fosa.USES_DHIS -> Boolean.class;
            case FieldKeys.Fosa.CSC_DISTANCE -> Double.class;
            case FieldKeys.Fosa.GEO_POINT -> GeoPoint.class;
            case FieldKeys.Fosa.CSC_EVENT_REGISTRATIONS, FieldKeys.Fosa.WATER_SOURCES,
                    FieldKeys.Fosa.BACKUP_POWER_SOURCES -> List.class;
            case FieldKeys.Fosa.STATS_YEAR_1,
                    FieldKeys.Fosa.STATS_DEATH_COUNT_1,
                    FieldKeys.Fosa.STATS_BIRTH_COUNT_1,
                    FieldKeys.Fosa.STATS_YEAR_2,
                    FieldKeys.Fosa.STATS_DEATH_COUNT_2,
                    FieldKeys.Fosa.STATS_BIRTH_COUNT_2,
                    FieldKeys.Fosa.STATS_YEAR_3,
                    FieldKeys.Fosa.STATS_DEATH_COUNT_3,
                    FieldKeys.Fosa.STATS_BIRTH_COUNT_3,
                    FieldKeys.Fosa.STATS_YEAR_4,
                    FieldKeys.Fosa.STATS_DEATH_COUNT_4,
                    FieldKeys.Fosa.STATS_BIRTH_COUNT_4,
                    FieldKeys.Fosa.STATS_YEAR_5,
                    FieldKeys.Fosa.STATS_DEATH_COUNT_5,
                    FieldKeys.Fosa.STATS_BIRTH_COUNT_5,
                    FieldKeys.Fosa.PERSONNEL_COUNT,
                    FieldKeys.Fosa.PC_COUNT,
                    FieldKeys.Fosa.PRINTER_COUNT,
                    FieldKeys.Fosa.TABLET_COUNT,
                    FieldKeys.Fosa.CAR_COUNT,
                    FieldKeys.Fosa.BIKE_COUNT -> Integer.class;
            case FieldKeys.PersonnelInfo.PERSONNEL_AGE, FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL,
                    FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL, FieldKeys.PersonnelInfo.PERSONNEL_NAME, FieldKeys.PersonnelInfo.PERSONNEL_GENDER,
                    FieldKeys.PersonnelInfo.PERSONNEL_PHONE, FieldKeys.PersonnelInfo.PERSONNEL_EMAIL, FieldKeys.PersonnelInfo.PERSONNEL_POSITION,
                    FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING -> PersonnelInfo.class;
            default -> super.getPropertyTypeFor(id);
        };
    }

    public void loadInitialOptions() {
        divisions.setAll(optionSource.findOptions("division", "01"));
        environmentTypes.setAll(optionSource.findOptions("vb2qk85"));
        districts.setAll(optionSource.findOptions("district"));
        fosaTypes.setAll(optionSource.findOptions("pa9ii12"));
        fosaStatusTypes.setAll(optionSource.findOptions("qy7we33"));
        eventRegistrationTypes.setAll(optionSource.findOptions("ij2ql10"));
        emergencyPowerSourceTypes.setAll(optionSource.findOptions("xt53f30"));
        waterSourceTypes.setAll(optionSource.findOptions("zp4ec39"));
        genders.setAll(optionSource.findOptions("xw39g10"));
        educationLevels.setAll(optionSource.findOptions("ta2og93"));
        computerKnowledgeLevels.setAll(optionSource.findOptions("nz2pr56"));
        deviceOptions.setAll(optionSource.findOptions("ju6tz85"));
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

    public IntegerProperty statsYear1Property() {
        return statsYear1;
    }

    public IntegerProperty statsYear2Property() {
        return statsYear2;
    }

    public IntegerProperty statsYear3Property() {
        return statsYear3;
    }

    public IntegerProperty statsYear4Property() {
        return statsYear4;
    }

    public IntegerProperty statsYear5Property() {
        return statsYear5;
    }

    public IntegerProperty birthCount1Property() {
        return birthCount1;
    }

    public IntegerProperty birthCount2Property() {
        return birthCount2;
    }

    public IntegerProperty birthCount3Property() {
        return birthCount3;
    }

    public IntegerProperty birthCount4Property() {
        return birthCount4;
    }

    public IntegerProperty birthCount5Property() {
        return birthCount5;
    }

    public IntegerProperty deathCount1Property() {
        return deathCount1;
    }

    public IntegerProperty deathCount2Property() {
        return deathCount2;
    }

    public IntegerProperty deathCount3Property() {
        return deathCount3;
    }

    public IntegerProperty deathCount4Property() {
        return deathCount4;
    }

    public IntegerProperty deathCount5Property() {
        return deathCount5;
    }

    public ObjectProperty<Option> deviceProperty() {
        return device;
    }

    public ListProperty<Option> deviceOptionsProperty() {
        return deviceOptions;
    }
}
