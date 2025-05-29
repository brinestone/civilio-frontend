package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.entity.VitalCSCStat;
import fr.civipol.civilio.form.field.Option;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@SuppressWarnings("unchecked")
public class FOSAFormModel extends FormModel {
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
    private static final String FOSA_STATS_FIELD_DEATH_SUFFIX = "colonne_1";
    private static final String FOSA_STATS_FIELD_BIRTH_SUFFIX = "colonne";
    private static final String FOSA_STATS_FIELD_YEAR_SUFFIX = "note";

    private final StringProperty attachedCsc, officeName, respondentNames, position, phone, email, locality, quarter;
    private final ObjectProperty<LocalDate> creationDate;
    private final ListProperty<Option> registeredEventTypes, eventRegistrationTypes, districts, regions, divisions,
            municipalities, healthAreas, environmentTypes,
            fosaTypes, fosaStatusTypes;
    private final ObjectProperty<Option> district, region, division, municipality, healthArea, environmentType,
            fosaType, fosaStatusType;
    private final ObjectProperty<GeoPoint> geoPoint;
    private final BooleanProperty maternityAvailable, dihs2Usage, bunecBirthFormUsage, dihs2FormsUsage,
            birthDeclarationToCsc;
    private final DoubleProperty cscDistance;
    private final OptionSource optionSource;
    private final MapProperty<String, VitalCSCStat> vitalCSCStats;
    private final ListProperty<VitalCSCStat> vitalCSCStatsValue;

    public FOSAFormModel(
            Function<String, ?> valueExtractor,
            OptionSource optionSource) {
        super(valueExtractor);
        this.optionSource = optionSource;
        fosaStatusTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        municipalities = new SimpleListProperty<>(FXCollections.observableArrayList());
        fosaTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        districts = new SimpleListProperty<>(FXCollections.observableArrayList());
        environmentTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        healthAreas = new SimpleListProperty<>(FXCollections.observableArrayList());
        regions = new SimpleListProperty<>(FXCollections.observableArrayList());
        divisions = new SimpleListProperty<>(FXCollections.observableArrayList());
        eventRegistrationTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        registeredEventTypes = new SimpleListProperty<>(FXCollections.observableArrayList());
        email = new SimpleStringProperty(this, "email");
        district = new SimpleObjectProperty<>(this, "district");
        phone = new SimpleStringProperty(this, "phone");
        maternityAvailable = new SimpleBooleanProperty(this, "hasMaternity");
        position = new SimpleStringProperty(this, "position");
        attachedCsc = new SimpleStringProperty(this, "position");
        respondentNames = new SimpleStringProperty(this, "respondentNames");
        creationDate = new SimpleObjectProperty<>(this, "creationDate");
        municipality = new SimpleObjectProperty<>(this, "municipality");
        officeName = new SimpleStringProperty(this, "officeName");
        quarter = new SimpleStringProperty(this, "quarter");
        locality = new SimpleStringProperty(this, "locality");
        fosaStatusType = new SimpleObjectProperty<>(this, "statusType");
        geoPoint = new SimpleObjectProperty<>(this, "geoPoint");
        fosaType = new SimpleObjectProperty<>(this, "fosaType");
        environmentType = new SimpleObjectProperty<>(this, "environmentType");
        healthArea = new SimpleObjectProperty<>(this, "healthArea");
        region = new SimpleObjectProperty<>(this, "region");
        division = new SimpleObjectProperty<>(this, "department");
        cscDistance = new SimpleDoubleProperty(this, "cscDistance");
        dihs2Usage = new SimpleBooleanProperty(this, "dihs2Usage");
        bunecBirthFormUsage = new SimpleBooleanProperty(this, "bunecBirthFormUsage");
        dihs2FormsUsage = new SimpleBooleanProperty(this, "dihs2FormsUsage");
        birthDeclarationToCsc = new SimpleBooleanProperty(this, "birthDeclarationToCsc");
        vitalCSCStats = new SimpleMapProperty<>(this, "vitalCSCStat", FXCollections.observableHashMap());
        vitalCSCStatsValue = new SimpleListProperty<>(this, "vitalCSCStatsValue", FXCollections.observableArrayList());

        region.addListener((ob, ov, nv) -> {
            if (nv == null) {
                divisionsProperty().clear();
                division.set(null);
                return;
            }
            optionSource.populate(FORM_ID, "division", ((String) nv.value()), divisionsProperty());
        });

        division.addListener((ob, ov, nv) -> {
            if (nv == null) {
                municipalitiesProperty().clear();
                municipality.set(null);
                return;
            }
            optionSource.populate(FORM_ID, "commune", ((String) nv.value()), municipalitiesProperty());
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
            optionSource.populate(FORM_ID, "airesante", ((String) nv.value()), healthAreasProperty());
        });
        loadOptions();
        loadValues();
    }

