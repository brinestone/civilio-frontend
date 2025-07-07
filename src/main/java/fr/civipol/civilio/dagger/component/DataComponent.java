package fr.civipol.civilio.dagger.component;

import com.zaxxer.hikari.HikariConfig;
import dagger.Component;
import fr.civipol.civilio.dagger.module.BackgroundModule;
import jakarta.inject.Provider;
import jakarta.inject.Singleton;

import javax.sql.DataSource;

@Singleton
@Component(modules = {BackgroundModule.class})
public interface DataComponent {
    Provider<HikariConfig> hikariConfig();

    Provider<DataSource> dataSource();
}
