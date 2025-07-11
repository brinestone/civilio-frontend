package fr.civipol.civilio.dagger.component;

import dagger.Component;
import fr.civipol.civilio.dagger.module.UIModule;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.services.AppService;
import fr.civipol.civilio.services.ConfigManager;
import fr.civipol.civilio.stage.StageManager;
import jakarta.inject.Singleton;

import java.util.Set;
import java.util.concurrent.ExecutorService;

@Singleton
@Component(modules = {UIModule.class})
public interface AppComponent {
    Set<AppService> allServices();

    ExecutorService executorService();

    ConfigManager configManager();

    EventBus eventBus();

    StageManager stageManager();
}
