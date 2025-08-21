package fr.civipol.civilio.form.field.table;

import javafx.scene.control.TableCell;

import java.util.function.Supplier;

public class SpinnerColumnDefinition<V, T extends Number> extends ColumnDefinition<V, T, SpinnerColumnDefinition<V, T>> {
    private static <V> Supplier<TableCell<V, Integer>> integerSupplier(int step) {
        return () -> SpinnerTableCell.ofIntegerType(step);
    }

    private static <V> Supplier<TableCell<V, Float>> floatSupplier(float step) {
        return () -> SpinnerTableCell.ofFloatType(step);
    }

    public static <V> SpinnerColumnDefinition<V, Float> ofFloatType(String titleKey, String fieldKey, float step) {
        return new SpinnerColumnDefinition<>(titleKey, fieldKey, floatSupplier(step));
    }

    public static <V> SpinnerColumnDefinition<V, Float> ofFloatType(String titleKey, String fieldKey) {
        return ofFloatType(titleKey, fieldKey, 1.0f);
    }

    public static <V> SpinnerColumnDefinition<V, Integer> ofIntegerType(String titleKey, String fieldKey) {
        return ofIntegerType(titleKey, fieldKey, 1);
    }

    public static <V> SpinnerColumnDefinition<V, Integer> ofIntegerType(String titleKey, String fieldKey, int step) {
        return new SpinnerColumnDefinition<>(titleKey, fieldKey, integerSupplier(step));
    }

    private SpinnerColumnDefinition(String titleKey, String fieldKey, Supplier<TableCell<V, T>> tableCellSupplier) {
        super(titleKey, fieldKey, tableCellSupplier);
    }
}
