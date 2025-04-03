package fr.civipol.civilio.services;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.civipol.civilio.domain.Principal;
import fr.civipol.civilio.entity.User;
import fr.civipol.civilio.exception.NotFoundException;
import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.Optional;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
@Slf4j
public class AuthService implements AppService {
    private static final String USER_INFO_PREFS_KEY = "user_info";

    private final PrefsService prefsService;

    public Optional<Principal> getPrincipal() {
        final var mapper = new ObjectMapper();
        return prefsService.getToken(USER_INFO_PREFS_KEY)
                .map(json -> {
                    try {
                        return mapper.readValue(json, User.class);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                });
    }

    public void signIn(String username, String password) throws NotFoundException {

    }

    private boolean storeUserInfo(User user) throws JsonProcessingException {
        final var mapper = new ObjectMapper();
        final var json = mapper.writeValueAsString(user);
        prefsService.storeToken(USER_INFO_PREFS_KEY, json);
        return true;
    }

    public boolean isUserAuthed() {
        return prefsService.getToken(USER_INFO_PREFS_KEY)
                .map(StringUtils::isNotBlank)
                .orElse(false);
    }

    @Override
    public void initialize() {

    }
}
