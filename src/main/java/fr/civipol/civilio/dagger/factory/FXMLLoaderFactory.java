package fr.civipol.civilio.dagger.factory;

import jakarta.inject.Inject;
import javafx.fxml.FXMLLoader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ResourceBundle;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FXMLLoaderFactory {
    private final ControllerFactory controllerFactory;

    public FXMLLoader newFXMLLoader() {
        final var loader = new FXMLLoader();
        loader.setResources(ResourceBundle.getBundle("messages"));
        loader.setControllerFactory(c -> {
            final var v = controllerFactory.apply(c);
            return v;
        });
        return loader;
    }
}
