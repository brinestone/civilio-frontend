package fr.civipol.civilio.services;

import dagger.Lazy;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.PageResult;
import fr.civipol.civilio.domain.filter.FilterManager;
import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.event.SubmissionRef;
import fr.civipol.civilio.form.field.Option;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Stream;

@Slf4j
public class FormService implements AppService {
    private static final String PERSONNEL_INFO_TABLE = "data_personnel";
    private static final String FOSA_TABLE = "data_fosa";
    private static final String STATS_TABLE = "fosa_vital_stats";
    private static final String[] TABLES = {FOSA_TABLE, PERSONNEL_INFO_TABLE, STATS_TABLE};
    private final Lazy<DataSource> dataSourceProvider;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    public FormService(Lazy<DataSource> dataSourceProvider) {
        this.dataSourceProvider = dataSourceProvider;
    }

    public Collection<FieldMapping> findFieldMappings(FormType form) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            return findFieldMappingsInternal(connection, form.toString());
        }
    }

    public Optional<FieldMapping> findFieldMapping(FormType form, String field) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            return findFieldMappingInternal(connection, form.toString(), field);
        }
    }

    public void updateFieldMapping(FormType form, String field, String i18nKey, Object dbColumn) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);
            PreparedStatement st;
            String sql;
            if (dbColumn != null) {
                sql = """
                        INSERT INTO
                            form_field_mappings(field, i18n_key, db_column, db_table, form, db_column_type)
                        VALUES (?, ?, ?, ?, CAST(? as form_types), (SELECT c.data_type from information_schema.columns c WHERE c.column_name = ? AND c.table_name = ? LIMIT 1))
                        ON CONFLICT (field, form) DO UPDATE
                        SET
                            db_column = EXCLUDED.db_column,
                            db_table = EXCLUDED.db_table,
                            i18n_key = EXCLUDED.i18n_key,
                            db_column_type = EXCLUDED.db_column_type;
                        """;
                String tableName = form.getDbTable();
                if (form.equals(FormType.FOSA)) {
                    if (field.startsWith(PERSONNEL_INFO_TABLE)) tableName = PERSONNEL_INFO_TABLE;
                } else {
                    throw new IllegalArgumentException("Could not determine table for: " + field);
                }
                st = connection.prepareStatement(sql);
                st.setString(1, field);
                st.setString(2, i18nKey);
                st.setObject(3, dbColumn);
                st.setString(4, tableName);
                st.setString(5, form.toString());
                st.setObject(6, dbColumn);
                st.setString(7, tableName);
            } else {
                sql = """
                        DELETE FROM
                            form_field_mappings
                        WHERE
                            field = ? AND form = CAST(? as form_types);
                        """;
                st = connection.prepareStatement(sql);
                st.setString(1, field);
                st.setString(2, form.toString());
            }

            try (st) {
                st.executeUpdate();
            } catch (SQLException ex) {
                log.error("error while updating field mapping for form: {}, and field : {}", form, field, ex);
                throw ex;
            }

            connection.commit();
        }
    }

    public Collection<String> getFormFields() throws SQLException {
        final var sql = """
                SELECT DISTINCT
                    c.column_name
                FROM
                    information_schema.columns c
                WHERE c.table_name = ANY(?)
                ORDER BY c.column_name;
                """;
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement(sql)) {
                st.setArray(1, connection.createArrayOf("text", TABLES));
                try (final var rs = st.executeQuery()) {
                    final var list = new ArrayList<String>();
                    while (rs.next()) {
                        list.add(rs.getString(1));
                    }
                    return list;
                }
            }
        }
    }

    private Optional<FieldMapping> findFieldMappingInternal(Connection connection, String form, String field)
            throws SQLException {
        final var sql = """
                SELECT
                    i18n_key, db_column, db_table, db_column_type, COALESCE(ordinal, 0::SMALLINT)
                FROM
                    form_field_mappings ffm
                WHERE
                    ffm.form = CAST(? AS form_types) AND ffm.field = ?
                LIMIT 1;
                """;
        try (final var st = connection.prepareStatement(sql)) {
            st.setString(1, form);
            st.setString(2, field);
            try (final var rs = st.executeQuery()) {
                if (!rs.next())
                    return Optional.empty();
                return Optional.of(new FieldMapping(
                                field,
                                rs.getString(1),
                                rs.getString(2),
                                rs.getString(3),
                                rs.getString(4),
                                rs.getInt(5)
                        )
                );
            }
        }
    }

    private List<FieldMapping> findFieldMappingsInternal(Connection connection, String form) throws SQLException {
        final var sql = """
                SELECT
                    field, i18n_key, quote_ident(db_column), db_table, db_column_type, COALESCE(ordinal, 0::SMALLINT)
                FROM
                    form_field_mappings
                WHERE
                    form = CAST(? as form_types);
                """;
        try (final var st = connection.prepareStatement(sql)) {
            st.setString(1, form);
            try (final var rs = st.executeQuery()) {
                final var builder = Stream.<FieldMapping>builder();
                while (rs.next()) {
                    builder.add(new FieldMapping(
                                    rs.getString(1),
                                    rs.getString(2),
                                    rs.getString(3),
                                    rs.getString(4),
                                    rs.getString(5),
                                    rs.getInt(6)
                            )
                    );
                }
                return builder.build().toList();
            }
        }
    }

    public <T> Collection<T> findAutoCompletionValuesFor(
            String fieldId,
            String form,
            String query,
            int limit,
            Function<String, T> deserializer) throws SQLException {
        final var ans = new HashSet<T>();
        final var sql = """
                SELECT DISTINCT
                    UPPER(TRIM(BOTH FROM %s::TEXT))
                FROM
                    %s
                WHERE
                    LOWER(%s) LIKE LOWER(?)
                ORDER BY
                    UPPER(TRIM(BOTH FROM %s::TEXT))
                LIMIT ?;
                """;
        final var ds = dataSourceProvider.get();
        try (final var conn = ds.getConnection()) {
            final var mappingWrapper = findFieldMappingInternal(conn, form, fieldId);
            if (mappingWrapper.isEmpty())
                return Collections.emptyList();
            final var mapping = mappingWrapper.get();
            final var columnNameWrapper = sanitizeColumnName(mapping.dbTable(), mapping.dbColumn(), conn);
            if (columnNameWrapper.isEmpty())
                return Collections.emptyList();
            try (final var st = conn.prepareStatement(sql.formatted(columnNameWrapper.get(), mapping.dbTable(),
                    columnNameWrapper.get(), columnNameWrapper.get()))) {
                st.setString(1, "%%" + query + "%%");
                st.setInt(2, limit);
                try (final var rs = st.executeQuery()) {
                    while (rs.next()) {
                        ans.add(deserializer.apply(rs.getString(1)));
                    }
                }
            }
        }
        return ans;
    }

    public Map<String, String> findSubmissionData(
            String submissionId,
            FormType form,
            BiFunction<FieldMapping, Integer, String> keyMaker) throws SQLException {
        final var ds = dataSourceProvider.get();
        final var result = new HashMap<String, String>();
        try (final var connection = ds.getConnection()) {
            final var formMappings = findFieldMappingsInternal(connection, form.toString());
            final var sqlFormat = """
                    SELECT
                        %s::TEXT
                    FROM
                        %s
                    WHERE
                        %s = CAST(? as INTEGER)
                    %s;
                    """;
            for (final var mapping : formMappings) {
                String sql;
                PreparedStatement ps;
                if (mapping.dbTable().equals(PERSONNEL_INFO_TABLE)) {
                    sql = sqlFormat.formatted(mapping.dbColumn(), mapping.dbTable(), "_submission_id", "");
                } else {
                    sql = sqlFormat.formatted(mapping.dbColumn(), mapping.dbTable(), "_id", "LIMIT 1");
                }
                ps = connection.prepareStatement(sql);
                ps.setString(1, submissionId);
                try (ps) {
                    try (final var rs = ps.executeQuery()) {
                        var cnt = 0;
                        while (rs.next()) {
                            result.put(keyMaker.apply(mapping, cnt), rs.getString(1));
                            cnt++;
                        }
                    }
                }
            }
        }
        return result;
    }

    @SuppressWarnings({"DuplicatedCode"})
    public Collection<FieldChange> updateSubmission(
            String submissionId,
            FormType form,
            Function<String, String> fieldExtractor,
            Function<String, String[]> metaDataExtractor,
            FieldChange... changes) throws SQLException {
        if (changes.length == 0)
            return Collections.emptyList();
        final var droppedChanges = new ArrayList<FieldChange>();
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);

            final var isNewSubmission = StringUtils.isBlank(submissionId);
            if (isNewSubmission) {
                try (final var st = connection.createStatement()) {
                    try (final var rs = st.executeQuery("""
                            INSERT INTO %s DEFAULT VALUES RETURNING _id
                            """.formatted(form.getDbTable()))) {
                        if (!rs.next())
                            throw new RuntimeException("unknown error while retrieving submission id ");
                        submissionId = rs.getString(1);
                    }
                }
            }

            for (var change : changes) {
                final var field = fieldExtractor.apply(change.getField());
                final var mappingWrapper = findFieldMappingInternal(connection, form.toString(), field);
                if (mappingWrapper.isEmpty()) {
                    droppedChanges.add(change);
                    continue;
                }
                final var mapping = mappingWrapper.get();
                final var metadata = metaDataExtractor.apply(change.getField());
                var isNewChange = metadata.length == 0;

                String sql;
                PreparedStatement ps;
                final var columnNameWrapper = sanitizeColumnName(mapping.dbTable(), field, connection);
                if (columnNameWrapper.isEmpty()) {
                    droppedChanges.add(change);
                    continue;
                }
                final var columnName = columnNameWrapper.get();

                if (!isNewChange) {
                    sql = """
                            UPDATE
                                %s
                            SET
                                %s= CAST(? AS %s)
                            WHERE
                                _id=?;
                            """.formatted(mapping.dbTable(), columnName, mapping.type());
                    ps = connection.prepareStatement(sql);
                    ps.setObject(1, change.getNewValue());
                    ps.setString(2, submissionId);
                }
            }
            connection.commit();
            return droppedChanges;
        }
    }

    private Optional<String> sanitizeColumnName(String table, String column, Connection connection) throws SQLException {
        try (final var st = connection.prepareStatement("""
                SELECT
                    quote_ident(c.column_name)
                FROM
                    information_schema.columns c
                WHERE
                    c.table_name = ? AND c.column_name = ? LIMIT 1;
                """)) {
            st.setString(1, table);
            st.setString(2, column);
            try (final var rs = st.executeQuery()) {
                if (!rs.next())
                    return Optional.empty();
                return Optional.ofNullable(rs.getString(1));
            }
        }
    }

    public void deleteSubmissions(String... ids) throws SQLException {
        if (ids.length == 0)
            return;
        final var dataSource = this.dataSourceProvider.get();
        try (final var connection = dataSource.getConnection()) {
            try (final var st = connection.prepareStatement("DELETE FROM data1 WHERE _id IN ("
                                                            + String.join(",", Collections.nCopies(ids.length, "?")) + ");")) {
                for (var i = 0; i < ids.length; i++) {
                    st.setString(i + 1, ids[i]);
                }

                st.execute();
            }
        }
    }

    public PageResult<FormSubmission> findFormSubmissions(
            FormType form,
            int page,
            int size,
            FilterManager filterManager) throws SQLException {
        final var dataSource = this.dataSourceProvider.get();
        final var resultBuilder = PageResult.<FormSubmission>builder();
        final var filter = filterManager.toPreparedstatementFilter();
        try (final var connection = dataSource.getConnection()) {
            String countSql, sql;
            PreparedStatement ps, countPs;
            switch (form) {
//                case CHIEFDOM:
//                case CEC:
//                    break;
                default -> {
                    sql = """
                            SELECT
                                df._id,
                                df._validation_status,
                                df.q14_02_validation_code,
                                df._submitted_by,
                                df._index,
                                df.q1_12_officename,
                                df._submission_time::DATE
                            FROM
                                data_fosa df
                            INNER JOIN
                                data_personnel dp on df._index = dp._parent_index
                            WHERE
                                %s
                            ORDER BY
                                _submission_time::DATE DESC
                            OFFSET ?
                            LIMIT ?;
                            """.formatted(filter.getWhereClause());
                    countSql = """
                            SELECT
                                COUNT(*)
                            FROM
                                data_fosa
                            WHERE
                                %s;
                            """.formatted(filter.getWhereClause());
                    ps = connection.prepareStatement(sql);
                    filter.applyToPreparedStatement(ps);
                    var index = filter.getParameters().size();
                    ps.setInt(++index, page * size);
                    ps.setInt(++index, size);
                    countPs = connection.prepareStatement(countSql);
                    filter.applyToPreparedStatement(countPs);
                }
            }

            try (ps; countPs) {
                try (final var rs = ps.executeQuery()) {
                    final var streamBuilder = Stream.<FormSubmission>builder();
                    while (rs.next()) {
                        streamBuilder.add(
                                FormSubmission.builder()
                                        .id(rs.getString(1))
                                        .validationStatus(rs.getString(2))
                                        .validationCode(rs.getString(3))
                                        .submittedBy(rs.getString(4))
                                        .index(rs.getString(5))
                                        .facilityName(rs.getString(6))
                                        .submittedOn(rs.getDate(7))
                                        .build()
                        );
                    }
                    resultBuilder.data(streamBuilder.build().toList());
                }
                try (final var rs = countPs.executeQuery()) {
                    var count = 0L;
                    if (rs.next()) {
                        count = rs.getLong(1);
                    }
                    resultBuilder.totalRecords(count);
                }
            }
        }

        return resultBuilder.build();
    }

    public Collection<Option> findOptionsFor(String name, String parent, String form) throws SQLException {
        final var result = Stream.<Option>builder();
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            final var sql = new StringBuilder(
                    "SELECT name, label, i18n_key FROM choices WHERE \"group\" = ? AND version = ?"
            );
            if (StringUtils.isNotBlank(parent))
                sql.append(" AND parent = ?");
            sql.append(";");
            try (final var st = connection.prepareStatement(sql.toString())) {
                st.setString(1, name);
                st.setString(2, form);
                if (StringUtils.isNotBlank(parent))
                    st.setString(3, parent);
                try (final var rs = st.executeQuery()) {
                    while (rs.next()) {
                        result.add(new Option(rs.getString("label"), rs.getString("name"), rs.getString("i18n_key")));
                    }
                }
            }
        }

        return result.build().toList();
    }

    public Optional<SubmissionRef> findSubmissionRefById(String id, FormType form) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement("""
                    select d._id::TEXT,
                           d._submission_time::date,
                           d._index::TEXT,
                           d.q14_02_validation_code,
                           d.prev::TEXT,
                           d.next::TEXT
                    from (
                            select  _id,
                                    _submission_time,
                                    _index,
                                    q14_02_validation_code,
                                    lead(_id) over (order by _id) as next,
                                    lag(_id) over (order by _id)  as prev
                            from
                                    %s
                         ) as d
                    where d._id = CAST(? as integer);
                    """.formatted(form.getDbTable()))) {
                st.setString(1, id);
                try (final var rs = st.executeQuery()) {
                    if (!rs.next())
                        return Optional.empty();
                    return Optional.of(new SubmissionRef(rs.getString(1),
                            rs.getDate(2).toLocalDate(),
                            rs.getString(3),
                            rs.getString(4),
                            rs.getString(5),
                            rs.getString(6)));
                }
            }
        }
    }

    public Collection<SubmissionRef> findSubmissionRefsByIndex(String query, String fieldId, FormType form) throws SQLException {
        if (StringUtils.isBlank(query))
            return Collections.emptyList();
        final var ds = dataSourceProvider.get();
        try (final var conn = ds.getConnection()) {
            final var mappingWrapper = findFieldMappingInternal(conn, form.toString(), fieldId);
            if (mappingWrapper.isEmpty()) {
                return Collections.emptyList();
            }
            final var mapping = mappingWrapper.get();
            final var column = sanitizeColumnName(mapping.dbTable(), mapping.dbColumn(), conn);
            try (final var st = conn.prepareStatement("""
                    select d._id::TEXT,
                           d._submission_time::date,
                           d._index::TEXT,
                           d.q14_02_validation_code,
                           d.prev::TEXT,
                           d.next::TEXT
                    from (select _id,
                                _submission_time,
                                _index,
                                q14_02_validation_code,
                                lead(_id) over (order by _id) as next,
                                lag(_id) over (order by _id)  as prev
                          from
                                %s) as d
                    where d._index LIKE ?
                       OR lower(d.%s) LIKE lower(?)
                    limit 10;
                                        """.formatted(mapping.dbTable(), column))) {
                st.setString(1, "%%%s%%".formatted(query));
                st.setString(2, "%%%s%%".formatted(query));
                try (final var rs = st.executeQuery()) {
                    final var builder = Stream.<SubmissionRef>builder();
                    while (rs.next()) {
                        builder.add(new SubmissionRef(
                                rs.getString(1),
                                rs.getDate(2).toLocalDate(),
                                rs.getString(3),
                                rs.getString(4),
                                rs.getString(5),
                                rs.getString(6)));
                    }
                    return builder.build().toList();
                }
            }
        }
    }

    @Override
    public void initialize() throws Exception {
        AppService.super.initialize();
        log.info("running migration scripts...");
    }
}
