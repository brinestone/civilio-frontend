package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class PersonnelInfo {
    private String names, gender, role, computerKnowledgeLevel, phone, educationLevel, index;
    @Builder.Default
    private Boolean civilStatusTraining = false;
    private Integer age;
}
