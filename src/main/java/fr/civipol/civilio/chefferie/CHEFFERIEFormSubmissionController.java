package fr.civipol.civilio.chefferie;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.model.validators.IntegerRangeValidator;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.controller.AppController;
import fr.civipol.civilio.controller.FormController;
import fr.civipol.civilio.forms.field.FOSAPersonnelInfoField;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.ScrollPane;

import java.net.URL;
import java.util.Collections;
import java.util.ResourceBundle;
import java.util.function.Consumer;

public class CHEFFERIEFormSubmissionController implements AppController, Initializable , FormController {
    private  Consumer<String> submissionCallback;

    @FXML
    private ScrollPane spCSERegContainer;

    @FXML
    private ScrollPane spEquipmentContainer;

    @FXML
    private ScrollPane spPersonalStatusContainer;

    @FXML
    private ScrollPane spRespondentContainer;

    @FXML
    private ScrollPane spStructureIdContainer;

    @FXML
    private Button btnFinish;

    @FXML
    private Button btnDiscard;


    @FXML
    void onDiscardButtonClicked(ActionEvent ignored) {

    }

    @FXML
    void onSubmitButtonClicked(ActionEvent ignored) {

    }

    @Override
    public void setOnSubmit(Consumer<String> callback) {
        this.submissionCallback = callback;
    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        setForms(resources);
    }

    private void setForms(ResourceBundle resources) {
        final var ts = new ResourceBundleService(resources);
        setRespondentSection(ts);
        setStructureIdContainer(ts);
        setCSERegContainer(ts);
        setEquipmentContainer(ts);
        setPersonnelStatusContainer(ts);
    }

    private void setPersonnelStatusContainer(TranslationService ts) {
        final var personnel = Collections.<PersonnelInfo>emptyList();
        final var form = Form.of(Group.of(
                Field.ofIntegerType(0)
                        .label("chefferie.form.fields.personnel_count.title")
                        .tooltip("chefferie.form.fields.personnel_count.description")
                        .validate(IntegerRangeValidator.atLeast(0, "chefferie.form.msg.value_out_of_range"))
                        .span(ColSpan.TWO_THIRD),
                CHEFFERIEPersonnelInfoField.personnelInfoField(personnel)
                        .label("chefferie.form.fields.personnel_status.title")
        )).i18n(ts);
        spPersonalStatusContainer.setContent(new FormRenderer(form));
    }

    private void setEquipmentContainer(TranslationService ts) {
    }

    private void setCSERegContainer(TranslationService ts) {
    }

    private void setStructureIdContainer(TranslationService ts) {
    }

    private void setRespondentSection(TranslationService ts) {
    }

}
