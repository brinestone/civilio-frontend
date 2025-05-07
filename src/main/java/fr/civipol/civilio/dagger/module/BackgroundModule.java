package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.ElementsIntoSet;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.services.AppService;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.services.FormService;
import fr.civipol.civilio.services.UserService;
import io.minio.MinioClient;
import jakarta.inject.Singleton;
import org.controlsfx.tools.Platform;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.MalformedURLException;
import java.net.URI;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.prefs.Preferences;

@Module
public class BackgroundModule {
    private static final Logger LOGGER = LoggerFactory.getLogger(BackgroundModule.class);

    @Provides
    @Singleton
    public MinioClient minioClient() {
        try {
            final var accessKey = Preferences.userRoot().node(Constants.SETTINGS_PREFS_NODE_PATH).get(Constants.MINIO_ACCESS_KEY_NAME, null);
            final var secretKey = Preferences.userRoot().node(Constants.SETTINGS_PREFS_NODE_PATH).get(Constants.MINIO_SECRET_KEY_NAME, null);
            final var endpoint = Preferences.userRoot().node(Constants.SETTINGS_PREFS_NODE_PATH).get(Constants.MINIO_ENDPOINT_KEY_NAME, null);
            return MinioClient.builder()
                    .credentials(accessKey, secretKey)
                    .endpoint(URI.create(endpoint).toURL())
                    .build();
        } catch (MalformedURLException ex) {
            LOGGER.error("error while creating minio client", ex);
            throw new RuntimeException(ex);
        }
    }

    @Provides
    @ElementsIntoSet
    public Set<AppService> authService(AuthService authService, FormService formService, UserService userService) {
        return Set.of(authService, formService, userService);
    }

    @Provides
    @Singleton
    public ExecutorService executorService() {
        return Executors.newCachedThreadPool();
    }
}
