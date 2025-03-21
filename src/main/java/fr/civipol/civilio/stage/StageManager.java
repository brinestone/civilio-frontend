package fr.civipol.civilio.stage;

import fr.civipol.civilio.events.StageReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class StageManager implements ApplicationListener<StageReadyEvent> {
    @Override
    public void onApplicationEvent(StageReadyEvent event) {

    }
}
