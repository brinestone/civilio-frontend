package fr.civipol.civilio.services;

import fr.civipol.civilio.event.EventBus;
import fr.civipol.civilio.event.ShutdownEvent;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;

import java.net.UnknownHostException;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;

@Slf4j
public class PingService implements AppService {
    private final Map<String, Consumer<Boolean>> callbackRegistry = new Hashtable<>();
    private final Set<String> busySet = new HashSet<>();
    private static final long PERIOD = 30000;
    private static final int TIMEOUT = 5000;

    @Inject
    public PingService(
            EventBus eventBus,
            @SuppressWarnings("CdiInjectionPointsInspection") ExecutorService executorService) {
        final var timer = new Timer();
        eventBus.subscribe(ShutdownEvent.class, __ -> timer.cancel());

        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                final var domains = callbackRegistry.keySet();
                if (domains.size() == 0)
                    return;
                log.debug("tick - Pinging {} domains", domains.size());
                for (var domain : domains) {
                    if (busySet.contains(domain)) {
                        log.debug("skipping busy domain: {}", domain);
                        continue;
                    }
                    busySet.add(domain);
                    executorService.submit(() -> {
                        try {
                            String command;
                            final var os = System.getProperty("os.name").toLowerCase();
                            if (os.startsWith("windows")) {
                                command = "ping -n 1 %s".formatted(domain);
                            } else if (os.startsWith("linux") || os.startsWith("mac")) {
                                command = "ping -c 1 %s".formatted(domain);
                            } else {
                                throw new IllegalStateException("could not determine operating system platform");
                            }

                            final var process = Runtime.getRuntime().exec(command);
                            final Consumer<ShutdownEvent> callback = __ -> process.destroyForcibly();
                            eventBus.once(ShutdownEvent.class, callback);
                            final var exitCode = process.waitFor();
                            Optional.ofNullable(callbackRegistry.get(domain))
                                    .ifPresent(cb -> cb.accept(exitCode == 0));
                            eventBus.unsubscribe(ShutdownEvent.class, callback);
                        } catch (UnknownHostException ignored) {
                            Optional.ofNullable(callbackRegistry.get(domain))
                                    .ifPresent(c -> c.accept(false));
                        } catch (Throwable t) {
                            log.error("error while pinging address: \"%s\"".formatted(domain), t);
                        } finally {
                            busySet.remove(domain);
                        }
                    });
                }
            }
        }, 5000, PERIOD);
    }

    public void observe(String domain, Consumer<Boolean> callback) {
        log.debug("observing domain: {}", domain);
        callbackRegistry.putIfAbsent(domain, callback);
    }

    public void unobserve(String domain) {
        log.debug("un-observing domain: {}", domain);
        callbackRegistry.remove(domain);
        busySet.remove(domain);
    }
}
