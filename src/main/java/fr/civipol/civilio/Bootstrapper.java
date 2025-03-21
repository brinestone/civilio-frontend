package fr.civipol.civilio;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

import java.util.Objects;

public class Bootstrapper extends Application {
    @Override
    public void start(Stage primaryStage) {
        var scene = new Scene(new StackPane(new Label("Application can be launched")), 600, 400);
        primaryStage.setTitle("CivilIO");
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(Bootstrapper.class.getResourceAsStream("/img/Logo32x32.png"))));
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    @Override
    public void stop() throws Exception {
        super.stop();
    }

    @Override
    public void init() throws Exception {
        super.init();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
