package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.IntoMap;
import dagger.multibindings.LazyClassKey;
import fr.civipol.civilio.controller.*;
import fr.civipol.civilio.controller.chefferie.ChefferieFormController;
import fr.civipol.civilio.controller.fosa.FOSAFormController;

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
    @LazyClassKey(ChefferieFormController.class)
    public AppController chefferieFormSubmissionController(ChefferieFormController chefferieFormSubmissionController) {
        return chefferieFormSubmissionController;
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
    @LazyClassKey(FormHeaderController.class)
    public AppController formHeaderController(FormHeaderController formHeaderController) {
        return formHeaderController;
    }

    @Provides
    @IntoMap
    @LazyClassKey(FormFooterController.class)
    public AppController formFooterController(FormFooterController formHeaderController) {
        return formHeaderController;
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
