package fr.civipol.civilio.event;

import javafx.stage.Stage;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class StageReadyEvent implements Event {
    @Getter
    private final Stage stage;
}
