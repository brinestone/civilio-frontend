package fr.civipol.civilio.domain;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FieldChange {
    private String field;
    private Object newValue, oldValue;
    private int ordinal;
}
