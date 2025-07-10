package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class PersonnelInfo {
    private String names;
    private String gender;
    private String role;
    @Builder.Default
    private String computerKnowledgeLevel = "1";
    private String phone;
    @Builder.Default
    private String educationLevel = "1";
    private String parentIndex;
    private String index;
    private String email;
    @Builder.Default
    private Boolean civilStatusTraining = false;
    private Integer age;
}
