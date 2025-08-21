package fr.civipol.civilio.form.field.table;

import javafx.scene.control.Spinner;
import javafx.scene.control.SpinnerValueFactory;
import javafx.scene.control.TableCell;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class SpinnerTableCell<S, T extends Number> extends TableCell<S, T> {
    private Spinner<T> spinner;
    private final SpinnerValueFactory<T> spinnerValueFactory;

    @Override
    protected void updateItem(T item, boolean empty) {
        super.updateItem(item, empty);
        if (empty) {
            setGraphic(null);
            setText(null);
        } else {
            if (isEditing()) {
                if (spinner != null) {
                    spinner.getValueFactory().setValue(item);
                }
                setGraphic(spinner);
                setText(null);
            } else {
                setGraphic(null);
                setText(item != null ? item.toString() : "");
            }
        }
    }

    @Override
    public void startEdit() {
        if (!isEditable() || !getTableView().isEditable() || !isEditing()) return;
        super.startEdit();
        if (spinner == null) createSpinner();
        // Set the spinner's value to the current item's value
        if (getItem() != null) {
            spinner.getValueFactory().setValue(getItem());
        }
        setGraphic(spinner);
        setText(null);
    }

    private void createSpinner() {
        spinner = new Spinner<>(spinnerValueFactory);
        spinner.focusedProperty().addListener((ob, ov, nv) -> {
           if (!nv) {
               commitEdit(spinner.getValue());
           }
        });
    }

    public static <S> SpinnerTableCell<S, Integer> ofIntegerType(int incrementStep) {
        return new SpinnerTableCell<>(new SpinnerValueFactory<>() {
            @Override
            public void decrement(int steps) {
                setValue(getValue() - (steps * incrementStep));
            }

            @Override
            public void increment(int steps) {
                setValue(getValue() + (steps * incrementStep));
            }
        });
    }

    public static <S> SpinnerTableCell<S, Double> ofDoubleType(double incrementStep) {
        return new SpinnerTableCell<>(new SpinnerValueFactory<>() {
            @Override
            public void decrement(int steps) {
                setValue(getValue() - (steps * incrementStep));
            }

            @Override
            public void increment(int steps) {
                setValue(getValue() + (steps * incrementStep));
            }
        });
    }

    public static <S> SpinnerTableCell<S, Double> ofDoubleType() {
        return ofDoubleType(1.0D);
    }

    public static <S> SpinnerTableCell<S, Float> ofFloatType() {
        return ofFloatType(1.0f);
    }

    public static <S> SpinnerTableCell<S, Float> ofFloatType(Float incrementStep) {
        return new SpinnerTableCell<>(new SpinnerValueFactory<>() {
            @Override
            public void decrement(int steps) {
                setValue(getValue() - (steps * incrementStep));
            }

            @Override
            public void increment(int steps) {
                setValue(getValue() + (steps * incrementStep));
            }
        });
    }

    @Override
    public void commitEdit(T newValue) {
        super.commitEdit(newValue);
        if (spinner != null) {
            newValue = spinner.getValue();
        }
        setText(newValue != null ? newValue.toString() : "");
    }

    @Override
    public void cancelEdit() {
        super.cancelEdit();
        setGraphic(null);
        if (getItem() != null) {
            setText(getItem().toString());
        }
    }
}
