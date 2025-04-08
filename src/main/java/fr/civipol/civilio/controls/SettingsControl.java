package fr.civipol.civilio.controls;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.model.validators.StringLengthValidator;
import com.dlsc.preferencesfx.PreferencesFx;
import com.dlsc.preferencesfx.PreferencesFxEvent;
import com.dlsc.preferencesfx.formsfx.view.controls.SimplePasswordControl;
import com.dlsc.preferencesfx.model.Category;
import com.dlsc.preferencesfx.model.Group;
import com.dlsc.preferencesfx.model.Setting;
import com.dlsc.preferencesfx.util.StorageHandler;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.event.SettingsUpdatedEvent;
import jakarta.inject.Inject;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
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
    private static final String GENERAL_SETTINGS_CATEGORY_KEY = "settings.general";
    private static final String DISPLAY_SETTINGS_GROUP_KEY = "settings.general";
    private static final String LANGUAGE_SETTING_FIELD_KEY = "settings.language";
    private static final String MINIO_ENDPOINT = Constants.MINIO_ENDPOINT_KEY_NAME;
    private static final String MINIO_ACCESS_KEY = Constants.MINIO_ACCESS_KEY_NAME;
    private static final String MINIO_SECRET_KEY = Constants.MINIO_SECRET_KEY_NAME;
    private static final String API_ORIGIN_KEY = Constants.API_ORIGIN_KEY;
    private static final String WINDOW_POS_X = "WINDOW_POS_X";
    private static final String WINDOW_POS_Y = "WINDOW_POS_Y";
    private static final String WINDOW_HEIGHT = "WINDOW_HEIGHT";
    private static final String WINDOW_WIDTH = "WINDOW_WIDTH";
    private static final String DIVIDER_POSITION = "DIVIDER_POSITION";
    private static final String SELECTED_CATEGORY = "SELECTED_CATEGORY";
    private static final String ENGLISH_LOCALE_KEY = "settings.language.en";
    private static final String FRENCH_LOCALE_KEY = "settings.language.fr";
    private final Preferences prefs = Preferences.userRoot().node(Constants.SETTINGS_PREFS_NODE_PATH);
    private final ObjectProperty<String> selectedLocaleProperty = new SimpleObjectProperty<>(this, "selectedLocale", ENGLISH_LOCALE_KEY);
    private final StringProperty s3StorageEndpointProperty = new SimpleStringProperty(this, "s3Endpoint", "");
    private final StringProperty s3StorageAccessKeyProperty = new SimpleStringProperty(this, "s3AccessKey", "");
    private final StringProperty s3ServiceAccountSecretProperty = new SimpleStringProperty(this, "s3SecretKey", "");
    private final StringProperty apiOriginProperty = new SimpleStringProperty(this, "apiOrigin", "");
    private final EventBus eventBus;

    public PreferencesFx makePreferencesForm() {
        final var rbs = ResourceBundle.getBundle("messages");
        final var ts = new ResourceBundleService(rbs);
        final var secretKeyPasswordField = Field.ofPasswordType(s3ServiceAccountSecretProperty).render(SimplePasswordControl::new);
        final var localeKeys = FXCollections.observableArrayList(
                rbs.getString(ENGLISH_LOCALE_KEY),
                rbs.getString(FRENCH_LOCALE_KEY)
        );
        final var prefs = PreferencesFx.of(this,
                Category.of(GENERAL_SETTINGS_CATEGORY_KEY,
                        Group.of(DISPLAY_SETTINGS_GROUP_KEY,
                                Setting.of(LANGUAGE_SETTING_FIELD_KEY,
                                        localeKeys,
                                        selectedLocaleProperty
                                )
                        )
                ),
                Category.of("settings.advanced.title",
                        Group.of("settings.advanced.storage.title",
                                Setting.of(MINIO_ENDPOINT, s3StorageEndpointProperty)
                                        .validate(
                                                StringLengthValidator.atLeast(10, "settings.msg.value_too_short"),
                                                RegexValidator.forURL("settings.msg.invalid_url")
                                        ),
                                Setting.of(MINIO_ACCESS_KEY, s3StorageAccessKeyProperty)
                                        .validate(
                                                StringLengthValidator.atLeast(20, "settings.msg.value_too_short")
                                        ),
                                Setting.of(MINIO_SECRET_KEY, secretKeyPasswordField, s3ServiceAccountSecretProperty)
                                        .validate(StringLengthValidator.atLeast(40, "settings.msg.value_too_short"))
                        ),
                        Group.of("settings.advanced.api.title",
                                Setting.of(API_ORIGIN_KEY, apiOriginProperty)
                                        .validate(
                                                StringLengthValidator.atLeast(10, "settings.msg.value_too_short"),
                                                RegexValidator.forURL("settings.msg.invalid_url")
                                        )
                        )
                )
        ).i18n(ts);

        prefs.addEventHandler(PreferencesFxEvent.EVENT_PREFERENCES_SAVED, this::onPrefsSaved);
        prefs.dialogIcon(new Image(Objects.requireNonNull(SettingsControl.class.getResourceAsStream("/img/Logo32x32.png"))));
        prefs.dialogTitle(rbs.getString("settings.title"));
        prefs.getStylesheets().add(Objects.requireNonNull(SettingsControl.class.getResource("/styles/root.css")).toExternalForm());
        return prefs;
    }

    private void onPrefsSaved(PreferencesFxEvent preferencesFxEvent) {
        final var prefKeys = List.of(MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_ENDPOINT, LANGUAGE_SETTING_FIELD_KEY);
        for (var key : prefKeys) {
            System.setProperty(key, Optional.ofNullable(prefs.get(key, null))
                    .filter(StringUtils::isNotBlank)
                    .filter(s -> !s.equalsIgnoreCase("null"))
                    .orElse(""));
        }
        eventBus.publish(new SettingsUpdatedEvent());
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
        final var key = extractKey(breadcrumb);
        final var value = serialize(object);
        prefs.put(key, value);
    }

    private String extractKey(String breadcrumb) {
        final var segments = breadcrumb.split("#");
        return segments[segments.length - 1];
    }

    @Override
    public Object loadObject(String breadcrumb, Object defaultObject) {
        final var key = extractKey(breadcrumb);
        final var serialized = prefs.get(key, serialize(defaultObject));
        final var type = defaultObject == null ? Object.class : defaultObject.getClass();
        return deserialize(type, serialized);
    }

    @Override
    public <T> T loadObject(String breadcrumb, Class<T> type, T defaultObject) {
        final var serialized = prefs.get(extractKey(breadcrumb), serialize(defaultObject));
        return deserialize(type, serialized);
    }

    @Override
    @SuppressWarnings("unchecked")
    public ObservableList loadObservableList(String breadcrumb, ObservableList defaultObservableList) {
        final var serializedDefault = serialize(defaultObservableList);
        final var serialized = prefs.get(extractKey(breadcrumb), serializedDefault);
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
            final var serialized = prefs.get(extractKey(breadcrumb), serializedDefault);

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
