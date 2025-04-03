package fr.civipol.civilio.controller;

import dagger.Lazy;
import fr.civipol.civilio.controls.SettingsControl;
import jakarta.inject.Inject;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class LoginController implements AppController {
    //    private final ViewLoader viewLoader;
    private final Lazy<SettingsControl> settingsControl;

    @FXML
    private Button btnSignIn;

    @FXML
    private ComboBox<?> cbLangSelect;

    @FXML
    private Hyperlink hlForgotPassword;

    @FXML
    private Hyperlink hlSettings;

    @FXML
    private PasswordField pfPassword;

    @FXML
    private TextField tfEmail;

    @FXML
    private void initialize() {
        hlSettings.setOnAction(e -> {
            settingsControl.get().makePreferencesForm().show(true);
        });
    }
}
