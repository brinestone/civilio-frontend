package fr.civipol.civilio.controller;

import jakarta.inject.Inject;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.net.URL;
import java.util.ResourceBundle;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FOSASubmissionsController implements AppController, Initializable {


    @FXML
    void onAddSubmissionButtonClicked(ActionEvent ignored) {

    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {

    }
}
