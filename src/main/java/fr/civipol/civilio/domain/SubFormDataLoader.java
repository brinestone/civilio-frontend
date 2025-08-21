package fr.civipol.civilio.domain;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

public interface SubFormDataLoader {
    Collection<Map<String, Object>> loadSubFormData(String... fieldKeys);
//    Optional<?> loadValueAt(String fieldKey, int ordinal);
}
