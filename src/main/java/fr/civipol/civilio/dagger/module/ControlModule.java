package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.ClassKey;
import dagger.multibindings.IntoMap;
import fr.civipol.civilio.controls.AppControl;
import fr.civipol.civilio.controls.MainMenuControl;

@Module
public class ControlModule {
    @Provides
    @IntoMap
    @ClassKey(MainMenuControl.class)
    public AppControl mainMenuControl(MainMenuControl c) {
        return c;
    }
}
