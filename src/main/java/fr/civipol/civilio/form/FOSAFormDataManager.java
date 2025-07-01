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
import javafx.collections.ListChangeListener;
import javafx.collections.MapChangeListener;
import javafx.collections.ObservableList;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@SuppressWarnings("unchecked")
public class FOSAFormDataManager extends FormDataManager {
    private static final String DELIMITER_TOKEN_PATTERN = "[, ]";
    private static final String FORM_ID = "am5nSncmYooy8nknSHzYaz";
    public static final String FOSA_MAIL_FIELD = "q0_04_mail";
    public static final String FOSA_PHONE_FIELD = "q0_03_phone";
    public static final String FOSA_POSITION_FIELD = "q0_01_position";
    public static final String FOSA_RESPONDENT_NAME_FIELD = "q0_02_name";
    public static final String FOSA_CREATION_DATE_FIELD = "q0_06_date_creation";
    public static final String FOSA_REGION_FIELD = "q1_01_region";
    public static final String FOSA_DIVISION_FIELD = "q1_02_division";
    public static final String FOSA_MUNICIPALITY_FIELD = "q1_03_municipality";
    public static final String FOSA_QUARTER_FIELD = "q1_04_quater";
    public static final String FOSA_LOCALITY_FIELD = "q1_05_locality";
    public static final String FOSA_OFFICE_NAME_FIELD = "q1_12_officename";
    public static final String FOSA_DISTRICT_FIELD = "ds_rattachement";
    public static final String FOSA_HEALTH_AREA_FIELD = "AS_rattachement";
    public static final String FOSA_FACILITY_TYPE_FIELD = "q1_07_type_Healt_facility";
    public static final String FOSA_STATUS_FIELD = "Statut_de_la_FOSA";
    public static final String FOSA_HAS_MATERNITY_FIELD = "Existence_d_une_maternit_dans_la_FOSA";
    public static final String FOSA_ATTACHED_CSC = "cec_rattachement";
    public static final String FOSA_CSC_DISTANCE_FIELD = "q1_08_dist_from_health_facil";
    public static final String FOSA_GEO_POINT_FIELD = "q1_13_GPS_coordinates";
    public static final String FOSA_USES_DHIS_FIELD = "Est_ce_que_vous_util_formation_sanitaire_";
    public static final String FOSA_USES_BUNEC_BIRTH_FORM_FIELD = "Est_ce_que_la_FOSA_e_fourni_par_le_BUNEC";
    public static final String FOSA_USES_DHIS_FORMS_FIELD = "Une_formation_a_t_el_e_normalis_du_DHIS2";
    public static final String FOSA_SENDS_BIRTH_DECLARATION_TO_CSC = "Transmettez_vous_les_u_centre_d_tat_civil";
    public static final String FOSA_CSC_EVENT_REGISTRATIONS = "Sous_quelles_formes_s_faits_d_tat_civil_";
    private static final String FOSA_STATS_FIELD_PATTERN = "group_ce1sz98_ligne%s_%s";
    private static final String FOSA_STATS_FIELD_DEATH_SUFFIX = "colonne_1".toLowerCase();
    private static final String FOSA_STATS_FIELD_BIRTH_SUFFIX = "colonne".toLowerCase();
    private static final String FOSA_STATS_FIELD_YEAR_SUFFIX = "note".toLowerCase();
    private static final String FOSA_PERSONNEL_NAME_SUFFIX = "q12_01_name".toLowerCase();
    private static final String FOSA_PERSONNEL_POSITION_SUFFIX = "q12_02_tittle_position".toLowerCase();
    private static final String FOSA_PERSONNEL_GENDER_SUFFIX = "q12_03_gender".toLowerCase();
    private static final String FOSA_PERSONNEL_PHONE_SUFFIX = "T_l_phone".toLowerCase();
    private static final String FOSA_PERSONNEL_AGE_SUFFIX = "Age_en_ann_es".toLowerCase();
    private static final String FOSA_PERSONNEL_CS_TRAINING_SUFFIX = "Avez_vous_re_u_une_f_ion_sur_l_tat_civil_".toLowerCase();
    private static final String FOSA_PERSONNEL_EDUCATION_LEVEL_SUFFIX = "q12_08_education_level_attaine".toLowerCase();
    private static final String FOSA_PERSONNEL_COMPUTER_LEVEL_SUFFIX = "Niveau_en_informatique".toLowerCase();
    private static final String FOSA_PERSONNEL_INDEX_SUFFIX = "_index".toLowerCase();
    public static final String FOSA_HAS_TOILET_FIELD = "q6_10_bathroom_or_outhouse";
    public static final String FOSA_HAS_ENEO_CONNECTION_FIELD = "q7_01_facility_conn_power_grid";
    public static final String FOSA_HAS_BACKUP_POWER_SOURCE_FIELD = "q7_04_any_source_of_backup";
    public static final String FOSA_HAS_INTERNET_CONNECTION_FIELD = "q7_08_broadband_conn_available";
    public static final String FOSA_WATER_SOURCES_FIELD = "q6_09-0_type_eau";
    public static final String FOSA_ENVIRONMENT_TYPE_FIELD = "Milieu";
    public static final String FOSA_PC_COUNT_FIELD = "q9_02_computers";
    public static final String FOSA_PRINTER_COUNT_FIELD = "q9_03_printers";
    public static final String FOSA_TABLET_COUNT_FIELD = "q9_04_tablets";
    public static final String FOSA_CAR_COUNT_FIELD = "q9_10_car";
    public static final String FOSA_BIKE_COUNT_FIELD = "q9_11_mopeds";
    public static final String FOSA_KEY_PERSONNEL_COUNT_FIELD = "q11_01_employees_at_site";
    private static final String FOSA_PERSONNEL_INFO_KEY_PREFIX = "personnel_info_";
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
            OptionSource optionSource,
            Supplier<Stream<String>> fieldSource
    ) {
        super(valueExtractor, fieldSource);
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
        personnelInfo.addListener((ListChangeListener<PersonnelInfo>) c -> {
            var index = (String) valueSource.apply("_index");
            final var format = "personnel_info_%d_" + index + "_%s";
            BiConsumer<String, Object> fn = (k, v) -> {
                final var entry = updates.computeIfAbsent(k, kk -> new DataUpdate(kk, null, v));
                entry.setNewValue(v);
                if (Objects.equals(entry.getNewValue(), entry.getOldValue()))
                    updates.remove(k);
            };
            while (c.next()) {
                if (c.wasAdded()) {
                    for (var i = c.getFrom(); i < c.getTo(); i++) {
                        final var info = personnelInfo.get(i);
                        final var nameKey = format.formatted(i, FOSA_PERSONNEL_NAME_SUFFIX);
                        final var phoneKey = format.formatted(i, FOSA_PERSONNEL_PHONE_SUFFIX);
                        final var genderKey = format.formatted(i, FOSA_PERSONNEL_GENDER_SUFFIX);
                        final var ageKey = format.formatted(i, FOSA_PERSONNEL_AGE_SUFFIX);
                        final var roleKey = format.formatted(i, FOSA_PERSONNEL_POSITION_SUFFIX);
                        final var cskKey = format.formatted(i, FOSA_PERSONNEL_COMPUTER_LEVEL_SUFFIX);
                        final var educationKey = format.formatted(i, FOSA_PERSONNEL_EDUCATION_LEVEL_SUFFIX);
                        final var trainingKey = format.formatted(i, FOSA_PERSONNEL_CS_TRAINING_SUFFIX);

                        fn.accept(trainingKey, info.getCivilStatusTraining());
                        fn.accept(educationKey, info.getEducationLevel());
                        fn.accept(cskKey, info.getComputerKnowledgeLevel());
                        fn.accept(roleKey, info.getRole());
                        fn.accept(ageKey, info.getAge());
                        fn.accept(nameKey, info.getNames());
                        fn.accept(phoneKey, info.getPhone());
                        fn.accept(genderKey, info.getGender());
                    }
                } else if (c.wasRemoved()) {
                    for (var i = c.getFrom(); i <= c.getTo(); i++) {
                        final var nameKey = format.formatted(i, FOSA_PERSONNEL_NAME_SUFFIX);
                        final var phoneKey = format.formatted(i, FOSA_PERSONNEL_PHONE_SUFFIX);
                        final var genderKey = format.formatted(i, FOSA_PERSONNEL_GENDER_SUFFIX);
                        final var ageKey = format.formatted(i, FOSA_PERSONNEL_AGE_SUFFIX);
                        final var roleKey = format.formatted(i, FOSA_PERSONNEL_POSITION_SUFFIX);
                        final var cskKey = format.formatted(i, FOSA_PERSONNEL_COMPUTER_LEVEL_SUFFIX);
                        final var educationKey = format.formatted(i, FOSA_PERSONNEL_EDUCATION_LEVEL_SUFFIX);
                        final var trainingKey = format.formatted(i, FOSA_PERSONNEL_CS_TRAINING_SUFFIX);

                        updates.remove(nameKey);
                        updates.remove(phoneKey);
                        updates.remove(genderKey);
                        updates.remove(ageKey);
                        updates.remove(roleKey);
                        updates.remove(cskKey);
                        updates.remove(educationKey);
                        updates.remove(trainingKey);
                    }
                }
            }
        });
        vitalCSCStatsValue.addListener((ListChangeListener<FosaStat>) c -> {
            while (c.next()) {
                if (c.wasAdded()) {
                    for (var i = c.getFrom(); i < c.getTo(); i++) {
                        final var cnt = i == 0 ? "" : "_%d".formatted(i);
                        final var yearKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "note");
                        final var birthKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne");
                        final var deathKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne_1");
                        int finalI = i;
                        final var yearEntry = updates.computeIfAbsent(yearKey, k -> new DataUpdate(k, null, vitalCSCStatsValue.get(finalI).getYear()));
                        final var birthEntry = updates.computeIfAbsent(birthKey, k -> new DataUpdate(k, null, vitalCSCStatsValue.get(finalI).getRegisteredBirths()));
                        final var deathEntry = updates.computeIfAbsent(deathKey, k -> new DataUpdate(k, null, vitalCSCStatsValue.get(finalI).getRegisteredDeaths()));

                        yearEntry.setNewValue(vitalCSCStatsValue.get(i).getYear());
                        birthEntry.setNewValue(vitalCSCStatsValue.get(i).getRegisteredBirths());
                        deathEntry.setNewValue(vitalCSCStatsValue.get(i).getRegisteredDeaths());
                    }
                } else if (c.wasRemoved()) {
                    for (var i = c.getFrom(); i < c.getTo(); i++) {
                        final var cnt = i == 0 ? "" : "_%d".formatted(i);
                        final var yearKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "note");
                        final var birthKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne");
                        final var deathKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne_1");

                        updates.remove(yearKey);
                        updates.remove(birthKey);
                        updates.remove(deathKey);
                    }
                }
            }
        });
    }

    @Override
    @SuppressWarnings("DuplicatedCode")
    public void trackFieldChanges() {
        if (trackingUpdates) return;
        trackUpdatesForField(FOSA_KEY_PERSONNEL_COUNT_FIELD);
        trackUpdatesForField(FOSA_BIKE_COUNT_FIELD);
        trackUpdatesForField(FOSA_CAR_COUNT_FIELD);
        trackUpdatesForField(FOSA_TABLET_COUNT_FIELD);
        trackUpdatesForField(FOSA_PRINTER_COUNT_FIELD);
        trackUpdatesForField(FOSA_PC_COUNT_FIELD);
        trackUpdatesForField(FOSA_ENVIRONMENT_TYPE_FIELD);
        trackUpdatesForField(FOSA_WATER_SOURCES_FIELD);
        trackUpdatesForField(FOSA_HAS_INTERNET_CONNECTION_FIELD);
        trackUpdatesForField(FOSA_HAS_BACKUP_POWER_SOURCE_FIELD);
        trackUpdatesForField(FOSA_HAS_ENEO_CONNECTION_FIELD);
        trackUpdatesForField(FOSA_HAS_TOILET_FIELD);
        trackUpdatesForField(FOSA_CSC_EVENT_REGISTRATIONS);
        trackUpdatesForField(FOSA_SENDS_BIRTH_DECLARATION_TO_CSC);
        trackUpdatesForField(FOSA_USES_DHIS_FORMS_FIELD);
        trackUpdatesForField(FOSA_USES_BUNEC_BIRTH_FORM_FIELD);
        trackUpdatesForField(FOSA_USES_DHIS_FIELD);
        trackUpdatesForField(FOSA_GEO_POINT_FIELD);
        trackUpdatesForField(FOSA_CSC_DISTANCE_FIELD);
        trackUpdatesForField(FOSA_ATTACHED_CSC);
        trackUpdatesForField(FOSA_HAS_MATERNITY_FIELD);
        trackUpdatesForField(FOSA_STATUS_FIELD);
        trackUpdatesForField(FOSA_FACILITY_TYPE_FIELD);
        trackUpdatesForField(FOSA_HEALTH_AREA_FIELD);
        trackUpdatesForField(FOSA_DISTRICT_FIELD);
        trackUpdatesForField(FOSA_OFFICE_NAME_FIELD);
        trackUpdatesForField(FOSA_LOCALITY_FIELD);
        trackUpdatesForField(FOSA_QUARTER_FIELD);
        trackUpdatesForField(FOSA_MUNICIPALITY_FIELD);
        trackUpdatesForField(FOSA_DIVISION_FIELD);
        trackUpdatesForField(FOSA_REGION_FIELD);
        trackUpdatesForField(FOSA_CREATION_DATE_FIELD);
        trackUpdatesForField(FOSA_RESPONDENT_NAME_FIELD);
        trackUpdatesForField(FOSA_POSITION_FIELD);
        trackUpdatesForField(FOSA_PHONE_FIELD);
        trackUpdatesForField(FOSA_MAIL_FIELD);
        trackUpdatesForField(FOSA_KEY_PERSONNEL_COUNT_FIELD);
        trackUpdatesForField(FOSA_PC_COUNT_FIELD);
        trackMultiValueUpdates();
        trackingUpdates = true;
    }

    public void updateGeoPointUpdates() {
        final var entry = updates.computeIfAbsent(FOSA_GEO_POINT_FIELD, k -> new DataUpdate(k, null, this.geoPoint.getValue()));
        entry.setNewValue(this.geoPoint.getValue());
    }

    @SuppressWarnings("DuplicatedCode")
    public void updateTrackedCSCStatsFields() {
        for (var i = 0; i < vitalCSCStatsValue.size(); i++) {
            final var cnt = i == 0 ? "" : "_%d".formatted(i);
            final var yearKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "note");
            final var birthKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne");
            final var deathKey = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne_1");
            int finalI = i;
            final var yearEntry = updates.computeIfAbsent(yearKey, k -> new DataUpdate(k, null, vitalCSCStatsValue.get(finalI).getYear()));
            final var birthEntry = updates.computeIfAbsent(birthKey, k -> new DataUpdate(k, null, vitalCSCStatsValue.get(finalI).getRegisteredBirths()));
            final var deathEntry = updates.computeIfAbsent(deathKey, k -> new DataUpdate(k, null, vitalCSCStatsValue.get(finalI).getRegisteredDeaths()));

            yearEntry.setNewValue(vitalCSCStatsValue.get(i).getYear());
            birthEntry.setNewValue(vitalCSCStatsValue.get(i).getRegisteredBirths());
            deathEntry.setNewValue(vitalCSCStatsValue.get(i).getRegisteredDeaths());
        }
    }

    @SuppressWarnings("DuplicatedCode")
    public void updateTrackedPersonnelFields() {
        final var index = (String) valueSource.apply("_index");
        final var format = "personnel_info_%d_" + index + "_%s";
        BiConsumer<String, Object> fn = (k, v) -> {
            final var entry = updates.computeIfAbsent(k, kk -> new DataUpdate(kk, null, v));
            entry.setNewValue(v);
            if (Objects.equals(entry.getNewValue(), entry.getOldValue()))
                updates.remove(k);
        };
        for (var i = 0; i < personnelInfo.size(); i++) {
            final var info = personnelInfo.get(i);
            final var nameKey = format.formatted(i, FOSA_PERSONNEL_NAME_SUFFIX);
            final var phoneKey = format.formatted(i, FOSA_PERSONNEL_PHONE_SUFFIX);
            final var genderKey = format.formatted(i, FOSA_PERSONNEL_GENDER_SUFFIX);
            final var ageKey = format.formatted(i, FOSA_PERSONNEL_AGE_SUFFIX);
            final var roleKey = format.formatted(i, FOSA_PERSONNEL_POSITION_SUFFIX);
            final var cskKey = format.formatted(i, FOSA_PERSONNEL_COMPUTER_LEVEL_SUFFIX);
            final var educationKey = format.formatted(i, FOSA_PERSONNEL_EDUCATION_LEVEL_SUFFIX);
            final var trainingKey = format.formatted(i, FOSA_PERSONNEL_CS_TRAINING_SUFFIX);

            fn.accept(trainingKey, info.getCivilStatusTraining());
            fn.accept(educationKey, info.getEducationLevel());
            fn.accept(cskKey, info.getComputerKnowledgeLevel());
            fn.accept(roleKey, info.getRole());
            fn.accept(ageKey, info.getAge());
            fn.accept(nameKey, info.getNames());
            fn.accept(phoneKey, info.getPhone());
            fn.accept(genderKey, info.getGender());
        }
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
        final var fields = fieldSource.get()
                .filter(s -> s.startsWith(FOSA_PERSONNEL_INFO_KEY_PREFIX))
                .toList();
        for (var field : fields) {
            loadValue(field, null);
        }
    }

    private void loadVitalStats() {
        for (var i = 0; i < 5; i++) {
            final var cnt = i == 0 ? "" : String.format("_%d", i);
            final var yearField = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "note");
            final var birthCountField = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne");
            final var deathCountField = FOSA_STATS_FIELD_PATTERN.formatted(cnt, "colonne_1");

            loadValue(yearField, vitalCSCStats.getValue());
            loadValue(birthCountField, vitalCSCStats.getValue());
            loadValue(deathCountField, vitalCSCStats.getValue());
        }
    }

    public void loadValues() {
        super.loadValues();
        loadVitalStats();
        loadPersonnelInfo();
        loadValue(FOSA_KEY_PERSONNEL_COUNT_FIELD, 0);
        loadValue(FOSA_PC_COUNT_FIELD, 0);
        loadValue(FOSA_PRINTER_COUNT_FIELD, 0);
        loadValue(FOSA_TABLET_COUNT_FIELD, 0);
        loadValue(FOSA_CAR_COUNT_FIELD, 0);
        loadValue(FOSA_BIKE_COUNT_FIELD, 0);
        loadValue(FOSA_HAS_ENEO_CONNECTION_FIELD, false);
        loadValue(FOSA_HAS_BACKUP_POWER_SOURCE_FIELD, false);
        loadValue(FOSA_HAS_INTERNET_CONNECTION_FIELD, false);
        loadValue(FOSA_HAS_TOILET_FIELD, false);
        loadValue(FOSA_USES_DHIS_FIELD, false);
        loadValue(FOSA_CSC_DISTANCE_FIELD, 0.0);
        loadValue(FOSA_ATTACHED_CSC, "");
        loadValue(FOSA_HAS_MATERNITY_FIELD, false);
        loadValue(FOSA_OFFICE_NAME_FIELD, "");
        loadValue(FOSA_MAIL_FIELD, "");
        loadValue(FOSA_PHONE_FIELD, "");
        loadValue(FOSA_POSITION_FIELD, "");
        loadValue(FOSA_RESPONDENT_NAME_FIELD, "");
        loadValue(FOSA_CREATION_DATE_FIELD, null);
        loadValue(FOSA_GEO_POINT_FIELD, GeoPoint.builder()
                .latitude(3.8542679f)
                .longitude(11.4661458f)
                .build());

        loadOptionValue(FOSA_ENVIRONMENT_TYPE_FIELD);
        loadOptionValue(FOSA_WATER_SOURCES_FIELD);
        loadOptionValue(FOSA_CSC_EVENT_REGISTRATIONS);
        loadOptionValue(FOSA_HEALTH_AREA_FIELD);
        loadOptionValue(FOSA_DISTRICT_FIELD);
        loadOptionValue(FOSA_REGION_FIELD);
        loadOptionValue(FOSA_FACILITY_TYPE_FIELD);
        loadOptionValue(FOSA_STATUS_FIELD);
        loadPowerSources();
    }

    private void loadPowerSources() {
        final var fieldPattern = "q7_05-%d_sources_of_backup_power";
        final var optionsProperty = getOptionsFor(fieldPattern);
        for (var i = 0; i < optionsProperty.getSize(); i++) {
            final var field = fieldPattern.formatted(i);
            loadOptionValue(field);
        }
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

        if (id.startsWith("group_ce1sz98_ligne")) {
            return vitalCSCStats;
        } else if (id.endsWith("sources_of_backup_power")) {
            return emergencyPowerSources;
        } else if (id.startsWith(FOSA_PERSONNEL_INFO_KEY_PREFIX)) return personnelInfoMap;
        return switch (id) {
            case FOSA_KEY_PERSONNEL_COUNT_FIELD -> personnelCount;
            case FOSA_CREATION_DATE_FIELD -> creationDate;
            case FOSA_MAIL_FIELD -> email;
            case FOSA_PHONE_FIELD -> phone;
            case FOSA_POSITION_FIELD -> position;
            case FOSA_RESPONDENT_NAME_FIELD -> respondentNames;
            case FOSA_DIVISION_FIELD -> division;
            case FOSA_MUNICIPALITY_FIELD -> municipality;
            case FOSA_REGION_FIELD -> region;
            case FOSA_QUARTER_FIELD -> quarter;
            case FOSA_LOCALITY_FIELD -> locality;
            case FOSA_OFFICE_NAME_FIELD -> officeName;
            case FOSA_DISTRICT_FIELD -> district;
            case FOSA_HEALTH_AREA_FIELD -> healthArea;
            case FOSA_FACILITY_TYPE_FIELD -> fosaType;
            case FOSA_STATUS_FIELD -> fosaStatusType;
            case FOSA_HAS_MATERNITY_FIELD -> maternityAvailable;
            case FOSA_ATTACHED_CSC -> attachedCsc;
            case FOSA_CSC_DISTANCE_FIELD -> cscDistance;
            case FOSA_GEO_POINT_FIELD -> geoPoint;
            case FOSA_USES_DHIS_FIELD -> dhis2Usage;
            case FOSA_USES_BUNEC_BIRTH_FORM_FIELD -> this.bunecBirthFormUsage;
            case FOSA_USES_DHIS_FORMS_FIELD -> this.dhis2FormUsage;
            case FOSA_SENDS_BIRTH_DECLARATION_TO_CSC -> this.birthDeclarationToCsc;
            case FOSA_CSC_EVENT_REGISTRATIONS -> this.registeredEventTypes;
            case FOSA_HAS_TOILET_FIELD -> toiletAvailable;
            case FOSA_HAS_ENEO_CONNECTION_FIELD -> eneoConnection;
            case FOSA_HAS_BACKUP_POWER_SOURCE_FIELD -> emergencyPowerSourceAvailable;
            case FOSA_HAS_INTERNET_CONNECTION_FIELD -> internetConnectionAvailable;
            case FOSA_WATER_SOURCES_FIELD -> waterSources;
            case FOSA_ENVIRONMENT_TYPE_FIELD -> environmentType;
            case FOSA_PC_COUNT_FIELD -> pcCount;
            case FOSA_PRINTER_COUNT_FIELD -> printerCount;
            case FOSA_TABLET_COUNT_FIELD -> tabletCount;
            case FOSA_CAR_COUNT_FIELD -> carCount;
            case FOSA_BIKE_COUNT_FIELD -> bikeCount;
            default -> super.getPropertyFor(id);
        };
    }

    @SuppressWarnings("DuplicatedCode")
    private ListProperty<Option> getOptionsFor(String id) {
        if (id.endsWith("sources_of_backup_power")) {
            return emergencyPowerSourceTypes;
        } else if (id.startsWith(FOSA_PERSONNEL_INFO_KEY_PREFIX)) {
            if (id.endsWith(FOSA_PERSONNEL_GENDER_SUFFIX))
                return genders;
            else if (id.endsWith(FOSA_PERSONNEL_EDUCATION_LEVEL_SUFFIX))
                return educationLevels;
            else if (id.endsWith(FOSA_PERSONNEL_COMPUTER_LEVEL_SUFFIX))
                return computerKnowledgeLevels;
        }
        return switch (id) {
            case FOSA_REGION_FIELD -> regions;
            case FOSA_STATUS_FIELD -> fosaStatusTypes;
            case FOSA_FACILITY_TYPE_FIELD -> fosaTypes;
            case FOSA_HEALTH_AREA_FIELD -> healthAreas;
            case FOSA_DISTRICT_FIELD -> districts;
            case FOSA_DIVISION_FIELD -> divisions;
            case FOSA_MUNICIPALITY_FIELD -> municipalities;
            case FOSA_CSC_EVENT_REGISTRATIONS -> eventRegistrationTypes;
            case FOSA_WATER_SOURCES_FIELD -> waterSourceTypes;
            case FOSA_ENVIRONMENT_TYPE_FIELD -> environmentTypes;
            default -> null;
        };
    }

    @Override
    public Class<?> getPropertyTypeFor(String id) {
        if (id.startsWith("group_ce1sz98_ligne"))
            return FosaStat.class;
        else if (id.startsWith(FOSA_PERSONNEL_INFO_KEY_PREFIX))
            return PersonnelInfo.class;
        else if (id.endsWith("sources_of_backup_power")) {
            return List.class;
        }
        return switch (id) {
            case FOSA_CREATION_DATE_FIELD -> LocalDate.class;
            case FOSA_MAIL_FIELD, FOSA_ATTACHED_CSC, FOSA_OFFICE_NAME_FIELD, FOSA_PHONE_FIELD, FOSA_POSITION_FIELD,
                    FOSA_RESPONDENT_NAME_FIELD, FOSA_QUARTER_FIELD, FOSA_LOCALITY_FIELD -> String.class;
            case FOSA_REGION_FIELD, FOSA_STATUS_FIELD, FOSA_FACILITY_TYPE_FIELD, FOSA_HEALTH_AREA_FIELD,
                    FOSA_DISTRICT_FIELD, FOSA_DIVISION_FIELD, FOSA_MUNICIPALITY_FIELD, FOSA_ENVIRONMENT_TYPE_FIELD ->
                    Option.class;
            case FOSA_HAS_INTERNET_CONNECTION_FIELD, FOSA_HAS_TOILET_FIELD, FOSA_SENDS_BIRTH_DECLARATION_TO_CSC,
                    FOSA_USES_DHIS_FORMS_FIELD, FOSA_USES_BUNEC_BIRTH_FORM_FIELD,
                    FOSA_HAS_MATERNITY_FIELD, FOSA_HAS_ENEO_CONNECTION_FIELD, FOSA_HAS_BACKUP_POWER_SOURCE_FIELD,
                    FOSA_USES_DHIS_FIELD -> Boolean.class;
            case FOSA_CSC_DISTANCE_FIELD -> Double.class;
            case FOSA_GEO_POINT_FIELD -> GeoPoint.class;
            case FOSA_CSC_EVENT_REGISTRATIONS, FOSA_WATER_SOURCES_FIELD -> List.class;
            case FOSA_KEY_PERSONNEL_COUNT_FIELD, FOSA_PC_COUNT_FIELD, FOSA_PRINTER_COUNT_FIELD, FOSA_TABLET_COUNT_FIELD, FOSA_CAR_COUNT_FIELD, FOSA_BIKE_COUNT_FIELD ->
                    Integer.class;
            default -> super.getPropertyTypeFor(id);
        };
    }

    @Override
    @SuppressWarnings("rawtypes")
    protected final Object deserializeValue(Object raw, String id) {
        if (Optional.ofNullable(getPropertyTypeFor(id)).filter(LocalDate.class::equals).isPresent()) {
            if (raw instanceof String)
                return LocalDateTime.parse(((String) raw)).toLocalDate();
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
            if (raw instanceof String && StringUtils.isNotBlank(((String) raw)))
                return Double.valueOf(Math.max(Integer.parseInt(((String) raw)), 0.0)).intValue();
            else if (raw instanceof Double) return ((Double) raw).intValue();
            else return 0;
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(GeoPoint.class::equals).isPresent()) {
            if (raw instanceof String) {
                final var segments = ((String) raw).split(DELIMITER_TOKEN_PATTERN);
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
            if (raw instanceof Collection)
                return ((Collection) raw).stream()
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
            final var isYearField = id.endsWith(FOSA_STATS_FIELD_YEAR_SUFFIX);
            final var isBirthField = id.endsWith(FOSA_STATS_FIELD_BIRTH_SUFFIX);
            final var isDeathsField = id.endsWith(FOSA_STATS_FIELD_DEATH_SUFFIX);

            String keyPrefix;
            if (isYearField)
                keyPrefix = id.substring(0, id.indexOf(FOSA_STATS_FIELD_YEAR_SUFFIX));
            else if (isBirthField)
                keyPrefix = id.substring(0, id.indexOf(FOSA_STATS_FIELD_BIRTH_SUFFIX));
            else
                keyPrefix = id.substring(0, id.indexOf(FOSA_STATS_FIELD_DEATH_SUFFIX));

            final var entry = vitalCSCStats.computeIfAbsent(keyPrefix, __ -> FosaStat.builder().build());
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
                vitalCSCStats.remove(keyPrefix);
                vitalCSCStats.put(keyPrefix, entry);
                return vitalCSCStats.get();
            }
        } else if (raw instanceof String && Optional.ofNullable(getPropertyTypeFor(id)).filter(PersonnelInfo.class::equals).isPresent()) {
            final var isNameField = id.endsWith(FOSA_PERSONNEL_NAME_SUFFIX);
            final var isPositionField = id.endsWith(FOSA_PERSONNEL_POSITION_SUFFIX);
            final var isGenderField = id.endsWith(FOSA_PERSONNEL_GENDER_SUFFIX);
            final var isPhoneField = id.endsWith(FOSA_PERSONNEL_PHONE_SUFFIX);
            final var isAgeField = id.endsWith(FOSA_PERSONNEL_AGE_SUFFIX);
            final var isCSTrainingField = id.endsWith(FOSA_PERSONNEL_CS_TRAINING_SUFFIX);
            final var isEdLevelField = id.endsWith(FOSA_PERSONNEL_EDUCATION_LEVEL_SUFFIX);
            final var isComputerLevelField = id.endsWith(FOSA_PERSONNEL_COMPUTER_LEVEL_SUFFIX);
            final var isIndexField = id.endsWith(FOSA_PERSONNEL_INDEX_SUFFIX);
            String key = null;
            if (isNameField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_NAME_SUFFIX));
            else if (isPositionField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_POSITION_SUFFIX));
            else if (isPhoneField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_PHONE_SUFFIX));
            else if (isAgeField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_AGE_SUFFIX));
            else if (isCSTrainingField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_CS_TRAINING_SUFFIX));
            else if (isEdLevelField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_EDUCATION_LEVEL_SUFFIX));
            else if (isGenderField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_GENDER_SUFFIX));
            else if (isComputerLevelField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_COMPUTER_LEVEL_SUFFIX));
            else if (isIndexField) key = id.substring(0, id.indexOf(FOSA_PERSONNEL_INDEX_SUFFIX));

            if (key == null) return personnelInfoMap.getValue();

            final var entry = personnelInfoMap.computeIfAbsent(key, __ -> PersonnelInfo.builder()
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
            else if (isIndexField) entry.setIndex(stringValue);

            personnelInfoMap.remove(key);
            personnelInfoMap.put(key, entry);
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
