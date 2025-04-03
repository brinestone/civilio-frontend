package fr.civipol.civilio.controls;

import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.validators.CustomValidator;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.model.validators.StringLengthValidator;
import com.dlsc.preferencesfx.PreferencesFx;
import com.dlsc.preferencesfx.model.Category;
import com.dlsc.preferencesfx.model.Group;
import com.dlsc.preferencesfx.model.Setting;
import com.dlsc.preferencesfx.util.StorageHandler;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.civipol.civilio.Util;
import jakarta.inject.Inject;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.image.Image;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.*;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class SettingsControl implements AppControl, StorageHandler {
    private static final String WINDOW_POS_X = "WINDOW_POS_X";
    private static final String WINDOW_POS_Y = "WINDOW_POS_Y";
    private static final String WINDOW_HEIGHT = "WINDOW_HEIGHT";
    private static final String WINDOW_WIDTH = "WINDOW_WIDTH";
    private static final String DIVIDER_POSITION = "DIVIDER_POSITION";
    private static final String SELECTED_CATEGORY = "SELECTED_CATEGORY";
    private final Preferences prefs = Preferences.userRoot().node(System.getProperty("app.id")).node("settings");
    private final ObjectProperty<String> selectedLocaleProperty = new SimpleObjectProperty<>(this, "selectedLocale");
    private final StringProperty dbHostProperty = new SimpleStringProperty(this, "dbHost", System.getProperty("db.host"));
    private final StringProperty dbPortProperty = new SimpleStringProperty(this, "port", System.getProperty("db.port"));
    private final StringProperty dbUserProperty = new SimpleStringProperty(this, "dbUser", System.getProperty("db.user"));
    private final StringProperty dbPasswordProperty = new SimpleStringProperty(this, "dbPassword", System.getProperty("db.pwd"));
    private final BooleanProperty dbSecuredProperty = new SimpleBooleanProperty(this, "dbSecured", Boolean.parseBoolean(System.getProperty("db.secure")));

    public PreferencesFx makePreferencesForm() {
        final var rbs = ResourceBundle.getBundle("messages");
        final var ts = new ResourceBundleService(rbs);
        final var prefs = PreferencesFx.of(this,
                Category.of("settings.general",
                        Group.of("settings.display",
                                Setting.of("settings.language",
                                        FXCollections.observableArrayList(
                                                rbs.getString("settings.language.en"),
                                                rbs.getString("settings.language.fr")
                                        ),
                                        selectedLocaleProperty
                                )
                        )
                ),
                Category.of("settings.advanced.title",
                        Group.of("settings.advanced.db.title",
                                Setting.of("settings.advanced.db.host", dbHostProperty)
                                        .validate(RegexValidator.forURL("settings.invalid_url")),
                                Setting.of("settings.advanced.db.port", dbPortProperty)
                                        .validate(CustomValidator.<String>forPredicate(v -> {
                                            try {
                                                return Optional.ofNullable(v)
                                                        .filter(StringUtils::isNotBlank)
                                                        .map(Integer::parseInt)
                                                        .map(i -> i >= 1025 && i <= 65535)
                                                        .orElse(false);
                                            } catch (NumberFormatException ignored) {
                                                return false;
                                            }
                                        }, "settings.msg.invalid_port")),
                                Setting.of("settings.advanced.db.user", dbUserProperty)
                                        .validate(StringLengthValidator.atLeast(1, "settings.msg.value_required")),
//                                Setting.of("settings.advanced.db.pwd", dbPasswordProperty)
//                                        .validate(StringLengthValidator.atLeast(1, "settings.msg.value_required"))
                                Setting.of("settings.advanced.db.ssl", dbSecuredProperty)
                        )
                )
        ).i18n(ts);

        prefs.dialogIcon(new Image(Objects.requireNonNull(SettingsControl.class.getResourceAsStream("/img/Logo32x32.png"))));
        prefs.dialogTitle(rbs.getString("settings.title"));
        prefs.getStylesheets().add(Objects.requireNonNull(SettingsControl.class.getResource("/styles/root.css")).toExternalForm());

        return prefs;
    }

    @Override
    public void saveSelectedCategory(String breadcrumb) {
        prefs.put(SELECTED_CATEGORY, breadcrumb);
    }

    @Override
    public String loadSelectedCategory() {
        return prefs.get(SELECTED_CATEGORY, null);
    }

    @Override
    public void saveDividerPosition(double dividerPosition) {
        prefs.putDouble(DIVIDER_POSITION, dividerPosition);
    }

    @Override
    public double loadDividerPosition() {
        return prefs.getDouble(DIVIDER_POSITION, .2);
    }

    @Override
    public void saveWindowWidth(double windowWidth) {
        prefs.putDouble(WINDOW_WIDTH, windowWidth);
    }

    @Override
    public double loadWindowWidth() {
        return prefs.getDouble(WINDOW_WIDTH, 1000);
    }

    @Override
    public void saveWindowHeight(double windowHeight) {
        prefs.putDouble(WINDOW_HEIGHT, windowHeight);
    }

    @Override
    public double loadWindowHeight() {
        return prefs.getDouble(WINDOW_HEIGHT, 700);
    }

    @Override
    public void saveWindowPosX(double windowPosX) {
        prefs.putDouble(WINDOW_POS_X, windowPosX);
    }

    @Override
    public double loadWindowPosX() {
        return prefs.getDouble(WINDOW_POS_X, 700);
    }

    @Override
    public void saveWindowPosY(double windowPosY) {
        prefs.putDouble(WINDOW_POS_Y, windowPosY);
    }

    @Override
    public double loadWindowPosY() {
        return prefs.getDouble(WINDOW_POS_Y, 500);
    }

    private String serialize(Object obj) {
        try {
            final var mapper = new ObjectMapper();
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Error while serializing object", e);
            throw new RuntimeException(e);
        }
    }

    private <T> T deserialize(Class<T> c, String serialized) {
        try {
            final var mapper = new ObjectMapper();
            return mapper.readValue(serialized, c);
        } catch (JsonProcessingException e) {
            log.error("Error while deserializing object", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public void saveObject(String breadcrumb, Object object) {
        prefs.put(Util.digest(breadcrumb), serialize(object));
    }

    @Override
    public Object loadObject(String breadcrumb, Object defaultObject) {
        final var serialized = prefs.get(Util.digest(breadcrumb), serialize(defaultObject));
        final var type = defaultObject == null ? Object.class : defaultObject.getClass();
        return deserialize(type, serialized);
    }

    @Override
    public <T> T loadObject(String breadcrumb, Class<T> type, T defaultObject) {
        final var serialized = prefs.get(Util.digest(breadcrumb), serialize(defaultObject));
        return deserialize(type, serialized);
    }

    @Override
    @SuppressWarnings("unchecked")
    public ObservableList loadObservableList(String breadcrumb, ObservableList defaultObservableList) {
        final var serializedDefault = serialize(defaultObservableList);
        final var serialized = prefs.get(Util.digest(breadcrumb), serializedDefault);
        final var type = (Class<?>) Optional.ofNullable(defaultObservableList)
                .map(Collection::stream)
                .flatMap(Stream::findAny)
                .map(Object::getClass)
                .orElse(Object.class);

        return FXCollections.observableArrayList(deserialize(type, serialized));
    }

    @Override
    public <T> ObservableList<T> loadObservableList(String breadcrumb, Class<T> type, ObservableList<T> defaultObservableList) {
        try {
            final var serializedDefault = serialize(defaultObservableList);
            final var serialized = prefs.get(Util.digest(breadcrumb), serializedDefault);

            final var mapper = new ObjectMapper();
            final var deserialized = mapper.readValue(serialized, new TypeReference<ArrayList<T>>() {
            });
            return FXCollections.observableArrayList(deserialized);
        } catch (JsonProcessingException e) {
            log.error("Error while deserializing list", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean clearPreferences() {
        try {
            prefs.clear();
        } catch (BackingStoreException e) {
            return false;
        }
        return true;
    }
}
