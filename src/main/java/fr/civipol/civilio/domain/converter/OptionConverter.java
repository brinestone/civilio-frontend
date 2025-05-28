package fr.civipol.civilio.domain.converter;

import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.form.field.Option;
import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;

import java.util.Optional;

public class OptionConverter extends StringConverter<Option> {
    private final TranslationService translationService;
    private Option value;

    public OptionConverter(TranslationService translationService) {
        this.translationService = translationService;
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
        return value;
    }
}
