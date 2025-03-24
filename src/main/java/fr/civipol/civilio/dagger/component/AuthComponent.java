package fr.civipol.civilio.dagger.component;

import dagger.Component;
import fr.civipol.civilio.dagger.module.BackgroundModule;
import fr.civipol.civilio.services.AuthService;
import jakarta.inject.Singleton;

@Singleton
@Component(modules = BackgroundModule.class)
public interface AuthComponent {
    AuthService authService();
}
