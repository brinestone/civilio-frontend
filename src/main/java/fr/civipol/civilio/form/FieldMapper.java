package fr.civipol.civilio.form;

import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.preferencesfx.PreferencesFx;
import com.dlsc.preferencesfx.util.StorageHandler;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.domain.FieldMappingSource;
import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.image.Image;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.Objects;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;
import java.util.function.Function;
import java.util.prefs.Preferences;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FieldMapper implements StorageHandler {
    private static final String WINDOW_POS_X = "WINDOW_POS_X";
    private static final String WINDOW_POS_Y = "WINDOW_POS_Y";
    private static final String WINDOW_HEIGHT = "WINDOW_HEIGHT";
    private static final String WINDOW_WIDTH = "WINDOW_WIDTH";
    private static final String DIVIDER_POSITION = "DIVIDER_POSITION";
    private static final String SELECTED_CATEGORY = "SELECTED_CATEGORY";
    private final FormService formService;
    private final ExecutorService executorService;
    private final Preferences prefs = Preferences.userRoot().node(Constants.FIELD_MAPPER_PREFS_NODE_PATH);

    public PreferencesFx makePrefsForm() {
        final var ts = new ResourceBundleService(ResourceBundle.getBundle("messages"));
        Function<String, FieldMappingSource> f = form -> (callback) -> executorService.submit(() -> {
            try {
                final var result = new ArrayList<>(formService.getFormFields(form));
                Platform.runLater(() -> callback.accept(result));
            } catch (Throwable t) {
                log.error("error while finding fields", t);
            }
        });
        return PreferencesFx.of(this,
                        FieldKeys.fosaFieldSettingsCategory(f.apply("fosa"))
                ).i18n(ts)
                .dialogIcon(new Image(Objects.requireNonNull(FieldMapper.class.getResourceAsStream("/img/Logo32x32.png"))))
                .dialogTitle(ts.translate("field_mapper.title"))
                .instantPersistent(true);
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

    private String extractKey(String breadcrumb) {
        final var segments = breadcrumb.split("#");
        return segments[segments.length - 1];
    }

    private String extractForm(String breadcrumb) {
        return breadcrumb.substring(0, breadcrumb.indexOf("."));
    }

    @Override
    public void saveObject(String breadcrumb, Object object) {
        final var key = extractKey(breadcrumb);
        final var form = extractForm(breadcrumb);
        executorService.submit(() -> {
            try {
                var acceptableValue = object;
                if (object instanceof String s && StringUtils.isBlank(s)) {
                    acceptableValue = null;
                }
                formService.updateFieldMapping(form, key, key, acceptableValue);
            } catch (Throwable t) {
                log.error("error while updating object: " + breadcrumb, t);
            }
        });
    }

    @Override
    public Object loadObject(String breadcrumb, Object defaultObject) {
        final var key = extractKey(breadcrumb);
        final var form = extractForm(breadcrumb);
        try {
            return formService.findFieldMapping(form, key)
                    .map(FieldMapping::dbColumn)
                    .map(Object.class::cast)
                    .orElse(defaultObject == null ? "" : defaultObject);
        } catch (Exception ex) {
            log.error("error while loading object with key: {}", key, ex);
        }
        return defaultObject;
    }

    @Override
    public <T> T loadObject(String breadcrumb, Class<T> type, T defaultObject) {
        final var key = extractKey(breadcrumb);
        final var form = extractForm(breadcrumb);
        try {
            return formService.findFieldMapping(form, key)
                    .map(FieldMapping::dbColumn)
                    .map(type::cast)
                    .orElse(defaultObject);
        } catch (Exception ex) {
            log.error("error while loading object with key: {}", key, ex);
        }
        return defaultObject;
    }

    @Override
    @SuppressWarnings("rawtypes")
    public ObservableList loadObservableList(String breadcrumb, ObservableList defaultObservableList) {
        return FXCollections.observableArrayList();
    }

    @Override
    public <T> ObservableList<T> loadObservableList(String breadcrumb, Class<T> type, ObservableList<T> defaultObservableList) {
        return FXCollections.observableArrayList();
    }

    @Override
    public boolean clearPreferences() {
        return true;
    }
}
