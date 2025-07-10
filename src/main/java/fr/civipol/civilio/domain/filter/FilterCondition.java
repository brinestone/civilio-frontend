package fr.civipol.civilio.domain.filter;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;

@Builder
@Getter
@Setter
public class FilterCondition {
    private String propertyName;
    private Object rangeMin, rangeMax, value;
    private FilterOperator operator;

    public String toSqlClause() {
        final var propertyName = getPropertyName();
        return switch (operator) {
            case EQUALS, NOT_EQUALS, GREATER_OR_EQUAL, GREATER_THAN, LESS_OR_EQUAL, LESS_THAN, BEFORE, BEFORE_OR_TODAY, AFTER, AFTER_OR_TODAY ->
                    String.format("%s %s ?", propertyName, operator.getSqlOperator());
            case CONTAINS, STARTS_WITH, ENDS_WITH -> String.format("%s LIKE ?", propertyName);
            case BETWEEN -> String.format("%s BETWEEN ? AND ?", propertyName);
            case IN ->
                    String.format("%s IN (%s)", propertyName, String.join(",", Collections.nCopies(getInValues().size(), "?")));
            case IS_NULL, IS_NOT_NULL -> String.format("%s %s", propertyName, operator.getSqlOperator());
        };
    }

    public Collection<Object> getPreparedValues() {
        final var objects = new ArrayList<>();
        switch (operator) {
            case EQUALS:
            case NOT_EQUALS:
            case GREATER_THAN:
            case GREATER_OR_EQUAL:
            case LESS_THAN:
            case BEFORE_OR_TODAY:
            case AFTER:
            case AFTER_OR_TODAY:
            case BEFORE:
            case LESS_OR_EQUAL:
                objects.add(value);
                break;
            case CONTAINS:
                objects.add("%" + value + "%");
                break;
            case STARTS_WITH:
                objects.add(value + "%");
                break;
            case ENDS_WITH:
                objects.add("%" + value);
                break;
            case BETWEEN:
                objects.add(rangeMin);
                objects.add(rangeMax);
                break;
            case IN:
                objects.add(getInValues());
                break;
            case IS_NULL:
            case IS_NOT_NULL:
                break;
        }
        return objects;
    }

//    public int getParameterCount() {
//        return switch (operator) {
//            case EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, GREATER_OR_EQUAL, LESS_OR_EQUAL, CONTAINS, STARTS_WITH, ENDS_WITH, BEFORE, BEFORE_OR_TODAY, AFTER, AFTER_OR_TODAY ->
//                    1;
//            case BETWEEN -> 2;
//            case IN -> getInValues().size();
//            case IS_NULL, IS_NOT_NULL -> 0;
//        };
//    }

    public Collection<Object> getInValues() {
        if (value instanceof Collection) {
            return new ArrayList<>((Collection<?>) value);
        }
        return Collections.singletonList(value);
    }

}
