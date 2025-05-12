package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class PersonnelInfo {
    private String names, role, phone;
    @Builder.Default
    private Boolean civilStatusTraining = false;
    private Integer age;
    private EducationLevel educationLevel;
    private ComputerKnowledgeLevel computerKnowledgeLevel;
    private Gender gender;

    public enum Gender {
        MALE,
        FEMALE
    }

    public enum EducationLevel {
        NONE,
        PRIMARY,
        SECONDARY,
        UNIVERSITY
    }

    public enum ComputerKnowledgeLevel {
        NONE,
        BASIC,
        GOOD,
        VERY_GOOD
    }
}
