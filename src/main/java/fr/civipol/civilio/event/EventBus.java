package fr.civipol.civilio.event;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import javafx.application.Platform;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

@Singleton
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class EventBus {
    private final ConcurrentHashMap<String, List<Consumer<Event>>> subscribers = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T extends Event> void subscribe(Class<T> eventType, Consumer<T> subscriber) {
        if (subscriber == null) throw new IllegalArgumentException("subscriber parameter cannot be null");
        var list = subscribers.computeIfAbsent(eventType.getName(), __ -> new ArrayList<>());
        list.add((Consumer<Event>) subscriber);
    }

//    public <T extends Event> void unsubscribe(Class<T> eventType, Consumer<T> subscriber) {
//        if (subscriber == null) return;
//        final var subs = subscribers.get(eventType);
//        if (subs != null) {
//            subs.remove(subscriber);
//        }
//    }

    public <T extends Event> void publish(T event) {
        final var consumers = subscribers.get(event.getClass().getName());
        if (consumers == null) return;

        for (var c : consumers) {
            Platform.runLater(() -> c.accept(event));
        }
    }
}
