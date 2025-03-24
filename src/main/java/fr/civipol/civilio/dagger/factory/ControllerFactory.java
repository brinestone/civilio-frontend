package fr.civipol.civilio.dagger.factory;

import fr.civipol.civilio.controller.AppController;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.function.Function;

public class ControllerFactory implements Function<Class<?>, Object> {
    private final Map<Class<?>, AppController> controllerProviders;

    @Inject
    public ControllerFactory(Map<Class<?>, AppController> controllerProviders) {
        this.controllerProviders = controllerProviders;
    }

    @Override
    public Object apply(Class<?> aClass) {
        return controllerProviders.get(aClass);
    }

}
