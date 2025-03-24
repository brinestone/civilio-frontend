package fr.civipol.civilio.stage;

import fr.civipol.civilio.dagger.factory.FXMLLoaderFactory;
import jakarta.inject.Inject;
import javafx.scene.Node;
import javafx.scene.control.Dialog;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.Objects;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ViewLoader {
    private final FXMLLoaderFactory fxmlLoaderFactory;

    public <T> Dialog<T> prepareDialog() {
        final var dialog = new Dialog<T>();
        final var stage = (Stage) dialog.getDialogPane().getScene().getWindow();
        stage.getScene().getStylesheets().add(Objects.requireNonNull(ViewLoader.class.getResource("/styles/root.css")).toExternalForm());
        stage.getIcons().add(new Image(Objects.requireNonNull(ViewLoader.class.getResourceAsStream("/img/Logo32x32.png"))));
        dialog.getDialogPane().getButtonTypes().clear();
        dialog.setTitle(System.getProperty("app.name"));
        return dialog;
    }

    public Node loadView(String name) throws IOException {
        final var loader = fxmlLoaderFactory.newFXMLLoader();
        final var viewResource = ViewLoader.class.getResource("/views/" + name + ".fxml");
        loader.setLocation(viewResource);
        return loader.load();
    }
}
