package fr.civipol.civilio.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.civipol.civilio.Constants;
import fr.civipol.civilio.domain.Principal;
import fr.civipol.civilio.entity.User;
import fr.civipol.civilio.exception.NotFoundException;
import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.Optional;
import java.util.prefs.Preferences;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class AuthService implements AppService {
    private static final String USER_INFO_PREFS_KEY = "user_info";

    public Optional<Principal> getPrincipal() {
        final var mapper = new ObjectMapper();
        return Optional.ofNullable(Preferences.userRoot().node(Constants.ROOT_PREFS_KEY_PATH).get(USER_INFO_PREFS_KEY, null))
                .map(json -> {
                    try {
                        return mapper.readValue(json, User.class);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                });
    }

    public void signIn(String username, String password) throws NotFoundException {
        // TODO: to be done later
    }

    public void signOut() {
        log.info("signing out...");
        // TODO: to be done later
    }

    private boolean storeUserInfo(User user) throws JsonProcessingException {
        final var mapper = new ObjectMapper();
        final var json = mapper.writeValueAsString(user);
        return true;
    }

    public boolean isUserAuthed() {
        return Optional.ofNullable(Preferences.userRoot()
                        .node(Constants.ROOT_PREFS_KEY_PATH)
                        .get(Constants.PRINCIPAL_PREFS_KEY_NAME, null))
                .map(StringUtils::isNotBlank)
                .orElse(true);
    }
}
