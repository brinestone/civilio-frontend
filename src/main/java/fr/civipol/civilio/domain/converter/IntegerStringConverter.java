package fr.civipol.civilio.domain.converter;

import org.apache.commons.lang3.StringUtils;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Optional;
import java.util.function.Predicate;

public class IntegerStringConverter extends CachedStringConverter<Integer> {
    private final NumberFormat formatter = NumberFormat.getNumberInstance();
    private Predicate<Integer> validator;

    public IntegerStringConverter withValidator(Predicate<Integer> validator) {
        this.validator = validator;
        return this;
    }

    @Override
    public String doToString(Integer object) {
        this.value = object;
        return Optional.ofNullable(object)
                .map(o -> NumberFormat.getNumberInstance().format(object))
                .orElse("");
    }

    @Override
    protected Integer doFromString(String s) {
        return Optional.ofNullable(s)
                .filter(StringUtils::isNotBlank)
                .map(v -> {
                    try {
                        return formatter.parse(v).intValue();
                    } catch (ParseException ex) {
                        return null;
                    }
                }).filter(i -> {
                    if (validator == null) return true;
                    return validator.test(i);
                })
                .orElse(this.value);
    }
}
