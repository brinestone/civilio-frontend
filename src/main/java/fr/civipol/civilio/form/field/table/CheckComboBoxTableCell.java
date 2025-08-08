package fr.civipol.civilio.form.field.table;

import javafx.collections.ListChangeListener;
import javafx.collections.ObservableList;
import javafx.scene.control.TableCell;
import javafx.util.StringConverter;
import lombok.RequiredArgsConstructor;
import org.controlsfx.control.CheckComboBox;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class CheckComboBoxTableCell<S, T> extends TableCell<S, List<T>> {
    private CheckComboBox<T> checkComboBox;
    private final StringConverter<T> stringConverter;
    private final ObservableList<T> options;

    @Override
    public void startEdit() {
        if (!isEditable() || !getTableView().isEditable() || !isEditing()) return;
        super.startEdit();
        if (checkComboBox == null)
            createCheckComboBox();
        setGraphic(checkComboBox);
        setText(null);
    }

    @Override
    public void cancelEdit() {
        super.cancelEdit();
        setGraphic(null);
        updateText();
    }

    @Override
    protected void updateItem(List<T> item, boolean empty) {
        super.updateItem(item, empty);
        if (empty || item == null) {
            setText(null);
            setGraphic(null);
        } else {
            updateText();
            if (!isEditing()) return;
            if (checkComboBox != null) {
                checkComboBox.getCheckModel().clearChecks();
                item.forEach(checkComboBox.getCheckModel()::check);
            }
            setGraphic(checkComboBox);
            setText(null);
        }
    }

    private void updateText() {
        setText(Optional.ofNullable(getItem())
                .filter(Predicate.not(Collection::isEmpty))
                .stream()
                .flatMap(Collection::stream)
                .map(stringConverter::toString)
                .collect(Collectors.joining(",")));
    }

    @SuppressWarnings("unchecked")
    private void createCheckComboBox() {
        this.checkComboBox = new CheckComboBox<>(options);
        final var currentItems = getItem();
        if (currentItems != null && !currentItems.isEmpty()) {
            currentItems.forEach(checkComboBox.getCheckModel()::check);
        }

        checkComboBox.getCheckModel().getCheckedItems().addListener((ListChangeListener<T>) c -> commitEdit((List<T>) c.getList()));
        checkComboBox.setConverter(stringConverter);
    }
}
