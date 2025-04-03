package fr.civipol.civilio;

import fr.civipol.civilio.dagger.component.DaggerUIComponent;
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

    @Override
    public void start(Stage primaryStage) {
        final var appName = System.getProperty("app.name");
        primaryStage.setTitle(appName);
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(Bootstrapper.class.getResourceAsStream("/img/Logo32x32.png"))));

        var uiComponent = DaggerUIComponent.create();
        var stageManager = uiComponent.stageManager();
        stageManager.onReady(primaryStage);
    }

    @Override
    public void init() throws IOException {
        log.info("Initializing services...");
        loadConfiguration();
    }

    private static void loadConfiguration() throws IOException {
        try (var in = Bootstrapper.class.getResourceAsStream("/application.properties")) {
            final var properties = new Properties();
            properties.load(in);
            System.getProperties().putAll(properties);
        }
    }

    public static void main(String[] args) {
        log.info("Application launching");
        launch(args);
    }

    @Override
    public void stop() {
        System.gc();
        Platform.exit();
    }
}
