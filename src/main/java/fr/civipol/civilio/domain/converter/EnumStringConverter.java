package fr.civipol.civilio.domain.converter;

import javafx.util.StringConverter;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

@RequiredArgsConstructor
public class EnumStringConverter<T extends Enum<T>> extends StringConverter<T> {
    private final Class<T> enumType;

    @Override
    public String toString(T object) {
        return Optional.ofNullable(object)
                .map(Enum::name)
                .orElse("");
    }

    @Override
    public T fromString(String string) {
        try {
            return T.valueOf(enumType, string);
        }catch(IllegalArgumentException ignored) {
            return null;
        }
    }
}
