package fr.civipol.civilio.domain;

import java.util.Collection;
import java.util.Map;

public interface SubFormDataLoader {
    Collection<Map<String, Object>> loadSubFormData(String... fieldKeys);
}
