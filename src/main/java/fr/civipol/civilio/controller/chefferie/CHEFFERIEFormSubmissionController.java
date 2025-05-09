package fr.civipol.civilio.controller.chefferie;

import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import jakarta.inject.Inject;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;

import java.net.URL;
import java.util.ResourceBundle;
import java.util.function.Consumer;

public class CHEFFERIEFormSubmissionController implements AppController, Initializable , FormController{



    @Inject
    public  CHEFFERIEFormSubmissionController(){

    }
    @FXML
    public void onSubmitButtonClicked(ActionEvent ignored) {


    }
@FXML
    public void onDiscardButtonClicked(ActionEvent ignored)

    {
    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {

    }

    @Override
    public void setOnSubmit(Consumer<String> callback) {

    }
}
