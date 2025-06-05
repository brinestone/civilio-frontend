package fr.civipol.civilio.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dagger.Lazy;
import fr.civipol.civilio.domain.PageResult;
import fr.civipol.civilio.domain.filter.FilterManager;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.entity.UpdateSpec;
import fr.civipol.civilio.form.field.Option;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
public class FormService implements AppService {
    private final Lazy<DataSource> dataSourceProvider;

    @SuppressWarnings("CdiInjectionPointsInspection")
    @Inject
    public FormService(Lazy<DataSource> dataSourceProvider) {
        this.dataSourceProvider = dataSourceProvider;
    }

    public <T> Collection<T> findAutoCompletionValuesFor(String field, String query, int size, Function<String, T> deserializer) throws SQLException {
        final var ans = new HashSet<T>();
        final var sql = """
                SELECT DISTINCT UPPER(%s::TEXT) FROM data1 WHERE LOWER(%s) LIKE LOWER(?) ORDER BY UPPER(%s) ASC LIMIT ?;
                """.formatted(field, field, field);
        final var ds = dataSourceProvider.get();
        try (final var conn = ds.getConnection()) {
            try (final var st = conn.prepareStatement(sql)) {
                st.setString(1, "%%" + query + "%%");
                st.setInt(2, size);
                try (final var rs = st.executeQuery()) {
                    while (rs.next()) {
                        ans.add(deserializer.apply(rs.getString(1)));
                    }
                }
            }
        }
        return ans;
    }

    public Map<String, Object> findFosaSubmissionData(String submissionId) throws SQLException, JsonProcessingException {
        final var dataQuery = """
                SELECT to_jsonb(sub_query) FROM (SELECT * FROM data1 WHERE _id = ?) AS sub_query;
                """;
        final var personnelQuery = """
                SELECT to_jsonb(sub_query) FROM (SELECT * FROM personnel_info WHERE _parent_index = ?) AS sub_query;
                """;
        final var datasource = dataSourceProvider.get();
        try (final var connection = datasource.getConnection()) {
            Map<String, Object> ans;
            final var mapper = new ObjectMapper();
            try (final var st = connection.prepareStatement(dataQuery)) {
                st.setString(1, submissionId);
                try (final var rs = st.executeQuery()) {
                    if (!rs.next()) return Collections.emptyMap();
                    final var json = rs.getString(1);
                    ans = mapper.readValue(json, new TypeReference<>() {
                    });
                }
            }

            try (final var st = connection.prepareStatement(personnelQuery)) {
                final var format = "personnel_info_%d_%s_%s";
                st.setObject(1, ans.get("_index"));
                try (final var rs = st.executeQuery()) {
                    var cnt = 0;
                    while (rs.next()) {
                        final var json = rs.getString(1);
                        final var temp = mapper.readValue(json, new TypeReference<Map<String, Object>>() {
                        });
                        final var entries = new ArrayList<>(temp.entrySet());
                        for (var i = 0; i < temp.size(); i++) {
                            ans.put(format.formatted(cnt, ans.get("_index"), entries.get(i).getKey()), entries.get(i).getValue());
                        }
                        cnt++;
                    }
                }
            }
            return ans;
        }
    }

    public void updateSubmission(String id, UpdateSpec... updates) throws SQLException {
        if (updates.length == 0) return;
        final var dataSource = this.dataSourceProvider.get();
        try (final var connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            final var setClauses = Arrays.stream(updates)
                    .map(spec -> "SET %s = ?".formatted(spec.getField()))
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
                    if (update.getNewValue() instanceof String)
                        st.setString(index, ((String) update.getNewValue()));
                    else if (update.getNewValue() instanceof Integer)
                        st.setInt(index, ((Integer) update.getNewValue()));
                    else if (update.getNewValue() instanceof Long)
                        st.setLong(index, ((Long) update.getNewValue()));
                    else if (update.getNewValue() instanceof Date)
                        st.setDate(index, (java.sql.Date) Optional.of(update.getNewValue())
                                .map(d -> java.sql.Date.from(((Date) d).toInstant()))
                                .orElse(null));
                    else if (update.getNewValue() instanceof Double)
                        st.setDouble(index, (Double) update.getNewValue());
                    else if (update.getNewValue() instanceof Float)
                        st.setFloat(index, (Float) update.getNewValue());
                    else if (update.getNewValue() instanceof Boolean)
                        st.setBoolean(index, (Boolean) update.getNewValue());
                }
                st.execute();
            }
            connection.commit();
        }
    }

    public void deleteSubmissions(String... ids) throws SQLException {
        if (ids.length == 0) return;
        final var dataSource = this.dataSourceProvider.get();
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
//            String form,
            int page,
            int size,
            FilterManager filterManager
    ) throws SQLException {
        final var dataSource = this.dataSourceProvider.get();
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
                        var builder = FormSubmission.builder();
                        builder = builder.id(rs.getString("_id"))
                                .validationStatus(rs.getString("_validation_status"))
                                .validationCode(rs.getString("q14_02_validation_code"))
                                .region(rs.getString("q1_01_region"))
                                .submittedBy(rs.getString("_submitted_by"))
                                .submittedOn(rs.getDate("_submission_time"))
                                .index(rs.getString("_index"))
                                .facilityName(rs.getString("q1_12_officename"));

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

    public Collection<Option> findOptionsFor(String name, String parent, String form) throws SQLException {
        final var result = new ArrayList<Option>();
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            final var sql = new StringBuilder("SELECT name, label, i18n_key FROM choices WHERE \"group\" = ? AND version = ?");
            if (StringUtils.isNotBlank(parent)) sql.append(" AND parent = ?");
            sql.append(";");
            try (final var st = connection.prepareStatement(sql.toString())) {
                st.setString(1, name);
                st.setString(2, form);
                if (StringUtils.isNotBlank(parent)) st.setString(3, parent);
                try (final var rs = st.executeQuery()) {
                    while (rs.next()) {
                        result.add(new Option(rs.getString("label"), rs.getString("name"), rs.getString("i18n_key")));
                    }
                }
            }
        }

        return result;
    }
}
