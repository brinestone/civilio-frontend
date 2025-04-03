package fr.civipol.civilio.services;


import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class AuthService implements AppService {
    private final PrefsService prefsService;

    public boolean isUserAuthed() {
        return prefsService.getToken("session_id")
                .map(StringUtils::isNotBlank)
                .orElse(false);
    }

    @Override
    public void initialize() {

    }
}
