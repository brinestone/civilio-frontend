package fr.civipol.civilio.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.Optional;

@RequiredArgsConstructor
public class QueryFilter<T> {
    @Getter
    private final String propertyName;

    @Setter
    @Getter
    private boolean useDefaultValueAsDefault;

    @Getter
    @Setter
    protected T defaultValue;

    @Getter
    @Setter
    protected T value;

    public boolean isActive() {
        return Optional.ofNullable(value)
                .filter(v -> !v.equals(defaultValue))
                .isPresent();
    }
}
