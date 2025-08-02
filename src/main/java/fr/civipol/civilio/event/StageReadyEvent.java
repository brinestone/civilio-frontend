package fr.civipol.civilio.event;

import javafx.stage.Stage;

public record StageReadyEvent(Stage stage, boolean forceConfiguration) implements Event {
}
