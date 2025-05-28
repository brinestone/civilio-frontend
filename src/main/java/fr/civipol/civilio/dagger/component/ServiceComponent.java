package fr.civipol.civilio.dagger.component;

import dagger.Component;
import fr.civipol.civilio.dagger.module.BackgroundModule;
import fr.civipol.civilio.services.AppService;
import fr.civipol.civilio.services.ConfigManager;
import jakarta.inject.Singleton;

import java.util.Set;
import java.util.concurrent.ExecutorService;

@Singleton
@Component(modules = {BackgroundModule.class})
public interface ServiceComponent {
    Set<AppService> allServices();

//    @Named("exs")
    ExecutorService executorService();

    ConfigManager configManager();
}
