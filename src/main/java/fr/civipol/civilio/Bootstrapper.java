package fr.civipol.civilio;

import fr.civipol.civilio.dagger.component.DaggerServiceComponent;
import fr.civipol.civilio.dagger.component.DaggerUIComponent;
import fr.civipol.civilio.dagger.component.ServiceComponent;
import fr.civipol.civilio.dagger.component.UIComponent;
import fr.civipol.civilio.event.StageReadyEvent;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Objects;
import java.util.Properties;

@Slf4j
public class Bootstrapper extends Application {
    private ServiceComponent uiComponent;

    @Override
    public void start(Stage primaryStage) {
        final var appName = System.getProperty("app.name");
        primaryStage.setTitle(appName);
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(Bootstrapper.class.getResourceAsStream("/img/Logo32x32.png"))));

        UIComponent uiComponent = DaggerUIComponent.create();
        var stageManager = uiComponent.stageManager();
        uiComponent.eventBus().publish(new StageReadyEvent(primaryStage));
    }

    @Override
    public void init() throws Exception {
        log.info("Initializing services...");
        loadConfiguration();
        ServiceComponent serviceComponent = DaggerServiceComponent.create();
        final var services = serviceComponent.allServices();

        for (var service : services) {
            service.initialize();
        }

    }

    private static void loadConfiguration() throws IOException {
        try (var in = Bootstrapper.class.getResourceAsStream("/application.properties")) {
            final var properties = new Properties();
            properties.load(in);
            System.getProperties().putAll(properties);
        }
    }

    public static void main(String[] args) {
        System.setProperty("prism.lcdtext", "false");
        log.info("Application launching");
        launch(args);
    }

    @Override
    public void stop() {
        System.gc();
        Platform.exit();
    }
}
