package fr.civipol.civilio.form.renderer;

import com.dlsc.formsfx.model.structure.Form;
import javafx.beans.value.ObservableBooleanValue;
import javafx.scene.layout.VBox;

import java.util.HashMap;
import java.util.Map;

public class FormRenderer extends com.dlsc.formsfx.view.renderer.FormRenderer {
    private Map<String, ObservableBooleanValue> visibilityRules = new HashMap<>();
    /**
     * This is the constructor to pass over data.
     *
     * @param form The form which gets rendered.
     */
    public FormRenderer(Form form) {
        super(form);
    }
}
