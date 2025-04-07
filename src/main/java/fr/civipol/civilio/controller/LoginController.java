package fr.civipol.civilio.controller;

import dagger.Lazy;
import fr.civipol.civilio.controls.SettingsControl;
import fr.civipol.civilio.exception.NotFoundException;
import fr.civipol.civilio.services.AuthService;
import jakarta.inject.Inject;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.ComboBoxListCell;
import javafx.util.StringConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Locale;
import java.util.concurrent.ExecutorService;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
@Slf4j
public class LoginController implements AppController {
    //    private final ViewLoader viewLoader;
    private final Lazy<SettingsControl> settingsControl;
    private final Lazy<ExecutorService> executorService;
    private final Lazy<AuthService> authService;
    private final BooleanProperty signingIn = new SimpleBooleanProperty(this, "signingIn", false);

    @FXML
    private Button btnSignIn;

    @FXML
    private ComboBox<Locale> cbLangSelect;

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
        btnSignIn.setOnAction(this::onSignInButtonClicked);
        cbLangSelect.setItems(FXCollections.observableArrayList(Locale.getDefault()));
        cbLangSelect.setCellFactory(param -> new ComboBoxListCell<>(new StringConverter<>() {
            @Override
            public String toString(Locale object) {
                return object.getDisplayLanguage(Locale.getDefault());
            }

            @Override
            public Locale fromString(String string) {
                return Locale.of(string.toLowerCase().substring(0, 2));
            }
        }));
        final var signInButtonBinding = Bindings.and(
                tfEmail.textProperty().isNotEmpty(),
                pfPassword.textProperty().isNotEmpty()
        ).not().or(signingIn);
        btnSignIn.disableProperty().bind(signInButtonBinding);
        hlSettings.setOnAction(e -> settingsControl.get().makePreferencesForm().show(true));
    }

    private void onSignInButtonClicked(ActionEvent ignored) {
        signingIn.set(true);
        executorService.get().submit(() -> {
            try {
                authService.get().signIn(tfEmail.getText(), pfPassword.getText());
            } catch (NotFoundException e) {
                Platform.runLater(() -> signingIn.set(false));
            } catch (Throwable e) {
                log.error("error while logging in", e);
                Platform.runLater(() -> signingIn.set(false));
            }
        });
    }
}
