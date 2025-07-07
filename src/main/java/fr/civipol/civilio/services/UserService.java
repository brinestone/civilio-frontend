package fr.civipol.civilio.services;

import dagger.Lazy;
import fr.civipol.civilio.entity.User;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.util.Collection;
import java.util.Collections;

@Slf4j
public class UserService implements AppService {
    private final Lazy<DataSource> dataSourceProvider;

    @Inject
    public UserService(Lazy<DataSource> dataSourceProvider) {
        this.dataSourceProvider = dataSourceProvider;
    }

    public Collection<User> findAllUsers() {
        return Collections.emptyList();
    }
}
