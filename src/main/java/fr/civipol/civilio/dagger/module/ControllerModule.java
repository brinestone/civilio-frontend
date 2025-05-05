package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.IntoMap;
import dagger.multibindings.LazyClassKey;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.LoginController;
import fr.civipol.civilio.controller.ShellController;
import fr.civipol.civilio.controller.chefferie.CHEFFERIESubmissionController;
import fr.civipol.civilio.controller.csc.CSCViewController;
import fr.civipol.civilio.controller.fosa.FOSAFormSubmissionController;
import fr.civipol.civilio.controller.fosa.FOSASubmissionsController;

@Module()
public class ControllerModule {

    @Provides
    @IntoMap
    @LazyClassKey(FOSAFormSubmissionController.class)
    public AppController fosaFormSubmissionController(FOSAFormSubmissionController fosaFormSubmissionController) {
        return fosaFormSubmissionController;
    }

    @Provides
    @IntoMap
    @LazyClassKey(FOSASubmissionsController.class)
    public AppController fosaSubmissionsController(FOSASubmissionsController fosaSubmissionsController) {
        return fosaSubmissionsController;
    }

    @Provides
    @IntoMap
    @LazyClassKey(CHEFFERIESubmissionController.class)
    public AppController chefferieSubmissionController(CHEFFERIESubmissionController chefferieSubmissionController) {
        return chefferieSubmissionController;
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
}
