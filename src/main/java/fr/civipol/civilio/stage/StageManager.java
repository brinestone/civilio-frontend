package fr.civipol.civilio.stage;

import com.dlsc.preferencesfx.PreferencesFxEvent;
import dagger.Lazy;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.controls.SettingsControl;
import fr.civipol.civilio.event.*;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.services.ConfigService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.NotificationPane;
import org.controlsfx.control.action.Action;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.stream.Stream;

@Slf4j
public class StageManager {
    private final AuthService authService;
    private final ResourceBundle rbs = ResourceBundle.getBundle("messages");
    private final ViewLoader viewLoader;
    private final Lazy<SettingsControl> settingsControlProvider;
    private final EventBus eventBus;
    private final Lazy<ConfigService> configManager;
    private NotificationPane notificationPane;
    private final Action restartAction = new Action(rbs.getString("stage.notificationPane.restart.actions.text"), this::onRestartButtonClicked);

    @Inject
    public StageManager(
            AuthService authService,
            ViewLoader viewLoader,
            EventBus eventBus,
            Lazy<SettingsControl> settingsControlProvider,
            Lazy<ConfigService> configManager) {
        this.settingsControlProvider = settingsControlProvider;
        this.authService = authService;
        this.viewLoader = viewLoader;
        this.eventBus = eventBus;
        this.configManager = configManager;
        eventBus.subscribe(StageReadyEvent.class, (e) -> {
            if (Platform.isFxApplicationThread())
                onStageReady(e);
            else Platform.runLater(() -> onStageReady(e));
        });
        eventBus.subscribe(SettingsUpdatedEvent.class, (e) -> {
            if (Platform.isFxApplicationThread())
                onSettingsChanged(e);
            else Platform.runLater(() -> onSettingsChanged(e));
        });
        eventBus.subscribe(RestartPendingEvent.class, (e) -> {
            if (Platform.isFxApplicationThread())
                onRestartPending(e);
            else Platform.runLater(() -> onRestartPending(e));
        });
        eventBus.subscribe(ToastEvent.class, (e) -> {
            if (Platform.isFxApplicationThread())
                onToastMessage(e);
            else Platform.runLater(() -> onToastMessage(e));
        });
    }

    private void onToastMessage(ToastEvent t) {
        notificationPane.setText(t.message());
        if (t.actions().length == 0)
            notificationPane.getActions().setAll(new Action(rbs.getString("msg.ok"), __ -> {
            }));
        else notificationPane.getActions().setAll(t.actions());
        notificationPane.show();
    }

    private void onRestartPending(RestartPendingEvent ignored) {
        notificationPane.setText(rbs.getString("msg.restart_notice"));
        notificationPane.getActions().setAll(restartAction);
        notificationPane.show();
    }

    private void onSettingsChanged(SettingsUpdatedEvent ignored) {
        eventBus.publish(new RestartPendingEvent());
    }

    private void onStageReady(StageReadyEvent event) {
        final var stage = event.stage();
        notificationPane = new NotificationPane();
        notificationPane.setText(rbs.getString("msg.restart_notice"));
        notificationPane.setCloseButtonVisible(false);
        notificationPane.getStyleClass().add(NotificationPane.STYLE_CLASS_DARK);
        notificationPane.getActions().setAll(restartAction);

        try {
            if (!configurationValid() || event.forceConfiguration()) {
                final var settingsControl = settingsControlProvider.get();
                final var form = settingsControl.makePreferencesForm();
                form.addEventHandler(PreferencesFxEvent.EVENT_PREFERENCES_SAVED, __ -> onSettingsConfigured());
                form.getView().getScene().getWindow().setOnHidden(__ -> Platform.exit());
                form.show();
                return;
            }

            if (!authService.isUserAuthed()) {
                renderAuth().ifPresentOrElse(
                        (__) -> Platform.runLater(() -> eventBus.publish(new RestartEvent())),
                        Platform::exit);
            } else {
                stage.setOnCloseRequest(__ -> Platform.exit());
                renderShell(stage);
            }
        } catch (IOException e) {
            log.error("error on stage ready", e);
            Platform.exit();
        }
    }

    private void onSettingsConfigured() {
        eventBus.publish(new RestartEvent());
    }

    private boolean configurationValid() {
        final var configManager = this.configManager.get();
        return Stream.of(
                        configManager.loadObject(Constants.DB_HOST_KEY, String.class),
                        configManager.loadObject(Constants.DB_PORT_KEY, String.class),
                        configManager.loadObject(Constants.DB_NAME_KEY, String.class),
                        configManager.loadObject(Constants.DB_USER_KEY, String.class),
                        configManager.loadObject(Constants.DB_USER_PWD_KEY, String.class))
                .map(o -> o.filter(StringUtils::isNotBlank))
                .allMatch(Optional::isPresent);
    }

    private void onRestartButtonClicked(ActionEvent ignored) {
        Platform.runLater(() -> {
            doRestartApplication();
            notificationPane.hide();
        });
    }

    private void doRestartApplication() {
        eventBus.publish(new RestartEvent());
    }

    private void renderShell(Stage stage) throws IOException {
        notificationPane.setContent(viewLoader.loadView("shell"));
        stage.setResizable(true);
        var scene = new Scene(notificationPane);
        scene.getStylesheets()
                .add(Objects.requireNonNull(StageManager.class.getResource("/styles/root.css")).toExternalForm());
        stage.setScene(scene);
        stage.show();
    }

    private Optional<Void> renderAuth() throws IOException {
        final var dialog = viewLoader.<Void>prepareDialog();
        dialog.getDialogPane().getScene().getWindow().setOnCloseRequest(__ -> Platform.exit());
        notificationPane.setContent(viewLoader.loadView("login"));
        dialog.getDialogPane().setContent(notificationPane);
        return dialog.showAndWait();
    }
}
