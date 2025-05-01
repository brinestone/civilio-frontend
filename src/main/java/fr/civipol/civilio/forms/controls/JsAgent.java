package fr.civipol.civilio.forms.controls;

import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class JsAgent {
    @FunctionalInterface
    public interface NotificationConsumer {
        void consume();
    }

    private final List<NotificationConsumer> consumers = new ArrayList<>();

    @SuppressWarnings("unused")
    public void log(String message, Object data) {
        log.info(message, data);
    }

    public void registerGeoPointChangeNotifier(NotificationConsumer consumer) {
        consumers.add(consumer);
    }

    @SuppressWarnings("unused")
    public void notifyGeoPointChanged() {
        for(var consumer: consumers) {
            consumer.consume();
        }
    }
}
