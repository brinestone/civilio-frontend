package fr.civipol.civilio.entity;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
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

    private final StringProperty nom = new SimpleStringProperty();
    private final StringProperty prenom = new SimpleStringProperty();
    private final StringProperty fonction = new SimpleStringProperty();
    private final StringProperty email = new SimpleStringProperty();
    public StringProperty nomProperty() { return nom; }
    public String getNom() { return nom.get(); }
    public void setNom(String value) { nom.set(value); }

    public StringProperty prenomProperty() { return prenom; }
    public String getPrenom() { return prenom.get(); }
    public void setPrenom(String value) { prenom.set(value); }

    public StringProperty fonctionProperty() { return fonction; }
    public String getFonction() { return fonction.get(); }
    public void setFonction(String value) { fonction.set(value); }


    public StringProperty emailProperty() { return email; }
    public String getEmail() { return email.get(); }
    public void setEMail(String value) { email.set(value); }
}
