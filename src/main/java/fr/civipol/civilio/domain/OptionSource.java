package fr.civipol.civilio.domain;

import fr.civipol.civilio.form.field.Option;

import java.util.List;

public interface OptionSource {
    void populate(String form, String group, String parent, List<Option> destination);
}
