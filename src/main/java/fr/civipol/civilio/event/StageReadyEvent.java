package fr.civipol.civilio.event;

import javafx.stage.Stage;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

public record StageReadyEvent(Stage stage, boolean forceConfig) implements Event {
}
