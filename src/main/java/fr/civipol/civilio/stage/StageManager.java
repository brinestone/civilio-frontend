package fr.civipol.civilio.stage;

import dagger.Lazy;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.controls.SettingsControl;
import fr.civipol.civilio.event.*;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.services.ConfigManager;
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
    private final ViewLoader viewLoader;
    private final Lazy<SettingsControl> settingsControlProvider;
    @org.jetbrains.annotations.NotNull
    private final EventBus eventBus;
    private final Lazy<ConfigManager> configManager;
    private NotificationPane notificationPane;

    @Inject
    public StageManager(
            AuthService authService,
            ViewLoader viewLoader,
            EventBus eventBus,
            Lazy<SettingsControl> settingsControlProvider,
            Lazy<ConfigManager> configManager) {
        this.settingsControlProvider = settingsControlProvider;
        this.authService = authService;
        this.viewLoader = viewLoader;
        this.eventBus = eventBus;
        this.configManager = configManager;
        eventBus.subscribe(StageReadyEvent.class, this::onReady);
        eventBus.subscribe(SettingsUpdatedEvent.class, this::onSettingsChanged);
        eventBus.subscribe(RestartPendingEvent.class, this::onRestartPending);
    }

    private void onRestartPending(RestartPendingEvent ignored) {
        Platform.runLater(notificationPane::show);
    }

    private void onSettingsChanged(SettingsUpdatedEvent ignored) {
        eventBus.publish(new RestartPendingEvent());
    }

    private void onReady(StageReadyEvent event) {
        final var stage = event.getStage();
        notificationPane = new NotificationPane();
        final var rbs = ResourceBundle.getBundle("messages");
        notificationPane.setText(rbs.getString("msg.restart_notice"));
        notificationPane.setCloseButtonVisible(false);
        notificationPane.getStyleClass().add(NotificationPane.STYLE_CLASS_DARK);
        notificationPane.getActions().add(
                new Action(rbs.getString("stage.notificationPane.restart.actions.text"), this::onRestartButtonClicked));

        try {
            if (!configurationValid()) {
                final var settingsControl = settingsControlProvider.get();
                final var form = settingsControl.makePreferencesForm();
                form.getView().getScene().getWindow().setOnHidden(this::onSettingsConfigured);
                form.show();
                return;
            }

            if (!authService.isUserAuthed()) {
                renderAuth().ifPresentOrElse(
                        (__) -> Platform.runLater(() -> onReady(event)),
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

    private void onSettingsConfigured(WindowEvent ignored) {
        eventBus.publish(new RestartEvent());
    }

    private boolean configurationValid() {
        final var configManager = this.configManager.get();
        return Stream.of(
                configManager.loadObject(Constants.DB_HOST_KEY, String.class),
                configManager.loadObject(Constants.DB_PORT_KEY, String.class),
                configManager.loadObject(Constants.DB_NAME_KEY, String.class),
                configManager.loadObject(Constants.DB_USER_KEY, String.class),
                configManager.loadObject(Constants.DB_USER_PWD_KEY, String.class),
                configManager.loadObject(Constants.MINIO_ENDPOINT_KEY_NAME, String.class),
                configManager.loadObject(Constants.MINIO_SECRET_KEY_NAME, String.class),
                configManager.loadObject(Constants.MINIO_ACCESS_KEY_NAME, String.class))
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
