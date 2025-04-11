package fr.civipol.civilio.controller;

import jakarta.inject.Inject;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;

public class ShellController implements AppController {
    @FXML
    private BorderPane root;

    @FXML
    private Button BtnButton;

    @Inject
    public ShellController() {

    }

    @FXML
    private void initialize() {

    }

    @FXML
    private void onClickButton() {
        //TO DO : Log out to the account

    }
}
