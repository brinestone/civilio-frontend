package fr.civipol.civilio.services;

public interface AppService {
    default void initialize() throws Exception {
    }

    default boolean isConfigured(ConfigManager cm) {
        return true;
    }
}
