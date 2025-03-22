package fr.civipol.civilio.stage;

import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.control.Dialog;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.IOException;
import java.lang.ref.SoftReference;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.ResourceBundle;

record ViewControllerPair(Node view, Object controllerRef) {
}

public class ViewLoader {
    private final Map<String, SoftReference<ViewControllerPair>> viewMemo = new HashMap<>();

    public <T> Dialog<T> prepareDialog() {
        final var dialog = new Dialog<T>();
        final var stage = (Stage) dialog.getDialogPane().getScene().getWindow();
        stage.getIcons().add(new Image(Objects.requireNonNull(ViewLoader.class.getResourceAsStream("/img/Logo32x32.png"))));
        dialog.getDialogPane().getButtonTypes().clear();
        dialog.setTitle(System.getProperty("app.name"));
        return dialog;
    }

    public Node loadTransientView(String name) throws IOException {
        final var pair = doLoadView(name);
        return pair.view();
    }

    public Node loadView(String name) throws IOException {
        final var ref = viewMemo.computeIfAbsent(name, n -> {
            try {
                return new SoftReference<>(doLoadView(n));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });

        return Objects.requireNonNull(ref.get()).view();
    }

    private ViewControllerPair doLoadView(String name) throws IOException {
        final var loader = new FXMLLoader();
        loader.setResources(ResourceBundle.getBundle("messages"));
        loader.setLocation(ViewLoader.class.getResource("/views/" + name + ".fxml"));
        final var view = (Node) loader.load();
        final var controller = loader.getController();

        return new ViewControllerPair(view, controller);
    }
}
