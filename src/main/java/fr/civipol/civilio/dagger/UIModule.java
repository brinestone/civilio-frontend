package fr.civipol.civilio.dagger;

import dagger.Module;
import dagger.Provides;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.stage.StageManager;
import fr.civipol.civilio.stage.ViewLoader;
import jakarta.inject.Singleton;

@Module(includes = {BackgroundModule.class})
public class UIModule {

    @Provides
    @Singleton
    public ViewLoader viewLoader() {
        return new ViewLoader();
    }

    @Provides
    @Singleton
    public StageManager stageManager(ViewLoader viewLoader, AuthService authService) {
        return new StageManager(authService, viewLoader);
    }
}
