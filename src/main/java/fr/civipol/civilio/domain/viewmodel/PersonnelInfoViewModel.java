package fr.civipol.civilio.domain.viewmodel;

import fr.civipol.civilio.entity.PersonnelInfo;
import javafx.beans.property.*;
import lombok.Getter;

public class PersonnelInfoViewModel {
    @Getter
    private final PersonnelInfo personnelInfo;
    private final StringProperty names, role, phone, educationLevel, computerKnowledgeLevel, gender, email;
    private final BooleanProperty selected, hasCivilStatusTraining;
    private final ObjectProperty<Integer> age;

    public PersonnelInfoViewModel(PersonnelInfo info) {
        this.personnelInfo = info;
        names = new SimpleStringProperty(info, "names", info.getNames());
        role = new SimpleStringProperty(info, "role", info.getRole());
        phone = new SimpleStringProperty(info, "phone", info.getPhone());
        email = new SimpleStringProperty(info, "email", info.getEmail());
        selected = new SimpleBooleanProperty(this, "selected", false);
        hasCivilStatusTraining = new SimpleBooleanProperty(info, "hasCivilStatusTraining", info.getCivilStatusTraining());
        educationLevel = new SimpleStringProperty(info, "educationLevel", info.getEducationLevel());
        computerKnowledgeLevel = new SimpleStringProperty(info, "computerKnowledgeLevel", info.getComputerKnowledgeLevel());
        gender = new SimpleStringProperty(info, "gender", info.getGender());
        age = new SimpleObjectProperty<>(info, "age", info.getAge());

        age.addListener((ob, ov, nv) -> info.setAge(nv));
        phone.addListener((ob, ov, nv) -> info.setPhone(nv));
        email.addListener((ob, ov, nv) -> info.setEmail(nv));
        gender.addListener((ob, ov, nv) -> info.setGender(nv));
        computerKnowledgeLevel.addListener((ob, ov, nv) -> info.setComputerKnowledgeLevel(nv));
        educationLevel.addListener((ob, ov, nv) -> info.setEducationLevel(nv));
        hasCivilStatusTraining.addListener((ob, ov, nv) -> info.setCivilStatusTraining(nv));
        role.addListener((ob, ov, nv) -> info.setRole(nv));
        names.addListener((ob, ov, nv) -> info.setNames(nv));
    }

    public void setEmail(String email) {
        this.email.setValue(email);
    }

    public void setPhone(String phone) {
        this.phone.set(phone);
    }

    public void setAge(Integer age) {
        this.age.set(age);
    }

    public void setGender(String gender) {
        this.gender.set(gender);
    }

    public void setComputerKnowledgeLevel(String val) {
        computerKnowledgeLevel.set(val);
    }

    public void setHasCivilStatusTraining(boolean v) {
        hasCivilStatusTraining.set(v);
    }

    public void setEducationLevel(String level) {
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

    public StringProperty emailProperty() {
        return email;
    }

    public StringProperty computerKnowledgeLevelProperty() {
        return computerKnowledgeLevel;
    }

    public StringProperty educationLevelProperty() {
        return educationLevel;
    }

    public ObjectProperty<Integer> ageProperty() {
        return age;
    }

    public StringProperty genderProperty() {
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
