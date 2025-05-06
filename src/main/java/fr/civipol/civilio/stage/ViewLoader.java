package fr.civipol.civilio.stage;

import fr.civipol.civilio.dagger.factory.FXMLLoaderFactory;
import jakarta.inject.Inject;
import javafx.scene.Node;
import javafx.scene.control.Dialog;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ViewLoader {
    private final FXMLLoaderFactory fxmlLoaderFactory;
    private final Map<String, Object> controllerMemo = new HashMap<>();



    public <T> Dialog<T> prepareDialog() {
        final var dialog = new Dialog<T>();
        final var stage = (Stage) dialog.getDialogPane().getScene().getWindow();
        stage.getScene().getStylesheets().add(Objects.requireNonNull(ViewLoader.class.getResource("/styles/root.css")).toExternalForm());
        stage.getIcons().add(new Image(Objects.requireNonNull(ViewLoader.class.getResourceAsStream("/img/Logo32x32.png"))));
        dialog.getDialogPane().getButtonTypes().clear();
        dialog.setTitle(System.getProperty("app.name"));
        return dialog;
    }
    public Optional<Object> getControllerFor(String name) {
        return Optional.ofNullable(controllerMemo.get(name));
    }
    public Node loadView(String name) throws IOException {
        System.gc();
        final var loader = fxmlLoaderFactory.newFXMLLoader();
        final var viewResource = ViewLoader.class.getResource("/views/" + name + ".fxml");
        loader.setLocation(viewResource);
        final var view = (Node) loader.load();
        controllerMemo.put(name, loader.getController());
        return view;
    }
}
