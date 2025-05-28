package fr.civipol.civilio.domain.converter;

import java.util.Locale;
import java.util.Optional;

public class IntegerStringConverter extends CachedStringConverter<Integer> {
    @Override
    public String doToString(Integer object) {
        this.value = object;
        return Optional.ofNullable(object)
                .map(o -> String.format(Locale.getDefault(), "%d", o))
                .orElse("");
    }
}
