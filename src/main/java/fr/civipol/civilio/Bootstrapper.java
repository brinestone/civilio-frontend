package fr.civipol.civilio;

import fr.civipol.civilio.beans.SpringConfig;
import fr.civipol.civilio.events.StageReadyEvent;
import javafx.application.Application;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.support.AbstractApplicationContext;

import java.util.Objects;

public class Bootstrapper extends Application {
    private AbstractApplicationContext context;

    @Override
    public void start(Stage primaryStage) {
        final var appName = context.getEnvironment().getProperty("app.name");
        primaryStage.setTitle(appName);
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(Bootstrapper.class.getResourceAsStream("/img/Logo32x32.png"))));

        context.publishEvent(new StageReadyEvent(primaryStage, this));
    }

    @Override
    public void stop() {
        context.close();
    }

    @Override
    public void init() {
        context = new AnnotationConfigApplicationContext(SpringConfig.class);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
