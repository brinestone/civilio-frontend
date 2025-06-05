package fr.civipol.civilio.controller;

import javafx.application.Platform;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonBar;
import javafx.scene.control.ButtonType;

import java.util.Optional;

/**
 * A marker interface which is to be used for all controllers, to aid
 * in Dagger's dependency injection.
 */
public interface AppController {
    default void showErrorAlert(String message) {
        Platform.runLater(() -> {
            final var alert = new Alert(Alert.AlertType.ERROR, null, ButtonType.OK);
            alert.setHeaderText(message);
            alert.showAndWait();
        });
    }

    default Optional<Boolean> showConfirmationDialog(String message) {
        final var alert = new Alert(Alert.AlertType.CONFIRMATION, null, ButtonType.YES, ButtonType.NO);
        alert.setHeaderText(message);
        return alert.showAndWait()
                .map(bt -> bt.getButtonData().equals(ButtonBar.ButtonData.YES))
                .filter(a -> a);
    }
}
