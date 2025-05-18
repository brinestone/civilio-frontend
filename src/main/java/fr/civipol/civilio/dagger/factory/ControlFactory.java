package fr.civipol.civilio.dagger.factory;

import fr.civipol.civilio.controls.AppControl;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.function.Function;

/**
 * A Dagger factory for instantiating and managing custom control.
 */
public class ControlFactory implements Function<Class<?>, Object> {
    private final Map<Class<?>, AppControl> controls;

    @Inject
    public ControlFactory(Map<Class<?>, AppControl> controls) {
        this.controls = controls;
    }

    public Object apply(Class<?> clazz) {
        return controls.get(clazz);
    }
}
