package fr.civipol.civilio.form;

import fr.civipol.civilio.domain.OptionSource;
import fr.civipol.civilio.form.field.Option;
import javafx.beans.property.ListProperty;

import java.util.function.BiFunction;
import java.util.function.Function;

public class CSCFormDataManager extends FormDataManager {
    private final OptionSource optionSource;

    public CSCFormDataManager(Function<String, ?> valueSource,
                              BiFunction<String, Integer, String> keyMaker,
                              Function<String, String> keyExtractor,
                              OptionSource optionSource) {
        super(valueSource, keyMaker, keyExtractor);
        this.optionSource = optionSource;
    }

    @Override
    public void loadInitialOptions() {

    }

    @Override
    public void trackFieldChanges() {

    }

    @Override
    public String getIndexFieldKey() {
        return null;
    }

    @Override
    protected String getValidationCodeFieldKey() {
        return null;
    }

    @Override
    public ListProperty<Option> getOptionsFor(String field) {
        return null;
    }
}
