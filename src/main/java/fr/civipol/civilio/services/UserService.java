package fr.civipol.civilio.services;

import fr.civipol.civilio.entity.User;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;

import java.util.Collection;
import java.util.Collections;

@Slf4j
public class UserService implements AppService {
    @Inject
    public UserService() {
    }

    public Collection<User> findAllUsers() {
        return Collections.emptyList();
    }
}
