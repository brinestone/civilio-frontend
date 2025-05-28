package fr.civipol.civilio.form.control.fosa;

import com.dlsc.formsfx.view.controls.SimpleControl;
import com.google.common.base.Objects;
import fr.civipol.civilio.domain.converter.EnumStringConverter;
import fr.civipol.civilio.domain.converter.IntegerStringConverter;
import fr.civipol.civilio.domain.viewmodel.FOSAPersonnelInfoViewModel;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.field.FOSAPersonnelInfoField;
import javafx.beans.Observable;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableSet;
import javafx.collections.SetChangeListener;
import javafx.event.ActionEvent;
import javafx.geometry.HPos;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.ComboBoxTableCell;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.scene.layout.HBox;
import javafx.util.converter.DefaultStringConverter;
import org.controlsfx.control.tableview2.cell.TextField2TableCell;

import java.util.Collection;
import java.util.Locale;
import java.util.Optional;

public class FOSAPersonnelInfoControl extends SimpleControl<FOSAPersonnelInfoField> {
    private final BooleanProperty listChanged = new SimpleBooleanProperty();
    private Label fieldLabel, totalCountLabel;
    private CheckBox cbSelectAll;
    private Button btnRemoveSelection, btnAdd;
    private HBox actionBar;
    private ObservableSet<FOSAPersonnelInfoViewModel> selectedItems;
    private TableView<FOSAPersonnelInfoViewModel> tvPersonnel;
    private TableColumn<FOSAPersonnelInfoViewModel, Boolean> tcSelection, tcHasCSTraining;
    private TableColumn<FOSAPersonnelInfoViewModel, String> tcNames, tcRole, tcPhone;
    private TableColumn<FOSAPersonnelInfoViewModel, PersonnelInfo.Gender> tcGender;
    private TableColumn<FOSAPersonnelInfoViewModel, Integer> tcAge;
    private TableColumn<FOSAPersonnelInfoViewModel, PersonnelInfo.EducationLevel> tcEducationLevel;
    private TableColumn<FOSAPersonnelInfoViewModel, PersonnelInfo.ComputerKnowledgeLevel> tcComputerKnowledge;

    @Override
    @SuppressWarnings("unchecked")
    public void layoutParts() {
        super.layoutParts();
        tcSelection.setGraphic(cbSelectAll);
        tcSelection.setPrefWidth(30);
        tcSelection.setMaxWidth(30);
        tcNames.setPrefWidth(200);
        tcGender.setPrefWidth(100);
        tcPhone.setPrefWidth(150);
        tcRole.setPrefWidth(150);
        tcHasCSTraining.setPrefWidth(100);
        tcComputerKnowledge.setPrefWidth(200);
        tcEducationLevel.setPrefWidth(200);
        tcAge.setPrefWidth(80);
        setVgap(5.0);
        actionBar.getChildren().setAll(btnRemoveSelection, btnAdd);
        actionBar.setSpacing(5);
        actionBar.setAlignment(Pos.CENTER_RIGHT);
        tvPersonnel.getColumns().setAll(tcSelection, tcNames, tcGender, tcAge, tcHasCSTraining, tcEducationLevel, tcComputerKnowledge);
        add(fieldLabel, 0, 0, 3, 1);
        add(tvPersonnel, 0, 1, 12, 1);
        add(actionBar, 10, 0, 2, 1);
        add(totalCountLabel, 0, 2, 1, 1);
        setHalignment(actionBar, HPos.RIGHT);
        tvPersonnel.setPrefHeight(300);
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        btnAdd.setOnAction(this::onAddButtonClicked);
        btnRemoveSelection.setOnAction(this::onRemoveSelectionButtonClicked);
        tcNames.setOnEditCommit(e -> e.getRowValue().setNames(e.getNewValue()));
        tcRole.setOnEditCommit(e -> e.getRowValue().setRole(e.getNewValue()));
        tcPhone.setOnEditCommit(e -> e.getRowValue().setPhone(e.getNewValue()));
        tcGender.setOnEditCommit(e -> e.getRowValue().setGender(e.getNewValue()));
        tcAge.setOnEditCommit(e -> e.getRowValue().setAge(e.getNewValue()));
        tcEducationLevel.setOnEditCommit(e -> e.getRowValue().setEducationLevel(e.getNewValue()));
        tcComputerKnowledge.setOnEditCommit(e -> e.getRowValue().setComputerKnowledgeLevel(e.getNewValue()));
        cbSelectAll.setOnAction(e -> tvPersonnel.getItems().forEach(i -> i.setSelected(cbSelectAll.isSelected())));
    }

