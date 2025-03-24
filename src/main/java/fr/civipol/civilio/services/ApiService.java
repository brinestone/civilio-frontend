package fr.civipol.civilio.services;

import jakarta.inject.Inject;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@NoArgsConstructor(onConstructor = @__({@Inject}))
@Slf4j
public class ApiService implements AppService {
    @Override
    public void initialize() {
        log.info("Initializing...");
    }
}
