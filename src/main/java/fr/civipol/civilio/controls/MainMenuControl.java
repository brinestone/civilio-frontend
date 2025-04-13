package fr.civipol.civilio.controls;

import fr.civipol.civilio.event.EventBus;
import jakarta.inject.Inject;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;

import java.io.IOException;
import java.util.ResourceBundle;

public class MainMenuControl extends VBox implements AppControl {
    private final EventBus eventBus;

    @Inject
    public MainMenuControl(EventBus eventBus) {
        try {
            final var loader = new FXMLLoader();
            loader.setResources(ResourceBundle.getBundle("messages"));
            loader.setLocation(MainMenuControl.class.getResource("/controls/menu.fxml"));
            loader.setController(this);
            loader.setRoot(this);
            loader.load();
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        this.eventBus = eventBus;
    }
}
