package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.ClassKey;
import dagger.multibindings.IntoMap;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.LoginController;
import fr.civipol.civilio.controller.ShellController;

@Module
public class ControllerModule {
    @Provides
    @IntoMap
    @ClassKey(ShellController.class)
    public AppController shellController(ShellController shellController) {
        return shellController;
    }

    @Provides
    @IntoMap
    @ClassKey(LoginController.class)
    public AppController loginController(LoginController loginController) {
        return loginController;
    }
}
