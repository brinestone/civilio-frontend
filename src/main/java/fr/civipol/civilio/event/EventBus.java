package fr.civipol.civilio.event;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import javafx.application.Platform;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Singleton
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class EventBus {
    private final ConcurrentHashMap<String, List<Consumer<Event>>> subscribers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Consumer<Event>> oneOffSubscribers = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T extends Event> void subscribe(Class<T> eventType, Consumer<T> subscriber) {
        if (subscriber == null) throw new IllegalArgumentException("subscriber parameter cannot be null");
        var list = subscribers.computeIfAbsent(eventType.getName(), __ -> new ArrayList<>());
        list.add((Consumer<Event>) subscriber);
    }

    @SuppressWarnings("unchecked")
    public <T extends Event> void once(Class<T> eventType, Consumer<T> subscriber) {
        if (subscriber == null) throw new IllegalArgumentException("subscriber parameter cannot be null");
        final var key = eventType.getTypeName() + subscriber.hashCode();
        oneOffSubscribers.put(key, (Consumer<Event>) subscriber.andThen(__ -> oneOffSubscribers.remove(key)));
    }

    public <T extends Event> void unsubscribe(Class<T> eventType, Consumer<T> subscriber) {
        if (subscriber == null) return;
        final var subs = subscribers.get(eventType.getName());
        if (subs != null) {
            subs.remove(subscriber);
        }
        final var key = eventType.getName() + subscriber.hashCode();
        oneOffSubscribers.remove(key);
    }

    public <T extends Event> void publish(T event) {
        final var consumers = Stream.concat(
                subscribers.get(event.getClass().getName()).stream(),
                oneOffSubscribers.keySet().stream()
                        .filter(k -> k.startsWith(event.getClass().getName()))
                        .map(oneOffSubscribers::get)
        ).collect(Collectors.toSet());

        for (var c : consumers) {
            Platform.runLater(() -> c.accept(event));
        }
    }
}
