package fr.civipol.civilio.dagger.factory;

import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;

import java.net.http.HttpClient;
import java.util.concurrent.Executor;
import java.util.function.Supplier;

@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class HttpClientFactory implements Supplier<HttpClient> {
    private final Executor executor;

    @Override
    public HttpClient get() {
        return HttpClient.newBuilder().executor(executor).build();
    }
}
