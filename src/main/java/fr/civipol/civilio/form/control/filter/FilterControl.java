package fr.civipol.civilio.form.control.filter;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.filter.FilterCondition;
import fr.civipol.civilio.domain.filter.FilterField;
import fr.civipol.civilio.domain.filter.FilterManager;
import fr.civipol.civilio.domain.filter.FilterOperator;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.form.field.FilterManagerField;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.event.ActionEvent;
import javafx.geometry.HPos;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;
import javafx.util.StringConverter;
import org.apache.commons.lang3.StringUtils;
import org.controlsfx.control.CheckComboBox;
import org.kordamp.ikonli.javafx.FontIcon;

import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

public class FilterControl extends SimpleControl<FilterManagerField> {
    private Label lblField;
    private Button btnAdd;
    private final Collection<FilterOperator> DEFAULT_OPERATORS = Arrays.stream(FilterOperator.values())
            .sorted((o1, o2) -> o1.name().compareToIgnoreCase(o2.name()))
            .toList();

    @Override
    public void layoutParts() {
        super.layoutParts();
        add(lblField, 0, 0, 3, 1);
        add(btnAdd, 11, 0, 1, 1);
        setHalignment(btnAdd, HPos.RIGHT);
        setHgap(5.0);
        setVgap(5.0);
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        btnAdd.setOnAction(this::onBtnAddClicked);
    }

    private void onBtnAddClicked(ActionEvent ignored) {
        field.getValue().conditionsProperty().add(FilterCondition.builder().build());
    }

