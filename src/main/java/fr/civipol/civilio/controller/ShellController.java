package fr.civipol.civilio.controller;

import fr.civipol.civilio.controls.MainMenuControl;
import jakarta.inject.Inject;
import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;

public class ShellController implements AppController {
    @FXML
    private BorderPane root;
    private final MainMenuControl mainMenu;

    @Inject
    public ShellController(MainMenuControl mainMenu) {
        this.mainMenu = mainMenu;
    }

    @FXML
    private void initialize() {
        root.setLeft(mainMenu);
    }
}
