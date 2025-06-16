package fr.civipol.civilio.domain.converter;

import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;

import java.util.Optional;

public abstract class CachedStringConverter<T> extends StringConverter<T> {
    protected T value;

    protected abstract String doToString(T value);
    protected abstract T doFromString(String s);

    @Override
    public String toString(T object) {
        value = object;
        return Optional.ofNullable(object)
                .map(this::doToString)
                .filter(StringUtils::isNotBlank)
                .orElse("");
    }

    @Override
    public T fromString(String string) {
        return Optional.ofNullable(string)
                .filter(StringUtils::isNotBlank)
                .map(this::doFromString)
                .orElse(this.value);
    }
}
