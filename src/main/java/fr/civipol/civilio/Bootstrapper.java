package fr.civipol.civilio;

import fr.civipol.civilio.dagger.component.DaggerServiceComponent;
import fr.civipol.civilio.dagger.component.DaggerUIComponent;
import fr.civipol.civilio.dagger.component.ServiceComponent;
import fr.civipol.civilio.dagger.component.UIComponent;
import fr.civipol.civilio.event.Event;
import fr.civipol.civilio.event.RestartEvent;
import fr.civipol.civilio.event.StageReadyEvent;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Objects;
import java.util.Properties;

@Slf4j
public class Bootstrapper extends Application {
    private ServiceComponent serviceComponent;

    @Override
    public void start(Stage primaryStage) {
        final var appName = System.getProperty("app.name");
        primaryStage.setTitle(appName);
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(Bootstrapper.class.getResourceAsStream("/img/Logo32x32.png"))));

        UIComponent uiComponent = DaggerUIComponent.create();
        var ignored = uiComponent.stageManager();
        uiComponent.eventBus().publish(new StageReadyEvent(primaryStage));
        uiComponent.eventBus().subscribe(RestartEvent.class, this::onRestartRequested);
    }

    private void onRestartRequested(RestartEvent ignored) {
        Restarter.restartApplication();
    }

    @Override
    public void init() throws Exception {
        log.info("Initializing services...");
        serviceComponent = DaggerServiceComponent.create();
        loadConfiguration();
        final var services = serviceComponent.allServices();

        for (var service : services) {
            service.initialize();
        }
    }

    private void loadConfiguration() throws IOException {
        try (var in = Bootstrapper.class.getResourceAsStream("/application.properties")) {
            final var properties = new Properties();
            properties.load(in);
            System.getProperties().putAll(properties);
        }

        serviceComponent.configManager().loadObject(Constants.SYSTEM_LANGUAGE_KEY, String.class)
                .filter(StringUtils::isNotBlank)
                .ifPresent(s -> {
                    if (s.equalsIgnoreCase("anglais") || s.equalsIgnoreCase("english"))
                        Locale.setDefault(Locale.ENGLISH);
                    else Locale.setDefault(Locale.FRENCH);
                });
    }

    public static void main(String[] args) {
//        System.setProperty("prism.lcdtext", "false");
        log.info("Application launching");
        launch(args);
    }

    @Override
    public void stop() {
        serviceComponent.executorService().shutdown();
        System.gc();
        Platform.exit();
    }
}
