package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.services.PrefsService;
import jakarta.inject.Singleton;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Module
public class BackgroundModule {
    @Provides
    @Singleton
    public PrefsService prefsManager() {
        return new PrefsService();
    }

    @Provides
    @Singleton
    public AuthService authService(PrefsService prefsService) {
        return new AuthService(prefsService);
    }

    @Provides
    @Singleton
    public ExecutorService executorService() {
        return Executors.newCachedThreadPool();
    }
}
