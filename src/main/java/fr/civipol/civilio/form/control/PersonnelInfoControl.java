package fr.civipol.civilio.form.control;

import com.dlsc.formsfx.model.util.TranslationService;
import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.converter.IntegerStringConverter;
import fr.civipol.civilio.domain.converter.OptionConverter;
import fr.civipol.civilio.domain.viewmodel.PersonnelInfoViewModel;
import fr.civipol.civilio.entity.PersonnelInfo;
import fr.civipol.civilio.form.FieldKeys;
import fr.civipol.civilio.form.field.Option;
import fr.civipol.civilio.form.field.PersonnelInfoField;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.collections.*;
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

import java.util.Locale;
import java.util.function.Consumer;
import java.util.regex.Pattern;

public class PersonnelInfoControl extends SimpleControl<PersonnelInfoField> {
    private static final Pattern PHONE_REGEX = Pattern.compile("^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$");
    private final BooleanProperty listChanged = new SimpleBooleanProperty();
    private final TranslationService translationService;
    private Label fieldLabel, totalCountLabel;
    private CheckBox cbSelectAll;
    private Button btnRemoveSelection, btnAdd;
    private HBox actionBar;
    private ObservableSet<PersonnelInfoViewModel> selectedItems;
    private final ObservableList<PersonnelInfoViewModel> items = FXCollections.observableArrayList();
    private TableView<PersonnelInfoViewModel> tvPersonnel;
    private TableColumn<PersonnelInfoViewModel, Boolean> tcSelection, tcHasCSTraining;
    private TableColumn<PersonnelInfoViewModel, String> tcNames, tcRole, tcPhone;
    private TableColumn<PersonnelInfoViewModel, Option> tcGender;
    private TableColumn<PersonnelInfoViewModel, Integer> tcAge;
    private TableColumn<PersonnelInfoViewModel, Option> tcEducationLevel;
    private TableColumn<PersonnelInfoViewModel, Option> tcComputerKnowledge;
    private TableColumn<PersonnelInfoViewModel, String> tcEmail;
    private final Consumer<FieldChange> updateTrigger;

