package fr.civipol.civilio.event;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import javafx.application.Platform;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.stream.Stream;

@Singleton
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class EventBus {
    private final ConcurrentHashMap<String, List<Consumer<Event>>> subscribers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, List<Consumer<Event>>> oneOffSubscribers = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T extends Event> void subscribe(Class<T> eventType, Consumer<T> subscriber) {
        if (subscriber == null) throw new IllegalArgumentException("subscriber parameter cannot be null");
        var list = subscribers.computeIfAbsent(eventType.getName(), __ -> new ArrayList<>());
        list.add((Consumer<Event>) subscriber);
    }

    @SuppressWarnings("unchecked")
    public <T extends Event> void once(Class<T> eventType, Consumer<T> subscriber) {
        if (subscriber == null) throw new IllegalArgumentException("subscriber parameter cannot be null");
        final var key = eventType.getName();
        var list = oneOffSubscribers.computeIfAbsent(key, __ -> new ArrayList<>());
        var pos = list.size();
        list.add((Consumer<Event>) subscriber.andThen(__ -> list.remove(Math.max(0, pos-1))));
    }

    public <T extends Event> void unsubscribe(Class<T> eventType, Consumer<T> subscriber) {
        if (subscriber == null) return;
        final var subs = subscribers.get(eventType.getName());
        if (subs != null) {
            subs.remove(subscriber);
        }
    }

    public void publish(Event event) {
        final var consumers = Stream.concat(
                subscribers.get(event.getClass().getName()).stream(),
                oneOffSubscribers.get(event.getClass().getName()).stream()
        ).toList();

        for (var c : consumers) {
            if (Platform.isFxApplicationThread()) c.accept(event);
            else
                Platform.runLater(() -> c.accept(event));
        }
    }
}
