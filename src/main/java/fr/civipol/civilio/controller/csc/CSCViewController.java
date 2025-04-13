package fr.civipol.civilio.controller.csc;

import fr.civipol.civilio.controller.AppController;
import jakarta.inject.Inject;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.ChoiceBox;
import javafx.scene.layout.BorderPane;
import lombok.RequiredArgsConstructor;

import java.net.URL;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class CSCViewController implements AppController, Initializable {
    private final ExecutorService executorService;

    @FXML
    private BorderPane bpRootContainer;

    @FXML
    private ChoiceBox<?> cbDisplayMode;

    @FXML
    private Button btnAddNew;

    @Override
    public void initialize(URL location, ResourceBundle resourceBundle) {

    }
}
