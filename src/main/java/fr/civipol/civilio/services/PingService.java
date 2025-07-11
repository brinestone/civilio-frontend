package fr.civipol.civilio.services;

import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.event.ShutdownEvent;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;

@Slf4j
public class PingService implements AppService {
    private final Map<String, Consumer<Boolean>> callbackRegistry = new Hashtable<>();
    private static final long PERIOD = 3000;
    private static final int TIMEOUT = 5000;

    @Inject
    public PingService(
            EventBus eventBus,
            @SuppressWarnings("CdiInjectionPointsInspection") ExecutorService executorService
    ) {
        final var timer = new Timer();
        eventBus.subscribe(ShutdownEvent.class, __ -> timer.cancel());

        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                final var domains = callbackRegistry.keySet();
                for (var domain : domains) {
                    executorService.submit(() -> {
                        try {
                            final var ip = InetAddress.getByName(domain);
                            final var reachable = ip.isReachable(TIMEOUT);
                            Optional.ofNullable(callbackRegistry.get(domain))
                                    .ifPresent(c -> c.accept(reachable));
                        } catch (Throwable t) {
                            log.error("error while pinging address: \"%s\"".formatted(domain), t);
                        }
                    });
                }
            }
        }, PERIOD, 1000);
    }

    public void observe(String domain, Consumer<Boolean> callback) {
        callbackRegistry.putIfAbsent(domain, callback);
    }

    public void unobserve(String domain) {
        callbackRegistry.remove(domain);
    }
}
