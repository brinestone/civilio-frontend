package fr.civipol.civilio.domain;

import lombok.Setter;

@Setter
public class RangedQueryFilter<T extends Comparable<T>> extends QueryFilter<T> {
    private T min, max;

    public RangedQueryFilter(String propertyName) {
        super(propertyName);
    }

    @Override
    public final void setValue(T value) {
        if (min != null && min.compareTo(value) > 0) {
            super.setValue(min);
            return;
        }

        if (max != null && max.compareTo(value) < 0) {
            super.setValue(max);
            return;
        }

        super.setValue(value);
    }
}
