package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import fr.civipol.civilio.services.ApiService;
import fr.civipol.civilio.services.AuthService;
import jakarta.inject.Singleton;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Module
public class BackgroundModule {
    @Provides
    @Singleton
    public AuthService authService(ApiService apiService) {
        return new AuthService(apiService);
    }

    @Provides
    @Singleton
    public ApiService apiService() {
        return new ApiService();
    }

    @Provides
    @Singleton
    public ExecutorService executorService() {
        return Executors.newCachedThreadPool();
    }
}
