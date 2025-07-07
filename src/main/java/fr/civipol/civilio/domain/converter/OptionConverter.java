package fr.civipol.civilio.domain.converter;

import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.form.field.Option;
import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;

import java.util.Optional;
import java.util.ResourceBundle;
import java.util.function.Function;

public class OptionConverter extends StringConverter<Option> {
    private final TranslationService translationService;
    private final Function<String, Option> optionSource;
    private Option value;

    public OptionConverter(TranslationService translationService, Function<String, Option> optionSource) {
        this.translationService = translationService;
        this.optionSource = optionSource;
    }

    @Override
    public String toString(Option object) {
        value = object;
        if (Optional.ofNullable(object).map(Option::i18nKey).filter(StringUtils::isNotBlank).isPresent())
            return translationService.translate(object.i18nKey());
        else if (Optional.ofNullable(object).map(Option::label).filter(StringUtils::isNotBlank).isPresent())
            return object.label();
        return "";
    }

    @Override
    public Option fromString(String string) {
        final var value = Optional.ofNullable(string)
                .filter(StringUtils::isNotBlank)
                .map(optionSource)
                .orElse(this.value);
        this.value = value;
        return value;
    }

    public static OptionConverter usingResourceBundle(String baseName, Function<String, Option> optionSource) {
        return new OptionConverter(new ResourceBundleService(ResourceBundle.getBundle(baseName)), optionSource);
    }
}
