package fr.civipol.civilio.domain;

import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;

import java.util.Locale;
import java.util.Optional;

public class IntegerStringConverter extends StringConverter<Integer> {
    @Override
    public String toString(Integer object) {
        return Optional.ofNullable(object)
                .map(o -> String.format(Locale.getDefault(), "%d", o))
                .orElse("");
    }

    @Override
    public Integer fromString(String string) {
        try {
            return Optional.ofNullable(string)
                    .filter(StringUtils::isNotBlank)
                    .map(Integer::parseUnsignedInt)
                    .orElse(null);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
