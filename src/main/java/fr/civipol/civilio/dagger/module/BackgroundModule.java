package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import fr.civipol.civilio.services.AuthService;
import fr.civipol.civilio.services.PrefsService;
import jakarta.inject.Singleton;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

import java.util.Optional;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Module
@Slf4j
public class BackgroundModule {

    @Provides
    public SessionFactory sessionFactory() {
        final var isDevMode = Optional.ofNullable(System.getProperty("DEV_MODE", "false"))
                .map(Boolean::parseBoolean)
                .orElse(false);
        return new Configuration()
                .setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
                .setProperty("hibernate.connection.driver_class", "org.postgreql.Driver")
                .setProperty("hbm2ddl.auto", "update")
                .setProperty("show_sql", isDevMode)
                .setProperty("format_sql", isDevMode)
                .setProperty("hibernate.temp.use_jdbc_metadata_defaults", "false")
                .setProperty("connection_pool_size", 20)
                .setProperty("hibernate.connection.username", System.getProperty("db.user"))
                .setProperty("hibernate.connection.password", System.getProperty("db.pwd"))
                .setProperty("hibernate.connection.url", "jdbc:postgresql://" + System.getProperty("db.host") + "/" + System.getProperty("db.name"))
                .buildSessionFactory();
    }

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
    public Executor executorService() {
        return Executors.newCachedThreadPool();
    }
}
