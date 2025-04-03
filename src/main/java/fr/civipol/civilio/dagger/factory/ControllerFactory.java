package fr.civipol.civilio.dagger.factory;

import fr.civipol.civilio.controller.AppController;
import jakarta.inject.Inject;
import jakarta.inject.Provider;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.function.Function;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ControllerFactory implements Function<Class<?>, Object> {
    private final Map<Class<?>, Provider<AppController>> controllerProviders;

    @Override
    public Object apply(Class<?> aClass) {
        return controllerProviders.get(aClass).get();
    }

}
