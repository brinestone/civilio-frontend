package fr.civipol.civilio.dagger.module;

import dagger.Module;
import dagger.Provides;
import dagger.multibindings.ClassKey;
import dagger.multibindings.IntoMap;
import dagger.multibindings.LazyClassKey;
import fr.civipol.civilio.controls.AppControl;
import fr.civipol.civilio.controls.MainMenuControl;
import fr.civipol.civilio.controls.SettingsControl;

@Module
public class ControlModule {

    @Provides
    @IntoMap
    @LazyClassKey(SettingsControl.class)
    public AppControl settingsControl(SettingsControl c) {
        return c;
    }

    @Provides
    @IntoMap
    @LazyClassKey(MainMenuControl.class)
    public AppControl mainMenuControl(MainMenuControl c) {
        return c;
    }
}
