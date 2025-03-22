package fr.civipol.civilio.stage;

import fr.civipol.civilio.services.AuthService;
import javafx.application.Platform;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Dialog;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;

public class StageManager {
    private final AuthService authService;
    private final ViewLoader viewLoader;

    public StageManager(AuthService authService, ViewLoader viewLoader) {
        this.authService = authService;
        this.viewLoader = viewLoader;
    }

    public void onReady(Stage stage) {
        try {
            if (!authService.isUserAuthed()) {
                renderAuth().ifPresentOrElse(
                        (__) -> {
                            stage.setOnCloseRequest(___ -> Platform.exit());
                            try {
                                renderShell(stage);
                            } catch (IOException e) {
                                throw new RuntimeException(e);
                            }
                        }, Platform::exit
                );
            } else {
                stage.setOnCloseRequest(__ -> Platform.exit());
                renderShell(stage);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void renderShell(Stage stage) throws IOException {
        stage.setResizable(true);
        var scene = new Scene((Parent) viewLoader.loadTransientView("shell"));
        stage.setScene(scene);
        stage.show();
    }

    private Optional<Void> renderAuth() throws IOException {
        final var dialog = viewLoader.<Void>prepareDialog();
        dialog.getDialogPane().getScene().getWindow().setOnCloseRequest(__ -> Platform.exit());
        final var view = viewLoader.loadTransientView("login");
        dialog.getDialogPane().setContent(view);
        return dialog.showAndWait();
    }
}
