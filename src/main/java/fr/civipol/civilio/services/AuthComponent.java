package fr.civipol.civilio.services;

import dagger.Component;
import fr.civipol.civilio.dagger.BackgroundModule;
import jakarta.inject.Singleton;

@Singleton
@Component(modules = BackgroundModule.class)
public interface AuthComponent {
    AuthService authService();
}
