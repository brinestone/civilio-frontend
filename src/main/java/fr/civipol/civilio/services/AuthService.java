package fr.civipol.civilio.services;


import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class AuthService implements AppService {
    private final ApiService apiService;

    public boolean isUserAuthed() {
        return true;
    }

    @Override
    public void initialize() {

    }
}
