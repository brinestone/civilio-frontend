package fr.civipol.civilio.domain.filter;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum FilterOperator {
    EQUALS("=", "filter.operators.eq"),
    NOT_EQUALS("!=", "filter.operators.ne"),
    GREATER_THAN(">", "filter.operators.gt"),
    LESS_THAN("<", "filter.operators.lt"),
    BEFORE("<", "filter.operators.before"),
    BEFORE_OR_TODAY("<=", "filter.operators.before_or_today"),
    AFTER(">", "filter.operators.after"),
    AFTER_OR_TODAY(">=", "filter.operators.after_or_today"),
    GREATER_OR_EQUAL(">=", "filter.operators.gte"),
    LESS_OR_EQUAL("<=", "filter.operators.lte"),
    CONTAINS("LIKE", "filter.operators.contains"),
    STARTS_WITH("LIKE", "filter.operators.start_with"),
    ENDS_WITH("LIKE", "filter.operators.ends_with"),
    BETWEEN("BETWEEN", "filter.operators.between"),
    IN("IN", "filter.operators.in"),
    IS_NULL("IS NULL", "filter.operators.is_null"),
    IS_NOT_NULL("IS NOT NULL", "filter.operators.nn");

    @Getter
    private final String sqlOperator;
    @Getter
    private final String labelKey;
}
