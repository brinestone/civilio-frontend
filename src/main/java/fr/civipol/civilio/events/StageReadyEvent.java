package fr.civipol.civilio.events;

import javafx.stage.Stage;
import org.springframework.context.ApplicationEvent;

public class StageReadyEvent extends ApplicationEvent {
    private final Stage stage;

    public StageReadyEvent(Stage stage, Object source) {
        super(source);
        this.stage = stage;
    }

    public Stage getStage() {
        return stage;
    }
}
