package fr.civipol.civilio.controller;

import fr.civipol.civilio.controls.MainMenuControl;
import fr.civipol.civilio.event.EventBus;
import jakarta.inject.Inject;
import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ShellController implements AppController {
    private final MainMenuControl mainMenu;
    private final EventBus eb;

    @FXML
    private BorderPane root;

    @FXML
    private void initialize() {
        root.setLeft(mainMenu);
    }
}
