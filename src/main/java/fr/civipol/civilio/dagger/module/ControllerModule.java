package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.IntoMap;
import dagger.multibindings.LazyClassKey;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FOSASubmissionsController;
import fr.civipol.civilio.controller.LoginController;
import fr.civipol.civilio.controller.ShellController;
import fr.civipol.civilio.controller.csc.CSCFormSubmissionController;
import fr.civipol.civilio.controller.csc.CSCSubmissionsController;
import fr.civipol.civilio.controller.csc.CSCViewController;

@Module()
public class ControllerModule {

    @Provides
    @IntoMap
    @LazyClassKey(FOSASubmissionsController.class)
    public AppController fosaSubmissionsController(FOSASubmissionsController fosaSubmissionsController) {
        return fosaSubmissionsController;
    }

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

    @Provides
    @IntoMap
    @LazyClassKey(CSCSubmissionsController.class)
    public AppController cscSubmissionsController(CSCSubmissionsController cscSubmissionsController) {
        return cscSubmissionsController;
    }

    @Provides
    @IntoMap
    @LazyClassKey(CSCFormSubmissionController.class)
    public AppController cscFormSubmissionController(CSCFormSubmissionController cscSubmissionsController) {
        return cscSubmissionsController;
    }


}