    private void loadValue(String field, Object defaultValue) {
        final var property = getPropertyFor(field);
        if (property == null)
            return;
        final var rawValue = valueSource.apply(field);
        final var parsedValue = parseValue(rawValue, field);
        property.setValue(Optional.ofNullable(parsedValue).orElse(defaultValue));
    }

    private void loadStatsValue() {
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

    private void loadValues() {
        loadStatsValue();
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

        loadOptionValue(FOSA_CSC_EVENT_REGISTRATIONS);
        loadOptionValue(FOSA_HEALTH_AREA_FIELD);
        loadOptionValue(FOSA_DISTRICT_FIELD);
        loadOptionValue(FOSA_REGION_FIELD);
        loadOptionValue(FOSA_FACILITY_TYPE_FIELD);
        loadOptionValue(FOSA_STATUS_FIELD);
    }

    private void loadOptionValue(String field) {
        Optional.ofNullable(valueSource.apply(field))
                .map(v -> (String) v)
                .filter(StringUtils::isNotBlank)
                .map(v -> (Option) parseValue(v, field))
                .ifPresent(v -> this.getPropertyFor(field).setValue(v));
    }

    private void loadOptions() {
        optionSource.populate(FORM_ID, "region", null, regions);
        optionSource.populate(FORM_ID, "vb2qk85", null, environmentTypes);
        optionSource.populate(FORM_ID, "district", null, districts);
        optionSource.populate(FORM_ID, "pa9ii12", null, fosaTypes);
        optionSource.populate(FORM_ID, "qy7we33", null, fosaStatusTypes);
        optionSource.populate(FORM_ID, "ij2ql10", null, eventRegistrationTypes);
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Property getPropertyFor(String id) {
        if (id.startsWith("group_ce1sz98_ligne")) {
            return vitalCSCStats;
        }
        return switch (id) {
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
            case FOSA_USES_DHIS_FIELD -> dihs2Usage;
            case FOSA_USES_BUNEC_BIRTH_FORM_FIELD -> this.bunecBirthFormUsage;
            case FOSA_USES_DHIS_FORMS_FIELD -> this.dihs2FormsUsage;
            case FOSA_SENDS_BIRTH_DECLARATION_TO_CSC -> this.birthDeclarationToCsc;
            case FOSA_CSC_EVENT_REGISTRATIONS -> this.registeredEventTypes;
            default -> null;
        };
    }

    private ListProperty<Option> getOptionPropertyFor(String id) {
        return switch (id) {
            case FOSA_REGION_FIELD -> regions;
            case FOSA_STATUS_FIELD -> fosaStatusTypes;
            case FOSA_FACILITY_TYPE_FIELD -> fosaTypes;
            case FOSA_HEALTH_AREA_FIELD -> healthAreas;
            case FOSA_DISTRICT_FIELD -> districts;
            case FOSA_DIVISION_FIELD -> divisions;
            case FOSA_MUNICIPALITY_FIELD -> municipalities;
            case FOSA_CSC_EVENT_REGISTRATIONS -> eventRegistrationTypes;
            default -> null;
        };
    }

    @Override
    public Class<?> getPropertyTypeFor(String id) {
        if (id.startsWith("group_ce1sz98_ligne")) return VitalCSCStat.class;
        return switch (id) {
            case FOSA_CREATION_DATE_FIELD -> LocalDate.class;
            case FOSA_MAIL_FIELD, FOSA_ATTACHED_CSC, FOSA_OFFICE_NAME_FIELD, FOSA_PHONE_FIELD, FOSA_POSITION_FIELD,
                    FOSA_RESPONDENT_NAME_FIELD, FOSA_QUARTER_FIELD, FOSA_LOCALITY_FIELD -> String.class;
            case FOSA_REGION_FIELD, FOSA_STATUS_FIELD, FOSA_FACILITY_TYPE_FIELD, FOSA_HEALTH_AREA_FIELD,
                    FOSA_DISTRICT_FIELD, FOSA_DIVISION_FIELD, FOSA_MUNICIPALITY_FIELD -> Option.class;
            case FOSA_SENDS_BIRTH_DECLARATION_TO_CSC, FOSA_USES_DHIS_FORMS_FIELD, FOSA_USES_BUNEC_BIRTH_FORM_FIELD,
                    FOSA_HAS_MATERNITY_FIELD,
                    FOSA_USES_DHIS_FIELD -> Boolean.class;
            case FOSA_CSC_DISTANCE_FIELD -> Double.class;
            case FOSA_GEO_POINT_FIELD -> GeoPoint.class;
            case FOSA_CSC_EVENT_REGISTRATIONS -> List.class;
            default -> null;
        };
    }

    @Override
    protected final Object parseValue(Object raw, String id) {
        if (Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(LocalDate.class)).isPresent()) {
            if (raw instanceof String)
                return LocalDateTime.parse(((String) raw)).toLocalDate();
            else if (raw instanceof Date)
                return LocalDate.ofInstant(((Date) raw).toInstant(), ZoneId.systemDefault());
            else if (raw instanceof LocalDate)
                return raw;
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(Option.class)).isPresent()
                   && raw instanceof String)
            return getOptionPropertyFor(id).stream()
                    .filter(o -> o.value().equals(raw))
                    .findFirst().orElse(null);
        else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(Boolean.class)).isPresent()) {
            if (raw instanceof String && ((String) raw).equalsIgnoreCase("true") || raw instanceof String && "false".equalsIgnoreCase(((String) raw))) {
                return Boolean.valueOf(((String) raw));
            } else if (("1".equals(raw) || "2".equals(raw)))
                return "1".equals(raw);
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(Double.class)).isPresent()) {
            if (raw instanceof String && StringUtils.isNotBlank(((String) raw)))
                return Double.valueOf(((String) raw));
            else if (raw instanceof Double || raw instanceof Integer) {
                return Double.valueOf(String.valueOf(raw));
            } else
                return 0.0;
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(GeoPoint.class)).isPresent()) {
            if (raw instanceof String) {
                final var segments = ((String) raw).split(" ");
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
        } else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(String.class)).isPresent()
                   && raw instanceof String)
            return StringUtils.isNotBlank(((String) raw)) ? (String) raw : "";
        else if (Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(List.class)).isPresent()
                 && raw instanceof List) {
            return ((List<?>) raw).stream()
                    .map(o -> {
                        if (o instanceof String) {
                            return getOptionPropertyFor(id).stream()
                                    .filter(opt -> opt.value().equals(o))
                                    .findFirst().orElse(null);
                        }
                        return o;
                    })
                    .toList();
        } else if (raw instanceof String && Optional.ofNullable(getPropertyTypeFor(id)).filter(c -> c.equals(VitalCSCStat.class)).isPresent()) {
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

            final var entry = vitalCSCStats.computeIfAbsent(keyPrefix, __ -> VitalCSCStat.builder().build());
            final var stringValue = String.valueOf(raw);
            if (stringValue.matches("\\d+")) {
                final var value = stringValue.chars()
                        .mapToObj(Character.class::cast)
                        .filter(Character::isDigit)
                        .map(String::valueOf)
                        .collect(Collectors.joining(""));
                final var intValue = Integer.parseUnsignedInt(value);

                if (isYearField) entry.setYear(intValue);
                else if (isBirthField) entry.setRegisteredBirths(intValue);
                else if (isDeathsField) entry.setRegisteredDeaths(intValue);
                vitalCSCStats.put(keyPrefix, entry);
                return vitalCSCStats.get();
            }
        }
        return raw;
    }

    public Collection<VitalCSCStat> vitalCscStats() {
        return vitalCSCStats.values();
    }

    public ListProperty<VitalCSCStat> vitalCSCStatsValueProperty() {
        return vitalCSCStatsValue;
    }

    public List<Integer> getRegisteredEventTypeIndices() {
        return registeredEventTypes.stream()
                .map(eventRegistrationTypes::indexOf)
                .filter(i -> i >= 0)
                .toList();
    }

    public ListProperty<Option> eventRegistrationTypesProperty() {
        return eventRegistrationTypes;
    }

    public ListProperty<Option> registeredEventTypesProperty() {
        return registeredEventTypes;
    }

    public BooleanProperty birthDeclarationToCscProperty() {
        return birthDeclarationToCsc;
    }

    public BooleanProperty dihs2FormsUsageProperty() {
        return dihs2FormsUsage;
    }

    public BooleanProperty bunecBirthFormUsageProperty() {
        return bunecBirthFormUsage;
    }

    public BooleanProperty dihs2UsageProperty() {
        return dihs2Usage;
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
