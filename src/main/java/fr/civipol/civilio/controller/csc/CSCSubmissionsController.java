package fr.civipol.civilio.controller.csc;

import fr.civipol.civilio.controller.AppController;
import jakarta.inject.Inject;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;


public class CSCSubmissionsController implements AppController {

    @Inject
    public CSCSubmissionsController() {

    }
    @FXML
    private TableColumn<?, ?> tcActions;

    @FXML
    private TableColumn<?, ?> tcLastUpdatedAt;

    @FXML
    private TableColumn<?, ?> tcLastUpdatedBy;

    @FXML
    private TableColumn<?, ?> tcRecordedAt;

    @FXML
    private TableColumn<?, ?> tcSubmitted;

    @FXML
    private TableView<?> tvSubmissions;

    @FXML
    void onAddSubmissionButtonClicked(ActionEvent event) {

    }
}