    public PersonnelInfoControl(TranslationService translationService,
                                Consumer<FieldChange> updateTrigger) {
        this.translationService = translationService;
        this.updateTrigger = updateTrigger;
    }

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
        tvPersonnel.getColumns().setAll(tcSelection, tcNames, tcRole, tcGender, tcPhone, tcEmail, tcAge, tcHasCSTraining, tcEducationLevel, tcComputerKnowledge);
        add(fieldLabel, 0, 0, 3, 1);
        add(tvPersonnel, 0, 1, 12, 1);
        add(actionBar, 10, 0, 2, 1);
        add(totalCountLabel, 0, 2, 1, 1);
        setHalignment(actionBar, HPos.RIGHT);
        tvPersonnel.setPrefHeight(300);
    }

    private PersonnelInfoViewModel personnelInfoToViewModel(PersonnelInfo p) {
        final var vm = new PersonnelInfoViewModel(p);
        vm.setSelected(selectedItems.stream().map(PersonnelInfoViewModel::getPersonnelInfo).anyMatch(v -> v.equals(p)));
        vm.hasCivilStatusTrainingProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_CS_TRAINING));
        vm.selectedProperty().addListener((ob, ov, nv) -> listChanged.set(true));

        vm.namesProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_NAME));
        vm.emailProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_EMAIL));
        vm.ageProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_AGE));
        vm.genderProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_GENDER));
        vm.phoneProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_PHONE));
        vm.computerKnowledgeLevelProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_COMPUTER_LEVEL));
        vm.educationLevelProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_ED_LEVEL));
        vm.roleProperty().addListener((ob, ov, nv) -> triggerUpdate(field.getValue().indexOf(p), ov, nv, FieldKeys.PersonnelInfo.PERSONNEL_POSITION));
        return vm;
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        btnAdd.setOnAction(this::onAddButtonClicked);
        btnRemoveSelection.setOnAction(this::onRemoveSelectionButtonClicked);
        tcNames.setOnEditCommit(e -> e.getRowValue().setNames(e.getNewValue()));
        tcRole.setOnEditCommit(e -> e.getRowValue().setRole(e.getNewValue()));
        tcPhone.setOnEditCommit(e -> {
            final var matcher = PHONE_REGEX.matcher(e.getNewValue());
            if (matcher.matches()) {
                e.getRowValue().setPhone(e.getNewValue());
            } else {
                e.consume();
                e.getTableView().refresh();
            }
        });
        tcGender.setOnEditCommit(e -> e.getRowValue().setGender((String) e.getNewValue().value()));
        tcAge.setOnEditCommit(e -> e.getRowValue().setAge(e.getNewValue()));
        tcEducationLevel.setOnEditCommit(e -> e.getRowValue().setEducationLevel((String) e.getNewValue().value()));
        tcComputerKnowledge.setOnEditCommit(e -> e.getRowValue().setComputerKnowledgeLevel((String) e.getNewValue().value()));
        tcEmail.setOnEditCommit(e -> e.getRowValue().setEmail(e.getNewValue()));
        cbSelectAll.setOnAction(e -> tvPersonnel.getItems().forEach(i -> i.setSelected(cbSelectAll.isSelected())));
    }

    private void triggerDeleteUpdateAt(int index) {
        updateTrigger.accept(new FieldChange(null, 1, 2, index, true));
    }

    private void triggerUpdate(int index, Object oldValue, Object newValue, String field) {
        updateTrigger.accept(new FieldChange(field, newValue, oldValue, index, false));
    }

    private void onRemoveSelectionButtonClicked(ActionEvent ignored) {
        var cnt = 0;
        for (var item : selectedItems) {
            field.valueProperty().remove(item.getPersonnelInfo());
            triggerDeleteUpdateAt(cnt++);
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
        field.valueProperty().addListener((ListChangeListener<PersonnelInfo>) c -> {
            items.clear();
            for (var p : field.getValue()) {
                items.add(personnelInfoToViewModel(p));
            }
            tvPersonnel.refresh();
        });
        listChanged.addListener((ob, ov, nv) -> {
            tvPersonnel.getItems().stream()
                    .filter(PersonnelInfoViewModel::isSelected)
                    .forEach(selectedItems::add);
            tvPersonnel.getItems().stream()
                    .filter(vm -> !vm.isSelected())
                    .forEach(selectedItems::remove);
            if (!nv) return;
            listChanged.set(false);
        });
        selectedItems.addListener((SetChangeListener<PersonnelInfoViewModel>) c -> {
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
        tcEmail.textProperty().bind(field.emailColumnLabelProperty());
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
        tcEmail.editableProperty().bind(field.editableProperty());


    }

    @SuppressWarnings("DuplicatedCode")
    @Override
    public void initializeParts() {
        super.initializeParts();
        tvPersonnel.setItems(items);

        btnAdd.setCursor(Cursor.HAND);
        btnRemoveSelection.setCursor(Cursor.HAND);

        tcComputerKnowledge.setCellValueFactory(param -> new SimpleObjectProperty<>(
                field.computerKnowledgeLevelsProperty().stream()
                        .filter(o -> o.value().equals(param.getValue().computerKnowledgeLevelProperty().getValueSafe()))
                        .findFirst()
                        .orElse(null)
        ));
        tcComputerKnowledge.setCellFactory(param -> new ComboBoxTableCell<>(OptionConverter.usingOptions(translationService, field.computerKnowledgeLevelsProperty())));

        tcEducationLevel.setCellValueFactory(param -> new SimpleObjectProperty<>(
                field.educationLevelOptionsProperty().stream()
                        .filter(o -> o.value().equals(param.getValue().educationLevelProperty().getValueSafe()))
                        .findFirst()
                        .orElse(null)));
        tcEducationLevel.setCellFactory(param -> new ComboBoxTableCell<>(OptionConverter.usingOptions(translationService, field.educationLevelOptionsProperty())));

        tcAge.setCellValueFactory(param -> param.getValue().ageProperty());
        tcAge.setCellFactory(param -> new TextFieldTableCell<>(new IntegerStringConverter()));

        tcGender.setCellFactory(param -> new ComboBoxTableCell<>(OptionConverter.usingOptions(translationService, field.genderOptionsProperty())));
        tcGender.setCellValueFactory(param -> new SimpleObjectProperty<>(
                field.genderOptionsProperty().stream()
                        .filter(o -> o.value().equals(param.getValue().genderProperty().getValueSafe()))
                        .findFirst()
                        .orElse(null)
        ));

        tcPhone.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
        tcPhone.setCellValueFactory(param -> param.getValue().phoneProperty());

        tcRole.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
        tcRole.setCellValueFactory(param -> param.getValue().roleProperty());

        tcNames.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));
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

        tcEmail.setCellValueFactory(param -> param.getValue().emailProperty());
        tcEmail.setCellFactory(param -> new TextFieldTableCell<>(new DefaultStringConverter()));

        tcSelection.setCellValueFactory(param -> param.getValue().selectedProperty());
        tcSelection.setStyle("-fx-alignment: CENTER;");
        tcSelection.setSortable(false);
        for (var p : field.getValue()) {
            items.add(personnelInfoToViewModel(p));
        }
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
        tcPhone = new TableColumn<>();
        tcSelection = new TableColumn<>();
        tcNames = new TableColumn<>();
        tcRole = new TableColumn<>();
        tcHasCSTraining = new TableColumn<>();
        tcGender = new TableColumn<>();
        tcEmail = new TableColumn<>();
        tcAge = new TableColumn<>();
        tcEducationLevel = new TableColumn<>();
        tcComputerKnowledge = new TableColumn<>();
    }
}