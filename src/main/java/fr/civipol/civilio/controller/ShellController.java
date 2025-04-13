package fr.civipol.civilio.controller;

import fr.civipol.civilio.controls.MainMenuControl;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.services.AuthService;
import jakarta.inject.Inject;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ShellController implements AppController {
    private final MainMenuControl mainMenu;
    private final EventBus eb;
    private final AuthService authService;
    private final ExecutorService executorService;

    @FXML
    private BorderPane root;

    @FXML
    private void initialize() {
        root.setLeft(mainMenu);
    }

    private void onLogoutButtonClicked(ActionEvent event) {
        executorService.submit(() -> {
            try {
                authService.signOut();
            } catch (Exception ex) {
                log.error("Error while signing out user", ex);
            }
        });
    }
}
