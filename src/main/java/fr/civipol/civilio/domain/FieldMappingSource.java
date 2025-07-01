package fr.civipol.civilio.domain;

import java.util.Collection;
import java.util.function.Consumer;

public interface FieldMappingSource {
    void findAllFields(Consumer<Collection<String>> callback);

//    Optional<FieldMapping> findMappingFor(String form, String field);
}
