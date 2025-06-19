package fr.civipol.civilio.controller;

import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.event.ToastEvent;
import javafx.application.Platform;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonBar;
import javafx.scene.control.ButtonType;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import org.controlsfx.control.NotificationPane;
import org.controlsfx.control.action.Action;

import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.function.Supplier;

/**
 * A marker interface which is to be used for all controllers, to aid
 * in Dagger's dependency injection.
 */
public interface AppController {

    default void showAlert(String message, Alert.AlertType type) {
        Platform.runLater(() -> {
            final var alert = new Alert(type, null, ButtonType.OK);
            ((Stage) alert.getDialogPane().getScene().getWindow()).getIcons().add(new Image(Objects.requireNonNull(AppController.class.getResourceAsStream("/img/Logo32x32.png"))));
            alert.setHeaderText(message);
            alert.showAndWait();
        });
    }

    default void showErrorAlert(String message) {
        final Runnable fn = () -> {
            final var alert = new Alert(Alert.AlertType.ERROR, null, ButtonType.OK);
            ((Stage) alert.getDialogPane().getScene().getWindow()).getIcons().add(new Image(Objects.requireNonNull(AppController.class.getResourceAsStream("/img/Logo32x32.png"))));
            alert.setHeaderText(message);
            alert.showAndWait();
        };
        if (Platform.isFxApplicationThread())
            fn.run();
        else
            Platform.runLater(fn);
    }

    default Optional<Boolean> showConfirmationDialog(String message) {
        final var alert = new Alert(Alert.AlertType.CONFIRMATION, null, ButtonType.YES, ButtonType.NO);
        ((Stage) alert.getDialogPane().getScene().getWindow()).getIcons().add(new Image(Objects.requireNonNull(AppController.class.getResourceAsStream("/img/Logo32x32.png"))));
        alert.setHeaderText(message);
        return alert.showAndWait()
                .map(bt -> bt.getButtonData().equals(ButtonBar.ButtonData.YES))
                .filter(a -> a);
    }
}
