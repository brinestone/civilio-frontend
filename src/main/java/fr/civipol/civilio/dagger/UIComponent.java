package fr.civipol.civilio.dagger;

import dagger.Component;
import fr.civipol.civilio.stage.StageManager;
import jakarta.inject.Singleton;

@Singleton
@Component(modules = {UIModule.class})
public interface UIComponent {
    StageManager stageManager();
}
