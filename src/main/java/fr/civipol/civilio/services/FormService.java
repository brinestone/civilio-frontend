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
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Stream;

@Slf4j
public class FormService implements AppService {
    private static final String CHEFFERIE_TABLE = "data_chefferie";
    private static final String PERSONNEL_INFO_TABLE = "data_personnel";
    private static final String FOSA_TABLE = "data_fosa";
    private static final String STATS_TABLE = "fosa_vital_stats";
    private static final String CHEFFERIE_PERSONNEL_TABLE = "data_chefferie_personnel";
    private static final String[] TABLES = {FOSA_TABLE, PERSONNEL_INFO_TABLE, STATS_TABLE, CHEFFERIE_TABLE, CHEFFERIE_PERSONNEL_TABLE};
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
        String tableName = form.getDbTable();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);
            PreparedStatement st;
            String sql;
            if (dbColumn != null) {
                sql = """
                        INSERT INTO
                            civilio.form_field_mappings(field, i18n_key, db_column, db_table, form, db_column_type)
                        VALUES (?, ?, ?, ?, CAST(? as civilio.form_types), (SELECT c.data_type from information_schema.columns c WHERE c.column_name = ? AND c.table_name = ? AND c.table_schema = 'public' LIMIT 1))
                        ON CONFLICT (field, form) DO UPDATE
                        SET
                            db_column = EXCLUDED.db_column,
                            db_table = EXCLUDED.db_table,
                            i18n_key = EXCLUDED.i18n_key,
                            db_column_type = EXCLUDED.db_column_type;
                        """;
                if (form.equals(FormType.FOSA)) {
                    if (field.startsWith(PERSONNEL_INFO_TABLE)) tableName = PERSONNEL_INFO_TABLE;
                } else if (form.equals(FormType.CHIEFDOM)) {
                    if (field.startsWith(CHEFFERIE_PERSONNEL_TABLE)) tableName = CHEFFERIE_PERSONNEL_TABLE;
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
                            civilio.form_field_mappings
                        WHERE
                            field = ? AND form = CAST(? as civilio.form_types);
                        """;
                st = connection.prepareStatement(sql);
                st.setString(1, field);
                st.setString(2, form.toString());
            }

            try (st) {
                st.executeUpdate();
                if (dbColumn != null)
                    log.debug("Updated mapping for field: {} -> table={}, column={}", field, tableName, dbColumn);
            } catch (SQLException ex) {
                log.error("error while updating field mapping for form: {}, and field : {}", form, field, ex);
                throw ex;
            }

            connection.commit();
        }
    }

    public Collection<String> getFormColumnNames(FormType form) throws SQLException {
        final var sql = """
                SELECT DISTINCT
                    c.column_name
                FROM
                    information_schema.columns c
                WHERE c.table_name = ANY(?) AND c.table_schema = 'public'
                ORDER BY c.column_name;
                """;
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement(sql)) {
                String[] tables = {};
                if (form == FormType.FOSA) tables = new String[]{FOSA_TABLE, PERSONNEL_INFO_TABLE};
                else if (form == FormType.CHIEFDOM) tables = new String[]{CHEFFERIE_TABLE, CHEFFERIE_PERSONNEL_TABLE};
                st.setArray(1, connection.createArrayOf("text", tables));
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
                    i18n_key, db_column, db_table, db_column_type
                FROM
                    civilio.form_field_mappings ffm
                WHERE
                    ffm.form = CAST(? AS civilio.form_types) AND ffm.field = ?
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
                                rs.getString(4)
                        )
                );
            }
        }
    }

    private List<FieldMapping> findFieldMappingsInternal(Connection connection, String form) throws SQLException {
        final var sql = """
                SELECT
                    field, i18n_key, quote_ident(db_column), db_table, db_column_type
                FROM
                    civilio.form_field_mappings
                WHERE
                    form = CAST(? as civilio.form_types);
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
                                    rs.getString(5)
                            )
                    );
                }
                return builder.build().toList();
            }
        }
    }

    public <T> Collection<T> findAutoCompletionValuesFor(
            String fieldId,
            FormType form,
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
            final var mappingWrapper = findFieldMappingInternal(conn, form.toString(), fieldId);
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
                if (mapping.dbTable().equals(PERSONNEL_INFO_TABLE) || mapping.dbTable().equals(CHEFFERIE_PERSONNEL_TABLE)) {
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

    //    @SuppressWarnings({"DuplicatedCode"})
    public void updateSubmission(
            String submissionId,
            FormType form,
            Function<String, String> fieldExtractor,
            FieldChange... changes) throws SQLException {
        if (changes.length == 0)
            return;
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);
            try (final var call = connection.prepareCall("""
                    SELECT CAST(
                        (SELECT
                            civilio.func_upsert_field_change(
                                CAST(? as TEXT),
                                CAST(? as civilio.form_types),
                                CAST(? as INTEGER),
                                CAST(? as TEXT),
                                CAST(? AS TEXT)
                            )) AS TEXT);
                    """)) {
                for (var change : changes) {
                    if (change.isDeletionChange()) {
                        processDeletionChange(change.getOrdinal() + 1, form.toString(), change.getField(), submissionId, connection);
                        continue;
                    }
                    call.setString(1, submissionId);
                    call.setString(2, form.name().toLowerCase());
                    call.setInt(3, change.getOrdinal());
                    final var field = fieldExtractor.apply(change.getField());
                    call.setString(4, field);
                    call.setObject(5, change.getNewValue());
                    try (final var rs = call.executeQuery()) {
                        if (rs.next())
                            submissionId = rs.getString(1);
                        else throw new IllegalStateException("An error occurred");
                    }
                }
            }
            connection.commit();
        } catch (SQLException e) {
            log.error("Error updating submission {} for form {}", submissionId, form, e);
            throw e;
        }
    }

    private void processDeletionChange(
            int ordinal,
            String form,
            String fieldPattern,
            String submissionId,
            Connection connection
    ) throws SQLException {
        try (final var call = connection.prepareCall("""
                CALL civilio.proc_process_deletion_change(
                    submission_id := ?,
                    field_pattern := ?,
                    ordinal := ?,
                    form_type := CAST(? as civilio.form_types)
                );
                """)) {
            call.setString(1, submissionId);
            call.setString(2, fieldPattern);
            call.setInt(3, ordinal);
            call.setString(4, form);
            call.executeUpdate();
        }
    }

    private Optional<String> sanitizeColumnName(String table, String column, Connection connection) throws SQLException {
        try (final var st = connection.prepareStatement("""
                SELECT
                    quote_ident(c.column_name)
                FROM
                    information_schema.columns c
                WHERE
                    c.table_name = ? AND c.column_name = ? AND c.table_schema = 'public' LIMIT 1;
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

    public void deleteSubmissions(FormType form, String... ids) throws SQLException {
        if (ids.length == 0)
            return;
        final var dataSource = this.dataSourceProvider.get();
        try (final var connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try (final var st = connection.prepareStatement("""
                    DELETE FROM %s WHERE _index IN (%s);
                    """.formatted(form.getDbTable(), String.join(",", Collections.nCopies(ids.length, "?"))))) {
                for (var i = 0; i < ids.length; i++) {
                    st.setString(i + 1, ids[i]);
                }

                st.executeUpdate();
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
            String tableName = switch (form) {
                default -> FOSA_TABLE;
                case CHIEFDOM -> CHEFFERIE_TABLE;
            };

            final var sql = """
                    SELECT
                        df._id,
                        df._validation_status,
                        df.q14_02_validation_code,
                        df._submitted_by,
                        df._index,
                        df.q1_12_officename,
                        df._submission_time::DATE
                    FROM
                        %s df
                    WHERE
                        %s
                    ORDER BY
                        _submission_time::DATE DESC
                    OFFSET ?
                    LIMIT ?;
                    """.formatted(tableName, filter.getWhereClause());
            final var countSql = """
                    SELECT
                        COUNT(distinct _index)
                    FROM
                        %s
                    WHERE
                        %s;
                    """.formatted(tableName, filter.getWhereClause());

            try (
                    final var ps = connection.prepareStatement(sql);
                    final var countPs = connection.prepareStatement(countSql)
            ) {
                filter.applyToPreparedStatement(ps);
                var index = filter.getParameters().size();
                ps.setInt(++index, page * size);
                ps.setInt(++index, size);
                filter.applyToPreparedStatement(countPs);

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
                    "SELECT name, label, i18n_key FROM civilio.choices WHERE \"group\" = ? AND version = ?"
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
        runMigrations();
    }

    private Set<String> getMigrationScripts() {
        // The path to your migrations folder within resources
        // Ensure you use a trailing slash to indicate a directory
        String migrationsPath = "/migrations/";

        Set<String> fileNames = new HashSet<>();

        // Get the URL for the migrations folder
        URL migrationsFolderUrl = getClass().getResource(migrationsPath);

        if (migrationsFolderUrl == null) {
            System.err.println("Migrations folder not found: " + migrationsPath);
            return fileNames;
        }

        // Determine if running from a JAR or directly from file system
        String protocol = migrationsFolderUrl.getProtocol();

        if ("jar".equals(protocol)) {
            // Running from a JAR file
            String jarPath = migrationsFolderUrl.getPath().substring(5, migrationsFolderUrl.getPath().indexOf("!"));
            try (final var jar = new JarFile(java.net.URLDecoder.decode(jarPath, StandardCharsets.UTF_8))) {
                Enumeration<JarEntry> entries = jar.entries();
                while (entries.hasMoreElements()) {
                    JarEntry entry = entries.nextElement();
                    String name = entry.getName();

                    // Check if the entry is within the migrations path and is a direct file
                    if (name.startsWith(migrationsPath) && !entry.isDirectory()) {
                        // Extract just the file name
                        String relativePath = name.substring(migrationsPath.length());
                        // Ensure it's not a file in a deeper subdirectory
                        if (!relativePath.contains("/")) {
                            fileNames.add(relativePath);
                        }
                    }
                }
            } catch (IOException e) {
                System.err.println("Error reading JAR file: " + e.getMessage());
                e.printStackTrace();
            }
        } else if ("file".equals(protocol)) {
            // Running from the file system (e.g., during development in an IDE)
            try {
                final var directory = new File(migrationsFolderUrl.toURI());
                if (directory.isDirectory()) {
                    final var files = directory.listFiles();
                    if (files != null) {
                        for (var file : files) {
                            // Only add actual files, not subdirectories
                            if (file.isFile()) {
                                fileNames.add(file.getName());
                            }
                        }
                    }
                } else {
                    System.err.println("Path is not a directory: " + migrationsFolderUrl.toExternalForm());
                }
            } catch (URISyntaxException e) {
                System.err.println("Invalid URI for migrations path: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.err.println("Unsupported protocol for migrations folder: " + protocol);
        }

        return fileNames;
    }

    private void runMigrations() throws SQLException, IOException, URISyntaxException {
        log.debug("running migration scripts...");
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);
            assertMigrationsTable(connection);
            final var prefix = "/migrations/";
            final var appliedMigrations = countAppliedMigrations(connection);
            final var migrations = getMigrationScripts().stream()
                    .sorted((o1, o2) -> {
                        final var i = Integer.parseInt(o1.substring(0, o1.indexOf(".")));
                        final var j = Integer.parseInt(o2.substring(0, o2.indexOf(".")));
                        return Integer.compare(i, j);
                    })
                    .skip(appliedMigrations)
                    .map(s -> prefix + s)
                    .toList();

            if (migrations.isEmpty()) {
                log.info("Migrations already applied");
                return;
            }
            try (final var st = connection.createStatement()) {
                for (var migration : migrations) {
                    final var id = migration.substring(prefix.length(), migration.indexOf("."));
                    final var sql = Files.readString(Paths.get(Objects.requireNonNull(FormService.class.getResource(migration)).toURI()));
                    st.execute(sql);
                    try (final var ps = connection.prepareStatement("""
                            INSERT INTO
                                civilio.migrations (_version)
                            VALUES
                                (CAST(? AS INTEGER));
                            """)) {
                        ps.setString(1, id);
                        ps.executeUpdate();
                    }
                    log.debug("Applied migration: {}", migration);
                }
            }


            connection.commit();
            log.info("Migrations applied successfully");
        } catch (SQLException | IOException | URISyntaxException e) {
            log.error("Error while running migrations", e);
            throw e;
        }
    }

    private int countAppliedMigrations(Connection connection) throws SQLException {
        final var sql = """
                SELECT COUNT(_version) FROM civilio.migrations;
                """;
        try (final var ps = connection.prepareStatement(sql)) {
            try (final var rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return 0;
                }
                return rs.getInt(1);
            }
        }
    }

    private void assertMigrationsTable(Connection connection) throws SQLException {
        if (!migrationsTableExists(connection)) {
            createMigrationsTable(connection);
        }
    }

    private void createMigrationsTable(Connection connection) throws SQLException {
        final var sql = """
                CREATE SCHEMA IF NOT EXISTS civilio;
                CREATE TABLE IF NOT EXISTS civilio.migrations(
                    _version integer not null,
                    applied_at timestamp default now()
                );
                """;
        try (final var ps = connection.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    private boolean migrationsTableExists(Connection connection) throws SQLException {
        final var sql = """
                select
                    count(*) > 0 as "exists"
                from
                    information_schema.tables t
                where
                    t.table_name = 'migrations' AND t.table_schema = 'civilio';
                """;
        try (final var ps = connection.prepareStatement(sql)) {
            try (final var rs = ps.executeQuery()) {
                return rs.next() && rs.getBoolean(1);
            }
        }
    }
}
