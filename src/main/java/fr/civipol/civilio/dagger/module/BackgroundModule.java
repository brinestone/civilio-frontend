package fr.civipol.civilio.dagger.module;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import dagger.Module;
import dagger.Provides;
import dagger.multibindings.ElementsIntoSet;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.event.ShutdownEvent;
import fr.civipol.civilio.services.*;
import io.minio.MinioClient;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.net.MalformedURLException;
import java.net.URI;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Stream;

@Module
public class BackgroundModule {
    private static final Logger LOGGER = LoggerFactory.getLogger(BackgroundModule.class);

    @Provides
    @Singleton
    public DataSource dataSource(HikariConfig config, EventBus eventBus) {
        final var dataSource = new HikariDataSource(config);
        eventBus.subscribe(ShutdownEvent.class, __ -> dataSource.close());
        return dataSource;
    }

    @Provides
    @Singleton
    @SuppressWarnings("OptionalGetWithoutIsPresent")
    public HikariConfig hikariDataSource(ConfigManager cm) {
        final var host = cm.loadObject(Constants.DB_HOST_KEY, String.class);
        final var port = cm.loadObject(Constants.DB_PORT_KEY, Integer.class);
        final var dbName = cm.loadObject(Constants.DB_NAME_KEY, String.class);
        final var pass = cm.loadObject(Constants.DB_USER_PWD_KEY, String.class);
        final var user = cm.loadObject(Constants.DB_USER_KEY, String.class);
        final var useSsl = cm.loadObject(Constants.DB_USE_SSL_KEY, false);

        if (!Stream.of(host, port, dbName, pass, user).allMatch(Optional::isPresent)) {
            LOGGER.warn("datasource configuration is invalid");
            return null;
        }
        final var config = new HikariConfig();
        config.setPassword(pass.get());
        config.setUsername(user.get());
        config.setDataSourceClassName("org.postgresql.ds.PGSimpleDataSource");
        config.setJdbcUrl(String.format("jdbc:postgresql://%s:%d/%s", host.get(), port.get(), dbName.get()));
        if (useSsl) {
            config.addDataSourceProperty("sslmode", "require");
        }

        return config;
    }

    @Provides
    @Singleton
    public MinioClient minioClient(ConfigManager cm) {
        try {
            final var accessKey = cm.loadObject(Constants.MINIO_ACCESS_KEY_NAME, String.class);
            final var secretKey = cm.loadObject(Constants.MINIO_SECRET_KEY_NAME, String.class);
            final var endpoint = cm.loadObject(Constants.MINIO_ENDPOINT_KEY_NAME, String.class);

            return MinioClient.builder()
                    .credentials(accessKey.orElse(""), secretKey.orElse(""))
                    .endpoint(URI.create(endpoint.orElse("")).toURL())
                    .build();
        } catch (MalformedURLException ex) {
            LOGGER.error("error while creating minio client", ex);
            throw new RuntimeException(ex);
        }
    }

    @Provides
    @ElementsIntoSet
    public Set<AppService> authService(AuthService authService, FormService formService, UserService userService, PingService pingService) {
        return Set.of(authService, formService, userService, pingService);
    }

    @Provides
    @Singleton
    public ExecutorService executorService(EventBus eventBus) {
        final var es = Executors.newCachedThreadPool();
        eventBus.subscribe(ShutdownEvent.class, __ -> es.shutdown());
        return es;
    }
}
