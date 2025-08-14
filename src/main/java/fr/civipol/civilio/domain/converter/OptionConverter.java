package fr.civipol.civilio.domain.converter;

import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.form.field.Option;
import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;

import java.util.Collection;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

public class OptionConverter extends StringConverter<Option> {
    private final TranslationService translationService;
    private final Function<String, Option> optionSource;

    private OptionConverter(TranslationService translationService, Function<String, Option> optionSource) {
        this.translationService = translationService;
        this.optionSource = optionSource;
    }

    public static OptionConverter usingOptions(TranslationService ts, Collection<Option> options) {
        return new OptionConverter(ts, v -> Optional.ofNullable(options)
                .stream()
                .flatMap(Collection::stream)
                .filter(o -> Objects.equals(o.value(), v))
                .findFirst()
                .orElse(null));
    }

    public static OptionConverter usingOptions(Collection<Option> options) {
        return usingOptions(null, options);
    }

    @Override
    public String toString(Option object) {
        final var wrapper = Optional.ofNullable(translationService);
        if (wrapper.isPresent() && Optional.ofNullable(object).map(Option::i18nKey).filter(StringUtils::isNotBlank).isPresent())
            return wrapper.get().translate(object.i18nKey());
        else if (Optional.ofNullable(object).map(Option::label).filter(StringUtils::isNotBlank).isPresent())
            return object.label();
        return "";
    }

    @Override
    public Option fromString(String string) {
        return Optional.ofNullable(string)
                .filter(StringUtils::isNotBlank)
                .map(optionSource)
                .orElse(null);
    }
}
