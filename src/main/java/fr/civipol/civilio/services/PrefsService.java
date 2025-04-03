package fr.civipol.civilio.services;

import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.prefs.Preferences;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class PrefsService implements AppService {
    private static final String SERVICE_NAME = System.getProperty("app.id");

    public Optional<String> getToken(String key) {
        return Optional.ofNullable(Preferences.userRoot().node(SERVICE_NAME).get(key, null));
    }

    public void clearToken(String key) {
        Preferences.userRoot().node(SERVICE_NAME).remove(key);
    }

    public void storeToken(String key, String token) {
        Preferences.userRoot().node(SERVICE_NAME).put(key, token);
    }

    @Override
    public void initialize() {
    }
}
