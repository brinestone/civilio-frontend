package fr.civipol.civilio.controller;

import jakarta.inject.Inject;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class FormFooterController implements AppController {
    @FXML
    private Button btnFinish;
    @FXML
    private Button btnDiscard;
    private final BooleanProperty canSubmit = new SimpleBooleanProperty(true);
    private final BooleanProperty canDiscard = new SimpleBooleanProperty(true);
    private final ObjectProperty<EventHandler<ActionEvent>> onSubmit = new SimpleObjectProperty<>();
    private final ObjectProperty<EventHandler<ActionEvent>> onDiscard = new SimpleObjectProperty<>();

    public BooleanProperty canSubmitProperty() {
        return canSubmit;
    }

    public BooleanProperty canDiscardProperty() {
        return canDiscard;
    }

    public void setOnSubmit(EventHandler<ActionEvent> handler) {
        onSubmit.setValue(handler);
    }

    public void setOnDiscard(EventHandler<ActionEvent> handler) {
        onDiscard.setValue(handler);
    }

    @FXML
    private void initialize() {
        btnFinish.disableProperty().bind(this.canSubmit.not());
        btnDiscard.disableProperty().bind(this.canDiscard.not());
        btnFinish.onActionProperty().bind(this.onSubmit);
        btnDiscard.onActionProperty().bind(this.onDiscard);
    }
}