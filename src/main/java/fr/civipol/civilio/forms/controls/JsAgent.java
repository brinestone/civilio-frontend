package fr.civipol.civilio.forms.controls;

import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;

@Slf4j
public class JsAgent {
    private final List<BiConsumer<Float, Float>> consumers = new ArrayList<>();

    public void log(String message, Object data) {
        log.info(message, data);
    }

    public void registerPointConsumer(BiConsumer<Float, Float> callback) {
        consumers.add(callback);
    }

    public void onGeoPointMoved(Double lat, Double lon) {
        for (var consumer : consumers) {
            consumer.accept(lat.floatValue(), lon.floatValue());
        }
    }
}
