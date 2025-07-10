package fr.civipol.civilio.domain;

import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.entity.FormType;

import java.util.Collection;
import java.util.function.Consumer;

public interface FieldMappingSource {
    void findAllDbColumns(FormType form, Consumer<Collection<String>> callback);

    void findConfiguredMappings(FormType form, Consumer<Collection<FieldMapping>> callback);
}
