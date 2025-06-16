package fr.civipol.civilio.controls;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.model.validators.RegexValidator;
import com.dlsc.formsfx.model.validators.StringLengthValidator;
import com.dlsc.preferencesfx.PreferencesFx;
import com.dlsc.preferencesfx.formsfx.view.controls.SimplePasswordControl;
import com.dlsc.preferencesfx.model.Category;
import com.dlsc.preferencesfx.model.Group;
import com.dlsc.preferencesfx.model.Setting;
import com.dlsc.preferencesfx.util.StorageHandler;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.services.ConfigManager;
import jakarta.inject.Inject;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.image.Image;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Collection;
import java.util.Locale;
import java.util.Objects;
import java.util.ResourceBundle;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class SettingsControl implements AppControl, StorageHandler {
    private static final String GENERAL_SETTINGS_CATEGORY_KEY = "settings.general";
    private static final String DISPLAY_SETTINGS_GROUP_KEY = "settings.general";
    private static final String LANGUAGE_SETTING_FIELD_KEY = Constants.SYSTEM_LANGUAGE_KEY;
    private static final String MINIO_ENDPOINT = Constants.MINIO_ENDPOINT_KEY_NAME;
    private static final String MINIO_ACCESS_KEY = Constants.MINIO_ACCESS_KEY_NAME;
    private static final String MINIO_SECRET_KEY = Constants.MINIO_SECRET_KEY_NAME;
    private static final String DB_HOST_KEY = Constants.DB_HOST_KEY;
    private static final String DB_PORT_KEY = Constants.DB_PORT_KEY;
    private static final String DB_NAME_KEY = Constants.DB_NAME_KEY;
    private static final String DB_USER_KEY = Constants.DB_USER_KEY;
    private static final String DB_PASS_KEY = Constants.DB_USER_PWD_KEY;
    private static final String WINDOW_POS_X = "WINDOW_POS_X";
    private static final String WINDOW_POS_Y = "WINDOW_POS_Y";
    private static final String WINDOW_HEIGHT = "WINDOW_HEIGHT";
    private static final String WINDOW_WIDTH = "WINDOW_WIDTH";
    private static final String DIVIDER_POSITION = "DIVIDER_POSITION";
    private static final String SELECTED_CATEGORY = "SELECTED_CATEGORY";
    private static final String ENGLISH_LOCALE_KEY = "settings.language.en";
    private static final String FRENCH_LOCALE_KEY = "settings.language.fr";
    private final Preferences prefs = Preferences.userRoot().node(Constants.SETTINGS_PREFS_NODE_PATH);
    private final ObjectProperty<String> selectedLocaleProperty = new SimpleObjectProperty<>(this, "selectedLocale", Locale.getDefault().getLanguage());
    private final StringProperty s3StorageEndpointProperty = new SimpleStringProperty(this, "s3Endpoint", "");
    private final StringProperty s3StorageAccessKeyProperty = new SimpleStringProperty(this, "s3AccessKey", "");
    private final StringProperty s3ServiceAccountSecretProperty = new SimpleStringProperty(this, "s3SecretKey", "");
    private final StringProperty dbHostProperty = new SimpleStringProperty(this, "apiOrigin", "");
    private final IntegerProperty dbPortProperty = new SimpleIntegerProperty(this, "dbPort", 5432);
    private final StringProperty dbUserProperty = new SimpleStringProperty(this, "dbUser", "");
    private final StringProperty dbNameProperty = new SimpleStringProperty(this, "dbName", "");
    private final StringProperty dbPwdProperty = new SimpleStringProperty(this, "dbPwd", "");
    private final EventBus eventBus;
    private final ConfigManager configManager;

    public PreferencesFx makePreferencesForm() {
        final var rbs = ResourceBundle.getBundle("messages");
        final var ts = new ResourceBundleService(rbs);
        final var secretKeyPasswordField = Field.ofPasswordType(s3ServiceAccountSecretProperty).render(SimplePasswordControl::new);
        final var dbPasswordField = Field.ofPasswordType(dbPwdProperty).render(SimplePasswordControl::new);
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
                        Group.of("settings.advanced.db.title",
                                Setting.of(DB_HOST_KEY, dbHostProperty)
                                        .validate(StringLengthValidator.atLeast(1, "settings.msg.value_too_short")),
                                Setting.of(DB_PORT_KEY, dbPortProperty)
                                        .validate(IntegerRangeValidator.between(1025, 65_535, "settings.msg.invalid_port")),
                                Setting.of(DB_NAME_KEY, dbNameProperty)
                                        .validate(StringLengthValidator.atLeast(1, "settings.msg.value_too_short")),
                                Setting.of(DB_USER_KEY, dbUserProperty)
                                        .validate(StringLengthValidator.atLeast(1, "settings.msg.value_required")),
                                Setting.of(DB_PASS_KEY, dbPasswordField, dbPwdProperty)
                                        .validate(StringLengthValidator.atLeast(1, "settings.msg.value_required"))
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

    @Override
    public void saveObject(String breadcrumb, Object object) {
        final var key = extractKey(breadcrumb);
        configManager.saveObject(key, object);
    }

    private String extractKey(String breadcrumb) {
        final var segments = breadcrumb.split("#");
        return segments[segments.length - 1];
    }

    @Override
    public Object loadObject(String breadcrumb, Object defaultObject) {
        final var key = extractKey(breadcrumb);
        return configManager.loadObject(key)
                .orElse(defaultObject);
    }

    @Override
    public <T> T loadObject(String breadcrumb, Class<T> type, T defaultObject) {
        final var key = extractKey(breadcrumb);
        return type.cast(
                configManager.loadObject(key, type)
                        .orElse(defaultObject)
        );
    }

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public ObservableList loadObservableList(String breadcrumb, ObservableList defaultObservableList) {
        final var key = extractKey(breadcrumb);
        return FXCollections.observableArrayList(configManager.loadObject(key, Collection.class));
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> ObservableList<T> loadObservableList(String breadcrumb, Class<T> type, ObservableList<T> defaultObservableList) {
        final var key = extractKey(breadcrumb);
        return configManager.loadObject(key, Collection.class)
                .map(type::cast)
                .map(FXCollections::observableArrayList)
                .orElse(FXCollections.observableArrayList());
    }

    @Override
    public boolean clearPreferences() {
        try {
            configManager.clear();
        } catch (BackingStoreException e) {
            return false;
        }
        return true;
    }
}
