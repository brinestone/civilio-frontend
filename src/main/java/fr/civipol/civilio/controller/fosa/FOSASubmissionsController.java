package fr.civipol.civilio.controller.fosa;

import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Inject;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.image.Image;
import javafx.stage.Modality;
import javafx.stage.Stage;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URL;
import java.util.Objects;
import java.util.ResourceBundle;

@Slf4j
//@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FOSASubmissionsController implements AppController, Initializable {
    private final ViewLoader vl;

    @Inject
    public FOSASubmissionsController(ViewLoader vl) {
        this.vl = vl;
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
    private TableView<FormSubmission> tvSubmissions;

    @FXML
    private void onAddSubmissionButtonClicked(ActionEvent ignored) {
        try {
            final var dialog = new Stage();
            dialog.initModality(Modality.APPLICATION_MODAL);
            dialog.initOwner(((Node) ignored.getSource()).getScene().getWindow());
            dialog.getIcons().add(new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/Logo32x32.png"))));

            final var viewName = "forms/fosa";
            final var view = vl.loadView(viewName);
            final var controller = (FormController) vl.getControllerFor(viewName).orElseThrow();
            controller.setOnSubmit(this::onFormSubmitted);

            dialog.setTitle("Forms::FOSA - " + System.getProperty("app.name"));
            dialog.setScene(new Scene((Parent) view));
            dialog.getScene().getStylesheets().add(Objects.requireNonNull(getClass().getResource("/styles/root.css")).toExternalForm());
            dialog.showAndWait();
        } catch (IOException | NullPointerException ex) {
            log.error("failed to load FOSA form view", ex);
        }
    }

    private void onFormSubmitted(String formSubmission) {
        // TODO: refresh the view
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {

    }
}
