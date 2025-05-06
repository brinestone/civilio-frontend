package fr.civipol.civilio.controller.chefferie;

import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Inject;
import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Modality;
import javafx.stage.Stage;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URL;
import java.util.Objects;
import java.util.ResourceBundle;

import static javafx.application.Application.launch;


@Slf4j
public class CHEFFERIESubmissionController implements AppController, Initializable {
    
    private final ViewLoader vl;


    @Inject
    public CHEFFERIESubmissionController(ViewLoader vl){

        this.vl = vl;
    }


    public static void main(String[] args) {
        launch(args);
    }

    //@Override
    public void start(Stage primaryStage) {

    }


    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {

    }
@FXML
    public void onAddSubmissionButtonClicked(ActionEvent ignored){
    try {
        final var dialog = new Stage();
        dialog.initModality(Modality.APPLICATION_MODAL);
        dialog.initOwner(((Node) ignored.getSource()).getScene().getWindow());
        dialog.getIcons().add(new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/Logo32x32.png"))));

        final var viewName = "forms/chefferie";
        final var view = vl.loadView(viewName);
        final var controller = (FormController) vl.getControllerFor(viewName).orElseThrow();
        controller.setOnSubmit(this::onFormSubmitted);

        dialog.setTitle("Forms::CHEFFERIE - " + System.getProperty("app.name"));
        dialog.setScene(new Scene((Parent) view));
        dialog.getScene().getStylesheets().add(Objects.requireNonNull(getClass().getResource("/styles/root.css")).toExternalForm());
        dialog.showAndWait();
    } catch (IOException | NullPointerException ex) {
        log.error("failed to load CHEFFERIE form view", ex);
    }

}

    private void onFormSubmitted(String formSubmission) {
        // TODO: refresh the view
    }

}
