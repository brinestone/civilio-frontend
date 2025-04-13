package fr.civipol.civilio.dagger.component;

import dagger.Component;
import fr.civipol.civilio.dagger.module.BackgroundModule;
import fr.civipol.civilio.services.AppService;
import jakarta.inject.Singleton;

import java.util.Set;

@Singleton
@Component(modules = {BackgroundModule.class})
public interface ServiceComponent {
    Set<AppService> allServices();
}
