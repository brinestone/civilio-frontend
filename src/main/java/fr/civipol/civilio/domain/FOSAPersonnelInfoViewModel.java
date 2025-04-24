package fr.civipol.civilio.domain;

import fr.civipol.civilio.entity.PersonnelInfo;
import javafx.beans.property.*;
import lombok.Getter;

public class FOSAPersonnelInfoViewModel {
    @Getter
    private final PersonnelInfo personnelInfo;
    private final StringProperty names, role, phone;
    private final BooleanProperty selected, hasCivilStatusTraining;
    private final ObjectProperty<Integer> age;
    private final ObjectProperty<PersonnelInfo.EducationLevel> educationLevel;
    private final ObjectProperty<PersonnelInfo.ComputerKnowledgeLevel> computerKnowledgeLevel;
    private final ObjectProperty<PersonnelInfo.Gender> gender;

    public FOSAPersonnelInfoViewModel(PersonnelInfo info) {
        this.personnelInfo = info;
        names = new SimpleStringProperty(info, "names", info.getNames());
        role = new SimpleStringProperty(info, "role", info.getRole());
        phone = new SimpleStringProperty(info, "phone", info.getPhone());
        selected = new SimpleBooleanProperty(this, "selected", false);
        hasCivilStatusTraining = new SimpleBooleanProperty(info, "hasCivilStatusTraining", info.getCivilStatusTraining());
        educationLevel = new SimpleObjectProperty<>(info, "educationLevel", info.getEducationLevel());
        computerKnowledgeLevel = new SimpleObjectProperty<>(info, "computerKnowledgeLevel", info.getComputerKnowledgeLevel());
        gender = new SimpleObjectProperty<>(info, "gender", info.getGender());
        age = new SimpleObjectProperty<>(info, "age", info.getAge());

        age.addListener((ob, ov, nv) -> info.setAge(nv));
        gender.addListener((ob, ov, nv) -> info.setGender(nv));
        computerKnowledgeLevel.addListener((ob, ov, nv) -> info.setComputerKnowledgeLevel(nv));
        educationLevel.addListener((ob, ov, nv) -> info.setEducationLevel(nv));
        hasCivilStatusTraining.addListener((ob, ov, nv) -> info.setCivilStatusTraining(nv));
        role.addListener((ob, ov, nv) -> info.setRole(nv));
        names.addListener((ob, ov, nv) -> info.setNames(nv));
    }

    public void setPhone(String phone) {
        this.phone.set(phone);
    }

    public void setAge(Integer age) {
        this.age.set(age);
    }

    public void setGender(PersonnelInfo.Gender gender) {
        this.gender.set(gender);
    }

    public void setComputerKnowledgeLevel(PersonnelInfo.ComputerKnowledgeLevel val) {
        computerKnowledgeLevel.set(val);
    }

    public void setEducationLevel(PersonnelInfo.EducationLevel level) {
        educationLevel.set(level);
    }

    public void setRole(String role) {
        this.role.set(role);
    }

    public void setNames(String names) {
        this.names.set(names);
    }

    public void setSelected(Boolean value) {
        this.selected.setValue(value);
    }

    public Boolean isSelected() {
        return selected.get();
    }

    public ObjectProperty<PersonnelInfo.ComputerKnowledgeLevel> computerKnowledgeLevelProperty() {
        return computerKnowledgeLevel;
    }

    public ObjectProperty<PersonnelInfo.EducationLevel> educationLevelProperty() {
        return educationLevel;
    }

    public ObjectProperty<Integer> ageProperty() {
        return age;
    }

    public ObjectProperty<PersonnelInfo.Gender> genderProperty() {
        return gender;
    }

    public StringProperty phoneProperty() {
        return phone;
    }

    public StringProperty roleProperty() {
        return role;
    }

    public StringProperty namesProperty() {
        return names;
    }

    public BooleanProperty hasCivilStatusTrainingProperty() {
        return hasCivilStatusTraining;
    }

    public BooleanProperty selectedProperty() {
        return selected;
    }
}
