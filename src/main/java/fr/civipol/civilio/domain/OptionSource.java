package fr.civipol.civilio.domain;

import fr.civipol.civilio.form.field.Option;

import java.util.Collection;

public interface OptionSource {
    Collection<Option> findOptions(String group, String parent);

    default Collection<Option> findOptions(String group) {
        return findOptions(group, null);
    }
}
