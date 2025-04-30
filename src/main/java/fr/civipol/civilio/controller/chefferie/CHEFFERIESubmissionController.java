package fr.civipol.civilio.controller.chefferie;

import fr.civipol.civilio.controller.AppController;
import jakarta.inject.Inject;
import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.stage.Stage;

import java.net.URL;
import java.util.ResourceBundle;

import static javafx.application.Application.launch;

public class CHEFFERIESubmissionController implements AppController, Initializable {

    public static void main(String[] args) {
        launch(args);
    }

    //@Override
    public void start(Stage primaryStage) {

    }

    @Inject
    public CHEFFERIESubmissionController(){

    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {

    }

    public void onAddSubmissionButtonClicked(ActionEvent ignored){

}
}