    private void onRemoveSelectionButtonClicked(ActionEvent ignored) {
        for (var item : selectedItems) {
            field.valueProperty().remove(item.getPersonnelInfo());
        }
        selectedItems.clear();
    }

    private void onAddButtonClicked(ActionEvent ignored) {
        field.getValue().add(PersonnelInfo.builder().build());
    }

    @Override
    @SuppressWarnings("DuplicatedCode")
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        listChanged.addListener((ob, ov, nv) -> {
            tvPersonnel.getItems().stream()
                    .filter(FOSAPersonnelInfoViewModel::isSelected)
                    .forEach(selectedItems::add);
            tvPersonnel.getItems().stream()
                    .filter(vm -> !vm.isSelected())
                    .forEach(selectedItems::remove);
            if (!nv) return;
            listChanged.set(false);
        });
        field.valueProperty().addListener((ob, ov, nv) -> {
            final var vms = nv.stream()
                    .map(FOSAPersonnelInfoViewModel::new)
                    .peek(vm -> vm.setSelected(selectedItems.stream().anyMatch(vvm -> Objects.equal(vvm.getPersonnelInfo(), vm.getPersonnelInfo()))))
                    .peek(vm -> vm.selectedProperty().addListener((oob, oov, nnv) -> listChanged.set(true)))
                    .toList();
            tvPersonnel.getItems().setAll(vms);
        });
        selectedItems.addListener((SetChangeListener<FOSAPersonnelInfoViewModel>) c -> {
            final var selectionSize = c.getSet().size();
            final var itemsSize = tvPersonnel.getItems().size();

            if (itemsSize == 0) {
                cbSelectAll.setSelected(false);
                return;
            }

            cbSelectAll.setIndeterminate(itemsSize != selectionSize && selectionSize > 0);
            if (!cbSelectAll.isIndeterminate()) {
                cbSelectAll.setSelected(selectionSize == itemsSize);
            }
        });
    }

    @Override
    @SuppressWarnings("DuplicatedCode")
    public void setupBindings() {
        super.setupBindings();
        fieldLabel.textProperty().bind(field.labelProperty());
        totalCountLabel.textProperty().bind(Bindings.size(tvPersonnel.getItems()).asString(Locale.getDefault(), "Total: %d"));
        btnRemoveSelection.textProperty().bind(field.removeSelectionLabelProperty());
        btnRemoveSelection.disableProperty().bind(Bindings.isEmpty(selectedItems));
        btnAdd.textProperty().bind(field.addRowLabelProperty());

        tcHasCSTraining.textProperty().bind(field.hasCivilStatusTrainingColumnLabelProperty());
        tcNames.textProperty().bind(field.nameColumnLabelProperty());
        tcRole.textProperty().bind(field.roleColumnLabelProperty());
        tcPhone.textProperty().bind(field.phoneColumnLabelProperty());
        tcGender.textProperty().bind(field.genderColumnLabelProperty());
        tcAge.textProperty().bind(field.ageColumnLabelProperty());
        tcEducationLevel.textProperty().bind(field.educationLevelColumnLabelProperty());
        tcComputerKnowledge.textProperty().bind(field.computerKnowledgeLevelColumnLabelProperty());

        cbSelectAll.disableProperty().bind(Bindings.isEmpty(tvPersonnel.getItems()));
        tcHasCSTraining.editableProperty().bind(field.editableProperty());
        tcNames.editableProperty().bind(field.editableProperty());
        tcRole.editableProperty().bind(field.editableProperty());
        tcPhone.editableProperty().bind(field.editableProperty());
        tcGender.editableProperty().bind(field.editableProperty());
        tcAge.editableProperty().bind(field.editableProperty());
        tcEducationLevel.editableProperty().bind(field.editableProperty());
        tvPersonnel.editableProperty().bind(field.editableProperty());
        tcComputerKnowledge.editableProperty().bind(field.editableProperty());
    }

    @SuppressWarnings("DuplicatedCode")
    @Override
    public void initializeParts() {
        super.initializeParts();

        tvPersonnel.getItems().setAll(
                Optional.ofNullable(field.getValue())
                        .stream()
                        .flatMap(Collection::stream)
                        .map(FOSAPersonnelInfoViewModel::new)
                        .peek(vm -> vm.selectedProperty().addListener(FOSAPersonnelInfoControl.this::onItemSelectionStatusChanged))
                        .toList()
        );

        btnAdd.setCursor(Cursor.HAND);
        btnRemoveSelection.setCursor(Cursor.HAND);

        tcComputerKnowledge.setCellValueFactory(param -> param.getValue().computerKnowledgeLevelProperty());
        tcComputerKnowledge.setCellFactory(param -> new ComboBoxTableCell<>(new EnumStringConverter<>(PersonnelInfo.ComputerKnowledgeLevel.class), PersonnelInfo.ComputerKnowledgeLevel.values()));

        tcEducationLevel.setCellValueFactory(param -> param.getValue().educationLevelProperty());
        tcEducationLevel.setCellFactory(param -> new ComboBoxTableCell<>(new EnumStringConverter<>(PersonnelInfo.EducationLevel.class), PersonnelInfo.EducationLevel.values()));

        tcAge.setCellValueFactory(param -> param.getValue().ageProperty());
        tcAge.setCellFactory(param -> new TextFieldTableCell<>(new IntegerStringConverter()));

        tcGender.setCellFactory(param -> new ComboBoxTableCell<>(new EnumStringConverter<>(PersonnelInfo.Gender.class), PersonnelInfo.Gender.values()));
        tcGender.setCellValueFactory(param -> param.getValue().genderProperty());

        tcPhone.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
        tcPhone.setCellValueFactory(param -> param.getValue().phoneProperty());

        tcRole.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
        tcRole.setCellValueFactory(param -> param.getValue().roleProperty());

        tcNames.setCellFactory(param -> new TextField2TableCell<>(new DefaultStringConverter()));
        tcNames.setCellValueFactory(param -> param.getValue().namesProperty());

        tcHasCSTraining.setCellFactory(param -> new CheckBoxTableCell<>(index -> {
            final var value = param.getTableView().getItems().get(index);
            return value.hasCivilStatusTrainingProperty();
        }));
        tcHasCSTraining.setCellValueFactory(param -> param.getValue().hasCivilStatusTrainingProperty());

        tcSelection.setCellFactory(param -> new CheckBoxTableCell<>(index -> {
            final var value = param.getTableView().getItems().get(index);
            return value.selectedProperty();
        }));
        tcSelection.setCellValueFactory(param -> param.getValue().selectedProperty());
        tcSelection.setStyle("-fx-alignment: CENTER;");
        tcSelection.setSortable(false);
    }

    private void onItemSelectionStatusChanged(Observable observable, Boolean oldValue, Boolean newValue) {
        listChanged.set(true);
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        fieldLabel = new Label();
        totalCountLabel = new Label();
        cbSelectAll = new CheckBox();
        btnRemoveSelection = new Button();
        btnAdd = new Button();
        actionBar = new HBox();
        selectedItems = FXCollections.observableSet();
        tvPersonnel = new TableView<>();
        tcSelection = new TableColumn<>();
        tcNames = new TableColumn<>();
        tcRole = new TableColumn<>();
        tcHasCSTraining = new TableColumn<>();
        tcPhone = new TableColumn<>();
        tcGender = new TableColumn<>();
        tcAge = new TableColumn<>();
        tcEducationLevel = new TableColumn<>();
        tcComputerKnowledge = new TableColumn<>();
    }
}
