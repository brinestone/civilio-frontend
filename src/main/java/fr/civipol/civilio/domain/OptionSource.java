package fr.civipol.civilio.domain;

import fr.civipol.civilio.form.field.Option;

import java.util.Collection;
import java.util.function.Consumer;

public interface OptionSource {
    void get(String form, String group, String parent, Consumer<Collection<Option>> callback);
}
