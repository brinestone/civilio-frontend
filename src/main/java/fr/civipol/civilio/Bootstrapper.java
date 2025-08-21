package fr.civipol.civilio;

import fr.civipol.civilio.dagger.component.AppComponent;
import fr.civipol.civilio.dagger.component.DaggerAppComponent;
import fr.civipol.civilio.event.RestartEvent;
import fr.civipol.civilio.event.ShutdownEvent;
import fr.civipol.civilio.event.StageReadyEvent;
import javafx.application.Application;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Locale;
import java.util.Objects;
import java.util.Properties;

@Slf4j
public class Bootstrapper extends Application {
    private AppComponent appComponent;
    private boolean configurationRequired;

    @Override
    public void start(Stage primaryStage) {
        final var appName = System.getProperty("app.name");
        primaryStage.setTitle(appName);
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(Bootstrapper.class.getResourceAsStream("/img/Logo32x32.png"))));

        var ignored = appComponent.stageManager();
        appComponent.eventBus().publish(new StageReadyEvent(primaryStage, configurationRequired));
        appComponent.eventBus().subscribe(RestartEvent.class, this::onRestartRequested);
    }

    private void onRestartRequested(RestartEvent ignored) {
        Restarter.restartApplication();
    }

    @Override
    public void init() throws Exception {
        log.info("Initializing services...");
        appComponent = DaggerAppComponent.create();
        loadConfiguration();
        final var services = appComponent.allServices();
        final var cm = appComponent.configManager();

        for (var service : services) {
            try {
                if (service.isConfigured(cm))
                    service.initialize();
                else {
                    log.warn("{} requires configuration", service.getClass().getSimpleName());
                    configurationRequired = true;
                    return;
                }
            } catch (SQLException ex) {
                log.error("error while initializing service: {}", service.getClass().getSimpleName(), ex);
                configurationRequired = true;
                return;
            }
        }
    }

    private void loadConfiguration() throws IOException {
        try (var in = Bootstrapper.class.getResourceAsStream("/application.properties")) {
            final var properties = new Properties();
            properties.load(in);
            System.getProperties().putAll(properties);
        }

        appComponent.configManager().loadObject(Constants.SYSTEM_LANGUAGE_KEY, String.class)
                .filter(StringUtils::isNotBlank)
                .ifPresent(s -> {
                    if (s.equalsIgnoreCase("anglais") || s.equalsIgnoreCase("english"))
                        Locale.setDefault(Locale.ENGLISH);
                    else Locale.setDefault(Locale.FRENCH);
                });
    }

    public static void main(String[] args) {
        log.info("Application launching");
        launch(args);
    }

    @Override
    public void stop() {
        appComponent.eventBus().publish(new ShutdownEvent());
    }
}
