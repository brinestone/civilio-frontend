package fr.civipol.civilio.controller;

import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.services.AuthService;
import jakarta.inject.Inject;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ShellController implements AppController {

    private final EventBus eb;
    private final AuthService authService;
    private final ExecutorService executorService;

    @FXML
    private BorderPane root;

    @FXML
    private Button BtnButton;



    @FXML
    private void initialize() {

    }

    @FXML
    private void onClickButton() {
        //TO DO : Log out to the account

    }


}
