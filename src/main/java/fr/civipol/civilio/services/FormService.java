package fr.civipol.civilio.services;

import dagger.Lazy;
import fr.civipol.civilio.domain.PageResult;
import fr.civipol.civilio.domain.filter.FilterManager;
import fr.civipol.civilio.entity.DataUpdate;
import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.entity.NewSubmissionResult;
import fr.civipol.civilio.event.SubmissionRef;
import fr.civipol.civilio.form.field.Option;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
public class FormService implements AppService {
    private static final String PERSONNEL_INFO_TABLE = "personnel_info";
    private static final String DATA_TABLE = "data1";
    private static final String STATS_TABLE = "fosa_vital_stats";
    private static final String[] TABLES = {DATA_TABLE, PERSONNEL_INFO_TABLE, STATS_TABLE};
    private final Lazy<DataSource> dataSourceProvider;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    public FormService(Lazy<DataSource> dataSourceProvider) {
        this.dataSourceProvider = dataSourceProvider;
    }

    public Optional<FieldMapping> findFieldMapping(String form, String field) throws SQLException {
        final var sql = """
                SELECT
                    i18n_key, db_column, db_table
                FROM
                    form_field_mappings ffm
                WHERE
                    ffm.form = CAST(? AS form_types) AND ffm.field = ?
                LIMIT 1;
                """;
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement(sql)) {
                st.setString(1, form);
                st.setString(2, field);
                try (final var rs = st.executeQuery()) {
                    if (!rs.next()) return Optional.empty();
                    return Optional.of(new FieldMapping(
                            field, rs.getString(1), rs.getString(2), rs.getString(3)
                    ));
                }
            }
        }
    }

    public void updateFieldMapping(String form, String field, String i18nKey, Object dbColumn) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);
            PreparedStatement st;
            String sql;
            if (dbColumn != null) {
                sql = """
                        INSERT INTO
                            form_field_mappings(field, i18n_key, db_column, db_table, form)
                        VALUES (?, ?, ?, ?, CAST(? as form_types))
                        ON CONFLICT (field, form) DO UPDATE
                        SET
                            db_column = EXCLUDED.db_column,
                            db_table = EXCLUDED.db_table,
                            i18n_key = EXCLUDED.i18n_key;
                        """;
                st = connection.prepareStatement(sql);
                st.setString(1, field);
                st.setString(2, i18nKey);
                st.setObject(3, dbColumn);
                st.setString(4, field.startsWith(PERSONNEL_INFO_TABLE) ? PERSONNEL_INFO_TABLE : field.startsWith(STATS_TABLE) ? STATS_TABLE : DATA_TABLE);
                st.setString(5, form);
            } else {
                sql = """
                        DELETE FROM
                            form_field_mappings
                        WHERE
                            field = ? AND form = CAST(? as form_types);
                        """;
                st = connection.prepareStatement(sql);
                st.setString(1, field);
                st.setString(2, form);
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

    public Collection<String> getFormFields(String form) throws SQLException {
        final var sql = """
                SELECT
                    c.column_name
                FROM
                    information_schema.columns c
                WHERE c.table_name = ANY(?)
                ORDER BY c.column_name;
                """;
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement(sql)) {
                st.setString(1, form);
                st.setArray(2, connection.createArrayOf("text", TABLES));
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

    private List<FieldMapping> findFieldMappingsInternal(Connection connection, String form) throws SQLException {
        final var sql = """
                SELECT
                    field, i18n_key, quote_ident(db_column), db_table
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
                            rs.getString(4)
                    ));
                }
                return builder.build().toList();
            }
        }
    }

    public <T> Collection<T> findAutoCompletionValuesFor(String field, String query, int limit,
                                                         Function<String, T> deserializer) throws SQLException {
        final var ans = new HashSet<T>();
        final var sql = """
                SELECT DISTINCT UPPER(%s::TEXT) FROM %s WHERE LOWER(%s) LIKE LOWER(?) ORDER BY UPPER(%s) ASC LIMIT ?;
                """.formatted(field, DATA_TABLE, field, field);
        final var ds = dataSourceProvider.get();
        try (final var conn = ds.getConnection()) {
            try (final var st = conn.prepareStatement(sql)) {
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

    public Map<String, Object> findSubmissionData(String submissionId, String form) throws SQLException {
        final var ds = dataSourceProvider.get();
        final var result = new HashMap<String, Object>();
        try (final var connection = ds.getConnection()) {
            final var formMappings = findFieldMappingsInternal(connection, form);
            final var sqlFormat = """
                    SELECT
                        %s
                    FROM
                        %s
                    WHERE
                        %s = ?
                    %s;
                    """;
            for (final var mapping : formMappings) {
                String sql;
                PreparedStatement ps;
                switch (mapping.dbTable()) {
                    default -> {
                        sql = sqlFormat.formatted(mapping.dbColumn(), mapping.dbTable(), "_id", "LIMIT 1");
                        ps = connection.prepareStatement(sql);
                        ps.setString(1, submissionId);
                    }
                    case PERSONNEL_INFO_TABLE -> {
                        sql = sqlFormat.formatted(mapping.dbColumn(), mapping.dbTable(), "_submission__id", "");
                        ps = connection.prepareStatement(sql);
                        ps.setString(1, submissionId);
                    }
                    case STATS_TABLE -> {
                        sql = sqlFormat.formatted(mapping.dbColumn(), mapping.dbTable(), "_submission_id", "");
                        ps = connection.prepareStatement(sql);
                        ps.setString(1, submissionId);
                    }
                }
                try (ps) {
                    try (final var rs = ps.executeQuery()) {
                        var cnt = 0;
                        while (rs.next()) {
                            result.put("%s:::%d".formatted(mapping.field(), cnt), rs.getObject(1));
                            cnt++;
                        }
                    }
                }
            }
        }
        return result;
    }

    @SuppressWarnings({"DuplicatedCode"})
    public Collection<DataUpdate> updateSubmission(String submissionId, DataUpdate... updates) throws SQLException {
        if (updates.length == 0) return Collections.emptyList();
        final var droppedUpdates = new ArrayList<DataUpdate>();
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);

            final var isNewSubmission = StringUtils.isBlank(submissionId);
            if (isNewSubmission) {
                try (final var st = connection.createStatement()) {
                    try (final var rs = st.executeQuery("""
                            INSERT INTO data1 DEFAULT VALUES RETURNING _id
                            """)) {
                        if (!rs.next())
                            throw new RuntimeException("unknown error while retrieving submission id ");
                        submissionId = rs.getString(1);
                    }
                }
            }

            final var personnelFieldPrefix = "personnel_info_";
            for (var update : updates) {
                final var isPersonnelInfoUpdate = update.getField().startsWith(personnelFieldPrefix);
                if (isPersonnelInfoUpdate) {
                    Function<String, String[]> personnelFieldStripper = f -> Arrays.stream(f.split("_", 5)).skip(2L).toArray(String[]::new);
                    final var segments = personnelFieldStripper.apply(update.getField());
                    var fieldName = segments[segments.length - 1];
                    final var rowIndex = segments[0];
                    final var parentIndex = segments[1];
                    final var sanitizedFieldName = sanitizeFieldName(PERSONNEL_INFO_TABLE, fieldName, connection);
                    if (sanitizedFieldName.isPresent()) {
                        fieldName = sanitizedFieldName.get();
                        try (final var st = connection.prepareStatement("""
                                INSERT INTO
                                    personnel_info(_index, _parent_index, _submission__id, %s)
                                VALUES (?, ?, ?, ?)
                                ON CONFLICT (_index, _parent_index, _submission__id) DO
                                UPDATE SET
                                    %s = EXCLUDED.%s;
                                """.formatted(fieldName, fieldName, fieldName))) {
                            st.setString(1, rowIndex);
                            st.setString(2, parentIndex);
                            st.setString(3, submissionId);
                            st.setObject(4, update.getNewValue());
                        }
                    } else {
                        log.warn("unknown field: {}", update.getField());
                        droppedUpdates.add(update);
                    }
                } else {
                    final var sanitizedFieldName = sanitizeFieldName(DATA_TABLE, update.getField(), connection);
                    if (sanitizedFieldName.isPresent()) {
                        final var fieldName = sanitizedFieldName.get();
                        try (final var st = connection.prepareStatement("""
                                UPDATE %s
                                SET
                                    %s = ?
                                WHERE
                                    _id = ?;
                                """.formatted(DATA_TABLE, fieldName))) {
                            final var value = update.getNewValue();
                            if (value instanceof java.util.Date d)
                                st.setDate(1, new Date(d.getTime()));
                            else {
                                st.setObject(1, update.getNewValue());
                            }
                            st.setString(2, submissionId);
                            if (st.executeUpdate() > 0) {
                                log.debug("updated field: {} with db fieldname: {} to {}", update.getField(), fieldName, update.getNewValue());
                            } else {
                                log.warn("field not updated: {} with db fieldname: {}", update.getField(), fieldName);
                            }
                        }
                    } else {
                        log.warn("unknown field: {}", update.getField());
                        droppedUpdates.add(update);
                    }
                }
            }
            connection.commit();
            return droppedUpdates;
        }
    }

    private Optional<String> sanitizeFieldName(String table, String field, Connection connection) throws
            SQLException {
        try (final var st = connection.prepareStatement("""
                SELECT
                    quote_ident(c.column_name)
                FROM
                    information_schema.columns c
                WHERE
                    c.table_name = ? AND c.column_name = ? LIMIT 1;
                """)) {
            st.setString(1, table);
            st.setString(2, field);
            try (final var rs = st.executeQuery()) {
                if (!rs.next()) return Optional.empty();
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
            // String form,
            int page,
            int size,
            FilterManager filterManager) throws SQLException {
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
            final var sql = new StringBuilder(
                    "SELECT name, label, i18n_key FROM choices WHERE \"group\" = ? AND version = ?");
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

        return result;
    }

    private Stream<DataUpdate> filterUpdates(String tableName, Connection connection, DataUpdate... updates) throws
            SQLException {
        final var builder = Stream.<DataUpdate>builder();
        try (final var st = connection.prepareStatement("""
                SELECT
                    quote_ident(c.column_name)
                FROM
                    information_schema.columns c
                WHERE
                    c.table_name = ? AND c.table_schema = 'public' AND c.column_name = ANY(?);
                """)) {
            st.setArray(2, connection.createArrayOf("text",
                    Arrays.stream(updates)
                            .map(DataUpdate::getField)
//                            .map(s -> s.substring(s.indexOf(":") + 1))
                            .toArray(String[]::new)));
            st.setString(1, tableName);
            try (final var rs = st.executeQuery()) {
                while (rs.next()) {
                    final var columnName = rs.getString(1);
                    Arrays.stream(updates)
                            .filter(u -> {
                                if (columnName.startsWith("\""))
                                    return columnName.contains(u.getField());
                                return u.getField().contains(columnName);
                            }).findFirst()
                            .ifPresent(u -> {
                                u.setField(columnName);
                                builder.add(u);
                            });
                }
            }
        }
        return builder.build();
    }

    @SuppressWarnings({"DuplicatedCode", "rawtypes", "unchecked"})
    public NewSubmissionResult createSubmission(DataUpdate... updates) throws SQLException {
        final var droppedUpdates = new ArrayList<DataUpdate>();
        if (updates.length == 0)
            return new NewSubmissionResult(droppedUpdates, null);
        final var ds = this.dataSourceProvider.get();
        try (final var conn = ds.getConnection()) {
            conn.setAutoCommit(false);
            List<DataUpdate> filteredUpdates = filterUpdates(DATA_TABLE, conn, updates).toList();

            Arrays.stream(updates).forEach(u -> {
                if (filteredUpdates.stream().noneMatch(uu -> uu.getField().contains(u.getField())))
                    droppedUpdates.add(u);
            });

            if (filteredUpdates.isEmpty())
                return new NewSubmissionResult(droppedUpdates, null);

            final var sql = """
                    INSERT INTO
                        data1 (_id, _submitted_by, _uuid, %s)
                    VALUES
                        (nextval('data_id_seq'), now(), gen_random_uuid(), %s)
                    RETURNING _id;
                    """.formatted(
                    filteredUpdates.stream()
                            .map(DataUpdate::getField)
                            .collect(Collectors.joining(", ")),
                    String.join(", ", Collections.nCopies(filteredUpdates.size(), "?")));

            String id = null;
            try (final var st = conn.prepareStatement(sql)) {
                for (var i = 0; i < filteredUpdates.size(); i++) {
                    final var update = filteredUpdates.get(0);
                    final var index = i + 1;
                    if (update.getNewValue() instanceof Date d)
                        st.setDate(index, d);
                    else if (update.getNewValue() instanceof Collection c)
                        st.setString(index, (String) c.stream().map(String::valueOf).collect(Collectors.joining(" ")));
                    else if (update.getNewValue() instanceof java.util.Date d)
                        st.setDate(index, Date.valueOf(DateTimeFormatter.ISO_DATE.format(d.toInstant())));
                    else
                        st.setObject(index, update.getNewValue());
                }
                try (final var rs = st.executeQuery()) {
                    if (rs.next())
                        id = rs.getString(1);
                }
            }
            conn.commit();
            return new NewSubmissionResult(droppedUpdates, id);
        }
    }

    public Optional<SubmissionRef> findSubmissionRefById(String id) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement("""
                    select distinct d._id,
                                    d._submission_time::date,
                                    d._index,
                                    d.q14_02_validation_code,
                                    d.prev,
                                    d.next
                    from (select _id,
                                 _submission_time,
                                 _index,
                                 q14_02_validation_code,
                                 lead(_id) over (order by _submission_time desc) as prev,
                                 lag(_id) over (order by _submission_time desc)  as next
                          from data1) as d
                    where d._id = ?;
                    """)) {
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

    public Collection<SubmissionRef> findSubmissionRefsByIndex(String query) throws SQLException {
        if (StringUtils.isBlank(query))
            return Collections.emptyList();
        final var ds = dataSourceProvider.get();
        try (final var conn = ds.getConnection()) {
            try (final var st = conn.prepareStatement("""
                    select distinct d._id,
                                    d._submission_time::date,
                                    d._index,
                                    d.q14_02_validation_code,
                                    d.prev,
                                    d.next
                    from (select _id,
                                 _submission_time,
                                 _index,
                                 q14_02_validation_code,
                                 lead(_id) over (order by _submission_time desc) as prev,
                                 lag(_id) over (order by _submission_time desc)  as next
                          from data1) as d
                    where d._index LIKE ?
                       OR lower(d.q14_02_validation_code) LIKE lower(?)
                    limit 10;
                                        """)) {
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
}
