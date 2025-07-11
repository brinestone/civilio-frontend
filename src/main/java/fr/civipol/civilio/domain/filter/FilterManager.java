package fr.civipol.civilio.domain.filter;

import javafx.beans.property.ListProperty;
import javafx.beans.property.MapProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.property.SimpleMapProperty;
import javafx.collections.FXCollections;
import lombok.Getter;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

public class FilterManager {
    private final ListProperty<FilterCondition> conditions = new SimpleListProperty<>(FXCollections.observableArrayList());
    private final MapProperty<String, SortOrder> sorting = new SimpleMapProperty<>(FXCollections.observableHashMap());

    public MapProperty<String, SortOrder> sortingProperty() {
        return sorting;
    }

    public ListProperty<FilterCondition> conditionsProperty() {
        return conditions;
    }

    public PreparedStatementFilter toPreparedstatementFilter() {
        if (conditions.isEmpty())
            return new PreparedStatementFilter("", Collections.emptyList(), Collections.emptyMap());

        final var clauses = new ArrayList<String>();
        final var parameters = new ArrayList<>();

        for (var condition : conditions) {
            clauses.add(condition.toSqlClause());
            parameters.addAll(condition.getPreparedValues());
        }

        final var whereClause = String.join(" AND ", clauses);
        return new PreparedStatementFilter(whereClause, parameters, sorting);
    }

    public static class PreparedStatementFilter {
        private final String whereClause;
        @Getter
        private final List<Object> parameters;
        private final Map<String, SortOrder> sorting;

        public PreparedStatementFilter(String whereClause, List<Object> parameters, Map<String, SortOrder> sorting) {
            this.sorting = sorting;
            this.whereClause = whereClause;
            this.parameters = parameters;
        }

        public String getSorting() {
            return Optional.ofNullable(sorting)
                    .stream()
                    .flatMap(m -> m.entrySet().stream())
                    .map(e -> String.format("%s %s", e.getKey(), e.getValue().name()))
                    .collect(Collectors.joining("\n"));
        }

        public String getWhereClause() {
            return whereClause.isEmpty() ? "1=1" : whereClause;
        }

        public void applyToPreparedStatement(PreparedStatement ps) throws SQLException {
            applyToPreparedStatement(ps, 1);
        }

        public void applyToPreparedStatement(PreparedStatement ps, int startingIndex) throws SQLException {
            for (var i = startingIndex; i < parameters.size() + startingIndex; i++) {
                final var param = parameters.get(i);
                final var index = i + 1;
                if (param instanceof String)
                    ps.setString(index, String.valueOf(param));
                else if (param instanceof Integer)
                    ps.setInt(index, (Integer) param);
                else if (param instanceof Double)
                    ps.setDouble(index, (Double) param);
                else if (param instanceof Float)
                    ps.setFloat(index, (Float) param);
                else if (param instanceof Date)
                    ps.setDate(index, new java.sql.Date(((Date) param).getTime()));
                else if (param instanceof Boolean)
                    ps.setBoolean(index, (Boolean) param);
            }
        }
    }
}
