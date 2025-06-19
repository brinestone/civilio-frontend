package fr.civipol.civilio.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DataUpdate {
    private String field;
    private Object newValue, oldValue;
}
