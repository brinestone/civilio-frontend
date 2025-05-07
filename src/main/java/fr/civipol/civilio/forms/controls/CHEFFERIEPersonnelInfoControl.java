package fr.civipol.civilio.forms.controls;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.CHEFFERIEPersonnelInfoViewModel;
import fr.civipol.civilio.domain.FOSAPersonnelInfoViewModel;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.forms.field.CHEFFERIEPersonnelInfoField;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.ObservableSet;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;


public class CHEFFERIEPersonnelInfoControl extends SimpleControl<CHEFFERIEPersonnelInfoField> {
    private final BooleanProperty listChanged = new SimpleBooleanProperty();
    private Label fieldLabel, totalCountLabel;
    private CheckBox cbSelectAll;
    private Button btnRemoveSelection, btnAdd;
    private HBox actionBar;
    private ObservableSet<CHEFFERIEPersonnelInfoViewModel> selectedItems;
    private TableView<CHEFFERIEPersonnelInfoViewModel> tvPersonnel;
    private TableColumn<CHEFFERIEPersonnelInfoViewModel, Boolean> tcSelection, tcHasCSTraining;
    private TableColumn<CHEFFERIEPersonnelInfoViewModel, String> tcNames, tcRole, tcPhone;
    private TableColumn<CHEFFERIEPersonnelInfoViewModel, PersonnelInfo.Gender> tcGender;
    private TableColumn<CHEFFERIEPersonnelInfoViewModel, Integer> tcAge;
    private TableColumn<CHEFFERIEPersonnelInfoViewModel, PersonnelInfo.EducationLevel> tcEducationLevel;
    private TableColumn<CHEFFERIEPersonnelInfoViewModel, PersonnelInfo.ComputerKnowledgeLevel> tcComputerKnowledge;
}
