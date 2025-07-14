package fr.civipol.civilio.controller.csc;

import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.controller.FormHeaderController;
import fr.civipol.civilio.form.FormDataManager;
import fr.civipol.civilio.services.FormService;
import jakarta.inject.Inject;
import javafx.fxml.Initializable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.net.URL;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.concurrent.ExecutorService;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class CSCFormController extends FormController implements AppController, Initializable {
    @Getter(AccessLevel.PROTECTED)
    private final ExecutorService executorService;
    @Getter(AccessLevel.PROTECTED)
    private final FormService formService;
    @Getter
    private FormDataManager model;

    @Override
    protected FormHeaderController getHeaderManagerController() {
        return null;
    }

    @Override
    protected void doSubmit() throws Exception {

    }

    @Override
    protected Map<String, String> loadSubmissionData() throws Exception {
        return null;
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {

    }
}