    @Override
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        field.valueProperty().addListener((ob, ov, nv) -> {
            if (nv == null && ov != null) {
                ov.conditionsProperty().removeListener(this::onConditionsChanged);
                clearConditions();
            } else if (nv != null) {
                ov.conditionsProperty().addListener(this::onConditionsChanged);
            }
        });
        Optional.ofNullable(field.getValue())
                .map(FilterManager::conditionsProperty)
                .ifPresent(v -> v.addListener(this::onConditionsChanged));
    }

    private void clearConditions() {
        getChildren().remove(2, getChildren().size());
    }

    private void onConditionsChanged(ListChangeListener.Change<? extends FilterCondition> c) {
        while (c.next()) {
            if (c.wasAdded()) {
                final var cnt = new AtomicInteger(c.getFrom() + 1);
                final var addedItems = c.getAddedSubList();
                addedItems.forEach(n -> addRow(cnt.getAndIncrement(), n));
            } else if (c.wasRemoved()) {
                final var start = c.getFrom() * 4 + 2;
                final var end = start + 4;
                getChildren().remove(start, end);

                final var wasEndingRemoved = c.getTo() < c.getList().size() - 1;
                if (!wasEndingRemoved) {
                    for (var i = start; i < getChildren().size(); i++) {
                        final var node = getChildren().get(i);
                        setRowIndex(node, Math.max(1, getRowIndex(node) - 1));
                    }
                }
            }
        }
    }

    private void addRow(int row, FilterCondition condition) {
        final var deleteBtn = new Button();
        deleteBtn.setGraphic(new FontIcon("fth-trash"));
        deleteBtn.setOnAction(ignored -> field.getValue().conditionsProperty().remove(condition));
        deleteBtn.setCursor(Cursor.HAND);

        final var propertySelector = new ComboBox<FilterField>();
        propertySelector.getItems().setAll(
                Arrays.stream(FormSubmission.class.getDeclaredFields())
                        .filter(f -> f.isAnnotationPresent(FilterField.class))
                        .map(f -> f.getAnnotation(FilterField.class))
                        .sorted((o1, o2) -> {
                            final var a = field.getResourceBundle().getString(o1.labelKey());
                            final var b = field.getResourceBundle().getString(o2.labelKey());
                            return a.compareTo(b);
                        })
                        .toList()
        );
        propertySelector.setConverter(new StringConverter<>() {
            @Override
            public String toString(FilterField object) {
                propertySelector.setUserData(object);
                return Optional.ofNullable(object)
                        .map(FilterField::labelKey)
                        .map(field.getResourceBundle()::getString)
                        .orElse("");
            }

            @Override
            public FilterField fromString(String string) {
                return (FilterField) propertySelector.getUserData();
            }
        });
        propertySelector.valueProperty().addListener((ob, ov, nv) -> condition.setPropertyName(nv.dbFieldName()));

        final var operatorSelector = new ComboBox<FilterOperator>();
        operatorSelector.setPromptText(field.getResourceBundle().getString("filters.controls.operator.prompt_text"));
        operatorSelector.getItems().setAll(DEFAULT_OPERATORS);
        operatorSelector.setConverter(new StringConverter<>() {
            @Override
            public String toString(FilterOperator object) {
                operatorSelector.setUserData(object);
                return Optional.ofNullable(object)
                        .map(FilterOperator::getLabelKey)
                        .map(field.getResourceBundle()::getString)
                        .orElse("");
            }

            @Override
            public FilterOperator fromString(String string) {
                return (FilterOperator) operatorSelector.getUserData();
            }
        });
        operatorSelector.disableProperty().bind(propertySelector.valueProperty().isNull());
        operatorSelector.valueProperty().addListener((ob, ov, nv) -> condition.setOperator(nv));

        propertySelector.valueProperty().addListener((ob, ov, nv) -> {
            operatorSelector.getItems().setAll(DEFAULT_OPERATORS);
            if (nv == null) {
                operatorSelector.setValue(null);
            } else {
                Arrays.stream(FormSubmission.class.getDeclaredFields())
                        .filter(f -> f.isAnnotationPresent(FilterField.class))
                        .filter(f -> f.getAnnotation(FilterField.class).labelKey().equals(nv.labelKey()))
                        .findFirst()
                        .ifPresent(f -> {
                            if (f.getType().equals(String.class)) {
                                operatorSelector.getItems().setAll(FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.CONTAINS, FilterOperator.STARTS_WITH, FilterOperator.ENDS_WITH, FilterOperator.IN, FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL);
                            } else if (f.getType().equals(Date.class)) {
                                operatorSelector.getItems().setAll(FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.BEFORE, FilterOperator.BEFORE_OR_TODAY, FilterOperator.AFTER, FilterOperator.AFTER_OR_TODAY, FilterOperator.BETWEEN, FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL);
                            }
                        });
            }
        });

        final var changed = new SimpleBooleanProperty();

        propertySelector.valueProperty().addListener((__, ___, ____) -> changed.set(!changed.get()));
        operatorSelector.valueProperty().addListener((__, ___, ____) -> changed.set(!changed.get()));

        changed.addListener((ob, ov, nv) -> {
            final var index = getChildren().indexOf(operatorSelector) + 1;
            Optional.ofNullable(getChildren().get(index))
                    .filter(n -> !n.equals(deleteBtn))
                    .ifPresent(getChildren()::remove);

            if (propertySelector.getValue() == null) {
                final var tf = new TextField(Optional.ofNullable(condition.getValue())
                        .filter(o -> o instanceof String)
                        .filter(o -> StringUtils.isNotBlank(((String) o)))
                        .map(String::valueOf)
                        .orElse(""));
                getChildren().add(index, tf);
                setRowIndex(tf, getRowIndex(operatorSelector));
                setColumnIndex(tf, 6);
                setColumnSpan(tf, 4);
            } else if (operatorSelector.getValue() != null && !operatorSelector.getValue().equals(FilterOperator.IS_NOT_NULL) && !operatorSelector.getValue().equals(FilterOperator.IS_NULL)) {
                Arrays.stream(FormSubmission.class.getDeclaredFields())
                        .filter(f -> f.isAnnotationPresent(FilterField.class))
                        .filter(f -> f.getAnnotation(FilterField.class).labelKey().equals(propertySelector.getValue().labelKey()))
                        .findFirst()
                        .ifPresent(f -> {
                            if (f.getType().equals(String.class)) {
                                if (operatorSelector.getValue().equals(FilterOperator.IN)) {
                                    final var picker = new CheckComboBox<>(FXCollections.observableArrayList(field.getOptionSource().apply(propertySelector.getValue().labelKey())));
                                    picker.setConverter(new StringConverter<>() {
                                        @Override
                                        public String toString(FilterManagerField.Option object) {
                                            picker.setUserData(object);
                                            return Optional.ofNullable(object)
                                                    .map(FilterManagerField.Option::label)
                                                    .orElse("");
                                        }

                                        @Override
                                        public FilterManagerField.Option fromString(String string) {
                                            return (FilterManagerField.Option) picker.getUserData();
                                        }
                                    });
                                    picker.getCheckModel().getCheckedItems().addListener((ListChangeListener<FilterManagerField.Option>) c -> condition.setValue(
                                            picker.getCheckModel().getCheckedItems().stream()
                                                    .map(FilterManagerField.Option::value)
                                                    .toList()
                                    ));
                                    getChildren().add(index, picker);
                                    setRowIndex(picker, getRowIndex(operatorSelector));
                                    setColumnIndex(picker, 6);
                                    setColumnSpan(picker, 5);
                                } else {
                                    final var tf = new TextField("");
                                    tf.textProperty().addListener((oob, oov, nnv) -> condition.setValue(nnv));
                                    getChildren().add(index, tf);
                                    setRowIndex(tf, getRowIndex(operatorSelector));
                                    setColumnIndex(tf, 6);
                                    setColumnSpan(tf, 5);
                                }
                            } else if (f.getType().equals(Date.class)) {
                                if (operatorSelector.getValue().equals(FilterOperator.BETWEEN)) {
                                    final var container = new HBox();
                                    container.setAlignment(Pos.BOTTOM_LEFT);
                                    container.setSpacing(2.0);

                                    final var minDateControl = new DatePicker(Optional.ofNullable(condition.getRangeMin())
                                            .filter(v -> v.getClass().equals(Date.class))
                                            .map(v -> (Date) v)
                                            .map(d -> d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate())
                                            .orElse(null));
                                    final var maxDateControl = new DatePicker(Optional.ofNullable(condition.getRangeMax())
                                            .filter(v -> v.getClass().equals(Date.class))
                                            .map(v -> (Date) v)
                                            .map(d -> d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate())
                                            .orElse(null));

                                    maxDateControl.valueProperty().addListener((oob, oov, nnv) -> {
                                        final var date = Date.from(nnv.atStartOfDay(ZoneId.systemDefault()).toInstant());
                                        condition.setRangeMax(date);
                                    });

                                    minDateControl.valueProperty().addListener((oob, oov, nnv) -> {
                                        final var date = Date.from(nnv.atStartOfDay(ZoneId.systemDefault()).toInstant());
                                        condition.setRangeMin(date);
                                    });

                                    container.getChildren().addAll(minDateControl, new Label(","), maxDateControl);
                                    getChildren().add(index, container);
                                    setRowIndex(container, getRowIndex(operatorSelector));
                                    setColumnIndex(container, 6);
                                    setColumnSpan(container, 5);
                                } else {
                                    final var control = new DatePicker(Optional.ofNullable(condition.getValue())
                                            .filter(o -> o instanceof Date)
                                            .map(o -> (Date) o)
                                            .map(d -> d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate())
                                            .orElse(null)
                                    );
                                    control.valueProperty().addListener((oob, oov, nnv) -> {
                                        final var date = Date.from(nnv.atStartOfDay(ZoneId.systemDefault()).toInstant());
                                        condition.setValue(date);
                                    });

                                    getChildren().add(index, control);
                                    setRowIndex(control, getRowIndex(operatorSelector));
                                    setColumnIndex(control, 6);
                                    setColumnSpan(control, 5);
                                }
                            }
                        });
            }
        });
        Control valueField = new TextField(Optional.ofNullable(condition.getValue())
                .filter(o -> o instanceof String)
                .filter(o -> StringUtils.isNotBlank(((String) o)))
                .map(String::valueOf)
                .orElse(""));

        add(propertySelector, 0, row, 3, 1);
        add(operatorSelector, 3, row, 3, 1);
        add(valueField, 6, row, 5, 1);
        add(deleteBtn, 11, row, 1, 1);
        setHalignment(deleteBtn, HPos.RIGHT);
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        lblField.textProperty().bind(field.labelProperty());
    }

    @Override
    public void initializeParts() {
        super.initializeParts();
        btnAdd.setGraphic(new FontIcon("fth-plus"));
        btnAdd.setCursor(Cursor.HAND);
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        btnAdd = new Button();
        lblField = new Label();
    }
}
