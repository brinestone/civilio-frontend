package fr.civipol.civilio.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FieldChange {
    private String field;
    private Object newValue, oldValue;
    private int ordinal;
    @Builder.Default
    private boolean deletionChange = false;
}
