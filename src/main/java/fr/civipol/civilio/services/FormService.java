package fr.civipol.civilio.services;

import dagger.Lazy;
import fr.civipol.civilio.domain.PageResult;
import fr.civipol.civilio.domain.filter.FilterManager;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.entity.UpdateSpec;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class FormService implements AppService {
    private final Lazy<DataSource> dataSource;

    @Inject
    public FormService(Lazy<DataSource> dataSource) {
        this.dataSource = dataSource;
    }

    public void updateSubmission(String id, UpdateSpec... updates) throws SQLException {
        if (updates.length == 0) return;
        final var dataSource = this.dataSource.get();
        try (final var connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            final var setClauses = Arrays.stream(updates)
                    .map(spec -> "SET %s = ?".formatted(spec.field()))
                    .collect(Collectors.joining(",\n"));
            try (final var st = connection.prepareStatement("""
                    UPDATE data1
                    %s
                    WHERE _id = ?;
                    """.formatted(setClauses))) {
                st.setString(updates.length + 1, id);
                for (var i = 0; i < updates.length; i++) {
                    final var update = updates[i];
                    final var index = i + 1;
                    if (update.newValue() instanceof String)
                        st.setString(index, ((String) update.newValue()));
                    else if (update.newValue() instanceof Integer)
                        st.setInt(index, ((Integer) update.newValue()));
                    else if (update.newValue() instanceof Long)
                        st.setLong(index, ((Long) update.newValue()));
                    else if (update.newValue() instanceof Date)
                        st.setDate(index, (java.sql.Date) Optional.of(update.newValue())
                                .map(d -> java.sql.Date.from(((Date) d).toInstant()))
                                .orElse(null));
                    else if (update.newValue() instanceof Double)
                        st.setDouble(index, (Double) update.newValue());
                    else if (update.newValue() instanceof Float)
                        st.setFloat(index, (Float) update.newValue());
                    else if (update.newValue() instanceof Boolean)
                        st.setBoolean(index, (Boolean) update.newValue());
                }
                st.execute();
            }
            connection.commit();
        }
    }

    public void deleteSubmissions(String... ids) throws SQLException {
        if (ids.length == 0) return;
        final var dataSource = this.dataSource.get();
        try (final var connection = dataSource.getConnection()) {
            try (final var st = connection.prepareStatement("DELETE FROM data1 WHERE _id IN (" + String.join(",", Collections.nCopies(ids.length, "?")) + ");")) {
                for (var i = 0; i < ids.length; i++) {
                    st.setString(i + 1, ids[i]);
                }

                st.execute();
            }
        }
    }

    public PageResult<FormSubmission> findFormSubmissions(
            int page,
            int size,
            FilterManager filterManager
    ) throws SQLException {
        final var dataSource = this.dataSource.get();
        final var resultBuilder = PageResult.<FormSubmission>builder();
        final var filter = filterManager.toPreparedstatementFilter();
        try (final var connection = dataSource.getConnection()) {
            final var sql = """
                    SELECT * FROM form_submissions
                    WHERE %s
                    OFFSET %d
                    LIMIT %d;
                    """.formatted(filter.getWhereClause(), page * size, size);
            final var countSql = "SELECT COUNT(*) FROM form_submissions WHERE %s".formatted(filter.getWhereClause());
            try (final var ps = connection.prepareStatement(sql)) {
                filter.applyToPreparedStatement(ps);
                try (final var rs = ps.executeQuery()) {
                    final var list = new ArrayList<FormSubmission>();
                    while (rs.next()) {
                        final var builder = FormSubmission.builder();
                        builder.id(rs.getString("_id"));
                        builder.validationStatus(rs.getString("_validation_status"));
                        builder.validationCode(rs.getString("q14_02_validation_code"));
                        builder.region(rs.getString("q1_01_region"));
                        builder.submittedBy(rs.getString("_submitted_by"));
                        builder.submittedOn(rs.getDate("_submission_time"));

                        list.add(builder.build());
                    }
                    resultBuilder.data(list);
                }
            }

            try (final var ps = connection.prepareStatement(countSql)) {
                filter.applyToPreparedStatement(ps);
                try (final var rs = ps.executeQuery()) {
                    rs.next();
                    resultBuilder.totalRecords(rs.getLong(1));
                }
            }
        }

        return resultBuilder.build();
    }
}
