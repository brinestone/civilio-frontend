package fr.civipol.civilio;

import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.stage.StageManager;
import fr.civipol.civilio.stage.ViewLoader;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.IOException;
import java.util.Objects;
import java.util.Properties;

public class Bootstrapper extends Application {
    private StageManager stageManager;

    @Override
    public void start(Stage primaryStage) {
        Platform.setImplicitExit(false);
        final var appName = System.getProperty("app.name");
        primaryStage.setTitle(appName);
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(Bootstrapper.class.getResourceAsStream("/img/Logo32x32.png"))));

        stageManager.onReady(primaryStage);
    }

    @Override
    public void stop() {
        System.gc();
    }

    @Override
    public void init() throws IOException {
        loadConfiguration();
        stageManager = new StageManager(new AuthService(), new ViewLoader());
    }

    private void loadConfiguration() throws IOException {
        try (var in = Bootstrapper.class.getResourceAsStream("/application.properties")) {
            final var properties = new Properties();
            properties.load(in);
            System.getProperties().putAll(properties);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
