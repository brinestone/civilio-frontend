package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.IntoMap;
import dagger.multibindings.LazyClassKey;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.csc.CSCViewController;
import fr.civipol.civilio.controller.LoginController;
import fr.civipol.civilio.controller.ShellController;

@Module()
public class ControllerModule {

    @Provides
    @IntoMap
    @LazyClassKey(CSCViewController.class)
    public AppController cscViewController(CSCViewController cscViewController) {
        return cscViewController;
    }

    @Provides
    @IntoMap
    @LazyClassKey(ShellController.class)
    public AppController shellController(ShellController shellController) {
        return shellController;
    }

    @Provides
    @IntoMap
    @LazyClassKey(LoginController.class)
    public AppController loginController(LoginController loginController) {
        return loginController;
    }
}
