package fr.civipol.civilio.controller;

import dagger.Lazy;
import fr.civipol.civilio.controls.SettingsControl;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.event.NavigateEvent;
import fr.civipol.civilio.event.ProgressEvent;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.stage.ViewLoader;
import fr.civipol.civilio.ui.MenuItem;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.SelectionMode;
import javafx.scene.layout.BorderPane;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.controlsfx.control.StatusBar;

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ShellController implements AppController, Initializable {
    private static final MenuItem MENU_FORMS = new MenuItem("shell.menu.forms.title", "form-submissions");

    private final ViewLoader vl;
    private final EventBus eb;
    private final AuthService authService;
    private final ExecutorService executorService;
    private final Lazy<SettingsControl> settingsControlProvider;
    private ResourceBundle resourceRef;

    @FXML
    private StatusBar sbStatus;

    @FXML
    private ListView<MenuItem> lvMenu;

    @FXML
    private BorderPane root;

    @FXML
    void onSettingsButtonClicked(ActionEvent ignored) {
        final var settingsControl = settingsControlProvider.get();
        final var prefs = settingsControl.makePreferencesForm();
        prefs.show(true);
    }

    @FXML
    void onSignOutButtonClicked(ActionEvent ignored) {
        executorService.submit(() -> {
            try {
                authService.signOut();
            } catch (Throwable t) {
                log.error("error while signing out", t);
            }
        });
    }

    public void initialize(URL location, ResourceBundle resources) {
        this.resourceRef = resources;
        lvMenu.setItems(FXCollections.observableArrayList(MENU_FORMS));
        lvMenu.setCellFactory(param -> new ListCell<>() {
            @Override
            protected void updateItem(MenuItem item, boolean empty) {
                super.updateItem(item, empty);
                if (!empty && item != null) {
                    setText(resources.getString(item.getLocalizationKey()));
                } else {
                    setText(null);
                    setGraphic(null);
                }
            }
        });

        lvMenu.getSelectionModel().setSelectionMode(SelectionMode.SINGLE);
        lvMenu.getSelectionModel().selectedItemProperty().addListener((ob, ov, nv) -> {
            if (nv == null) return;
            eb.publish(new NavigateEvent(nv.getViewRef()));
        });

        eb.subscribe(ProgressEvent.class, this::onProgress);
        eb.subscribe(NavigateEvent.class, this::onNavigate);
        lvMenu.getSelectionModel().selectFirst();
    }

    private void onProgress(ProgressEvent event) {
        Platform.runLater(() -> {
            sbStatus.setText(resourceRef.getString(event.key()));
            sbStatus.setProgress(event.currentProgress());
        });
    }

    private void onNavigate(NavigateEvent t) {
        Platform.runLater(() -> {
            try {
                root.setCenter(vl.loadView(t.getViewRef()));
            } catch (IOException e) {
                log.error("error while navigating", e);
            }
        });
    }
}
