package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.IntoMap;
import dagger.multibindings.LazyClassKey;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.LoginController;
import fr.civipol.civilio.controller.ShellController;
import fr.civipol.civilio.controller.fosa.FOSAFormController;
import fr.civipol.civilio.controller.SubmissionsController;

@Module()
public class ControllerModule {

    @Provides
    @IntoMap
    @LazyClassKey(FOSAFormController.class)
    public AppController fosaFormSubmissionController(FOSAFormController fosaFormSubmissionController) {
        return fosaFormSubmissionController;
    }

    @Provides
    @IntoMap
    @LazyClassKey(SubmissionsController.class)
    public AppController fosaSubmissionsController(SubmissionsController fosaSubmissionsController) {
        return fosaSubmissionsController;
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
