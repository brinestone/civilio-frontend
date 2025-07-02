package fr.civipol.civilio.domain;

import fr.civipol.civilio.entity.FieldMapping;

import java.util.Collection;
import java.util.function.Consumer;

public interface FieldMappingSource {
    void findAllDbColumns(String form, Consumer<Collection<String>> callback);

    void findConfiguredMappings(String form, Consumer<Collection<FieldMapping>> callback);
}
