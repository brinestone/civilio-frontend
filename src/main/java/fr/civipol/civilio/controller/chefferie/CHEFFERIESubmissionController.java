package fr.civipol.civilio.controller.chefferie;

import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Inject;
import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.stage.Stage;
import lombok.extern.slf4j.Slf4j;

import java.net.URL;
import java.util.ResourceBundle;

import static javafx.application.Application.launch;


@Slf4j
public class CHEFFERIESubmissionController implements AppController, Initializable {
    
    private final ViewLoader vl;
    
    @Inject
    public CHEFFERIESubmissionController (ViewLoader vl){
        this.vl= vl;
    }

    public static void main(String[] args) {
        launch(args);
    }

    //@Override
    public void start(Stage primaryStage) {

    }

    @Inject
    public CHEFFERIESubmissionController(ViewLoader vl){

        this.vl = vl;
    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {

    }

    public void onAddSubmissionButtonClicked(ActionEvent ignored){

}
}
