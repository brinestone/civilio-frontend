package fr.civipol.civilio.dagger.component;

import dagger.Component;
import fr.civipol.civilio.dagger.module.UIModule;
import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.stage.StageManager;
import jakarta.inject.Singleton;

@Singleton
@Component(modules = {UIModule.class})
public interface UIComponent {
    EventBus eventBus();

    StageManager stageManager();
}
