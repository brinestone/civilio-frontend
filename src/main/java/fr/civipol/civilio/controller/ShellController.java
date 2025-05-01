package fr.civipol.civilio.controller;

import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.event.NavigateEvent;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.stage.ViewLoader;
import fr.civipol.civilio.ui.MenuItem;
import jakarta.inject.Inject;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.SelectionMode;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ShellController implements AppController, Initializable {
    private static final MenuItem FOSA_FORM = new MenuItem("shell.menu.forms.fosa", "submissions/fosa");

    private final ViewLoader vl;
    private final EventBus eb;
    private final AuthService authService;
    private final ExecutorService executorService;

    @FXML
    private ListView<MenuItem> lvMenu;

    @FXML
    private BorderPane root;

    @FXML
    private TextField tfSearch;

    public void initialize(URL location, ResourceBundle resources) {
        lvMenu.setItems(FXCollections.observableArrayList(FOSA_FORM));
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

        eb.subscribe(NavigateEvent.class, this::onNavigate);
        lvMenu.getSelectionModel().selectFirst();
    }

    private void onNavigate(NavigateEvent t) {
        try {
            root.setCenter(vl.loadView(t.getViewRef()));
        } catch (IOException e) {
            log.error("error while navigating", e);
        }
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

}
