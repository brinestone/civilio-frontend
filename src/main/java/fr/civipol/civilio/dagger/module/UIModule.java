package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import fr.civipol.civilio.dagger.factory.ControllerFactory;
import fr.civipol.civilio.dagger.factory.FXMLLoaderFactory;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.stage.StageManager;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Singleton;

@Module(includes = {BackgroundModule.class, ControllerModule.class})
public class UIModule {

    @Provides
    @Singleton
    public FXMLLoaderFactory fxmlLoaderFactory(ControllerFactory controllerFactory) {
        return new FXMLLoaderFactory(controllerFactory);
    }

    @Provides
    @Singleton
    public ViewLoader viewLoader(FXMLLoaderFactory fxmlLoaderFactory) {
        return new ViewLoader(fxmlLoaderFactory);
    }

    @Provides
    @Singleton
    public StageManager stageManager(ViewLoader viewLoader, AuthService authService) {
        return new StageManager(authService, viewLoader);
    }
}
