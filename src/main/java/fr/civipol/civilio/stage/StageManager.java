package fr.civipol.civilio.stage;

import fr.civipol.civilio.services.AuthService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class StageManager {
    private final AuthService authService;
    private final ViewLoader viewLoader;

//    @Inject
//    public StageManager(AuthService authService, ViewLoader viewLoader) {
//        this.authService = authService;
//        this.viewLoader = viewLoader;
//    }

    public void onReady(Stage stage) {
        try {
            if (!authService.isUserAuthed()) {
                renderAuth().ifPresentOrElse(
                        (__) -> Platform.runLater(() -> onReady(stage)),
                        Platform::exit
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
        var scene = new Scene((Parent) viewLoader.loadView("shell"));
        scene.getStylesheets().add(Objects.requireNonNull(StageManager.class.getResource("/styles/root.css")).toExternalForm());
        stage.setScene(scene);
        stage.show();
    }

    private Optional<Void> renderAuth() throws IOException {
        final var dialog = viewLoader.<Void>prepareDialog();
        dialog.getDialogPane().getScene().getWindow().setOnCloseRequest(__ -> Platform.exit());
        final var view = viewLoader.loadView("login");
        dialog.getDialogPane().setContent(view);
        return dialog.showAndWait();
    }
}
