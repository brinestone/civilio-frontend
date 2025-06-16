package fr.civipol.civilio.form.field;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.control.fosa.PersonnelInfoControl;
import fr.civipol.civilio.util.NotifyCallback;
import javafx.beans.property.ListProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;

import java.util.List;

public class PersonnelInfoField extends DataField<ListProperty<PersonnelInfo>, List<PersonnelInfo>, PersonnelInfoField> {
    private static final String ADD_ROW_LABEL = "controls.stats_collector.columns.add_new";
    private static final String REMOVE_SELECTION_LABEL = "controls.stats_collector.actions.remove_selection";
    private static final String NAME_COLUMN_LABEL = "controls.personnel_info.columns.name";
    private static final String ROLE_COLUMN_LABEL = "controls.personnel_info.columns.role";
    private static final String GENDER_COLUMN_LABEL = "controls.personnel_info.columns.gender";
    private static final String PHONE_COLUMN_LABEL = "controls.personnel_info.columns.phone";
    private static final String AGE_COLUMN_LABEL = "controls.personnel_info.columns.age";
    private static final String EMAIL_COLUMN_LABEL = "controls.personnel_info.columns.email";
    private static final String HAS_CS_TRAINING_COLUMN_LABEL = "controls.personnel_info.columns.has_cs_training";
    private static final String EDUCATION_LEVEL_COLUMN_LABEL = "controls.personnel_info.columns.education_level";
    private static final String PC_KNOWLEDGE_COLUMN_LABEL = "controls.personnel_info.columns.pc_knowledge";
    private final StringProperty emailColumnLabel, addRowLabel, removeSelectionLabel, nameColumnLabel, roleColumnLabel, genderColumnLabel, phoneColumnLabel, ageColumnLabel, hasCivilStatusTrainingColumnLabel, educationLevelColumnLabel, computerKnowledgeLevelColumnLabel;
    private ListProperty<Option> genderOptions, educationLevelOptions, computerKnowledgeLevels;

    protected PersonnelInfoField(ListProperty<PersonnelInfo> valueProperty, ListProperty<PersonnelInfo> persistentValueProperty) {
        super(valueProperty, persistentValueProperty);
        genderOptions = new SimpleListProperty<>(this, "genders", FXCollections.observableArrayList());
        educationLevelOptions = new SimpleListProperty<>(this, "educationLevels", FXCollections.observableArrayList());
        computerKnowledgeLevels = new SimpleListProperty<>(this, "computerKnowledgeLevels", FXCollections.observableArrayList());
        addRowLabel = new SimpleStringProperty(this, "add-row", ADD_ROW_LABEL);
        removeSelectionLabel = new SimpleStringProperty(this, "remove-selection", REMOVE_SELECTION_LABEL);
        roleColumnLabel = new SimpleStringProperty();
        genderColumnLabel = new SimpleStringProperty();
        phoneColumnLabel = new SimpleStringProperty();
        emailColumnLabel = new SimpleStringProperty();
        nameColumnLabel = new SimpleStringProperty();
        ageColumnLabel = new SimpleStringProperty();
        hasCivilStatusTrainingColumnLabel = new SimpleStringProperty();
        educationLevelColumnLabel = new SimpleStringProperty();
        computerKnowledgeLevelColumnLabel = new SimpleStringProperty();
    }

    @SuppressWarnings("DuplicatedCode")
    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        addRowLabel.set(service.translate(ADD_ROW_LABEL));
        removeSelectionLabel.set(service.translate(REMOVE_SELECTION_LABEL));
        roleColumnLabel.set(service.translate(ROLE_COLUMN_LABEL));
        genderColumnLabel.set(service.translate(GENDER_COLUMN_LABEL));
        emailColumnLabel.set(service.translate(EMAIL_COLUMN_LABEL));
        phoneColumnLabel.set(service.translate(PHONE_COLUMN_LABEL));
        nameColumnLabel.set(service.translate(NAME_COLUMN_LABEL));
        ageColumnLabel.set(service.translate(AGE_COLUMN_LABEL));
        hasCivilStatusTrainingColumnLabel.set(service.translate(HAS_CS_TRAINING_COLUMN_LABEL));
        educationLevelColumnLabel.set(service.translate(EDUCATION_LEVEL_COLUMN_LABEL));
        computerKnowledgeLevelColumnLabel.set(service.translate(PC_KNOWLEDGE_COLUMN_LABEL));
    }

    public StringProperty computerKnowledgeLevelColumnLabelProperty() {
        return computerKnowledgeLevelColumnLabel;
    }

    public StringProperty educationLevelColumnLabelProperty() {
        return educationLevelColumnLabel;
    }

    public StringProperty hasCivilStatusTrainingColumnLabelProperty() {
        return hasCivilStatusTrainingColumnLabel;
    }

    public StringProperty ageColumnLabelProperty() {
        return ageColumnLabel;
    }

    public StringProperty nameColumnLabelProperty() {
        return nameColumnLabel;
    }

    public StringProperty phoneColumnLabelProperty() {
        return phoneColumnLabel;
    }

    public StringProperty genderColumnLabelProperty() {
        return genderColumnLabel;
    }

    public StringProperty roleColumnLabelProperty() {
        return roleColumnLabel;
    }

    public StringProperty removeSelectionLabelProperty() {
        return removeSelectionLabel;
    }

    public StringProperty addRowLabelProperty() {
        return addRowLabel;
    }

    public StringProperty emailColumnLabelProperty() {
        return emailColumnLabel;
    }

    public ListProperty<Option> educationLevelOptionsProperty() {
        return educationLevelOptions;
    }

    public ListProperty<Option> computerKnowledgeLevelsProperty() {
        return computerKnowledgeLevels;
    }

    public ListProperty<Option> genderOptionsProperty() {
        return genderOptions;
    }

    public PersonnelInfoField genders(ListProperty<Option> genders) {
        this.genderOptions = genders;
        return this;
    }

    public PersonnelInfoField computerKnowledgeLevels(ListProperty<Option> levels) {
        this.computerKnowledgeLevels = levels;
        return this;
    }

    public PersonnelInfoField educationLevels(ListProperty<Option> levels) {
        this.educationLevelOptions = levels;
        return this;
    }

    public static PersonnelInfoField personnelInfoField(
            ObservableList<PersonnelInfo> items,
            TranslationService translationService,
            NotifyCallback changeCallback) {
        return new PersonnelInfoField(new SimpleListProperty<>(items), new SimpleListProperty<>(FXCollections.observableArrayList()))
                .render(() -> new PersonnelInfoControl(translationService, changeCallback));
    }
}
