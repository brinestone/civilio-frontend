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
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor(onConstructor = @__(@Inject))
public class FormService implements AppService {
    private static final String DATA_TABLE = "data";
    private static final String PERSONNEL_INFO_TABLE = "data_personnel";
    private static final String STATISTICS_TABLE = "data_statistiques";
    private static final String PIECES_TABLE = "data_pieces";
    private static final String VILLAGES_TABLE = "data_villages";
    private final Lazy<DataSource> dataSourceProvider;

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

    public void updateFieldMapping(FormType form, String field, String i18nKey, String dbColumn) throws SQLException {
        final var ds = dataSourceProvider.get();
        String tableName = DATA_TABLE;
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);
            PreparedStatement st;
            String sql;
            if (dbColumn != null) {
                sql = """
                        INSERT INTO
                            civilio.form_field_mappings(field, i18n_key, db_column, db_table, form, db_column_type)
                        VALUES (?, ?, ?, ?, CAST(? as civilio.form_types),
                        (SELECT c.data_type from information_schema.columns c WHERE c.column_name = ? AND c.table_name = ? AND c.table_schema = ? LIMIT 1))
                        ON CONFLICT (field, form) DO UPDATE
                        SET
                            db_column = EXCLUDED.db_column,
                            db_table = EXCLUDED.db_table,
                            i18n_key = EXCLUDED.i18n_key,
                            db_column_type = EXCLUDED.db_column_type;
                        """;
                if (field.startsWith(PERSONNEL_INFO_TABLE))
                    tableName = PERSONNEL_INFO_TABLE;
                else if (form.equals(FormType.CSC)) {
                    if (field.contains("sub_forms.villages"))
                        tableName = VILLAGES_TABLE;
                    else if (field.contains("sub_forms.rooms"))
                        tableName = PIECES_TABLE;
                    else if (field.contains("sub_forms.indexing"))
                        tableName = STATISTICS_TABLE;
                    else if (field.contains("sub_forms.officers"))
                        tableName = PERSONNEL_INFO_TABLE;
                } else {
                    tableName = DATA_TABLE;
                }
                st = connection.prepareStatement(sql);
                st.setString(1, field);
                st.setString(2, i18nKey);
                st.setObject(3, dbColumn);
                st.setString(4, tableName);
                st.setString(5, form.toString());
                st.setObject(6, dbColumn);
                st.setString(7, tableName);
                st.setString(8, form.toString());
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
        final var schema = form.toString();
        final var sql = """
                SELECT DISTINCT
                    c.column_name
                FROM
                    information_schema.columns c
                WHERE c.table_name = ANY(?) AND c.table_schema = ?
                ORDER BY c.column_name;
                """;
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement(sql)) {
                String[] tables = {};
                if (form == FormType.FOSA || form == FormType.CHIEFDOM)
                    tables = new String[]{DATA_TABLE, PERSONNEL_INFO_TABLE};
                else if (form == FormType.CSC)
                    tables = new String[]{DATA_TABLE, PERSONNEL_INFO_TABLE, VILLAGES_TABLE, PIECES_TABLE,
                            STATISTICS_TABLE};
                st.setArray(1, connection.createArrayOf("text", tables));
                st.setString(2, schema);
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
                        rs.getString(4)));
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
                            rs.getString(5)));
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
                    UPPER(TRIM(BOTH FROM df.%s::TEXT))
                FROM
                    %s.%s df
                WHERE
                    LOWER(df.%s) LIKE LOWER(?)
                ORDER BY
                    UPPER(TRIM(BOTH FROM df.%s::TEXT))
                LIMIT ?;
                """;
        final var ds = dataSourceProvider.get();
        try (final var conn = ds.getConnection()) {
            final var mappingWrapper = findFieldMappingInternal(conn, form.toString(), fieldId);
            if (mappingWrapper.isEmpty())
                return Collections.emptyList();
            final var mapping = mappingWrapper.get();
            final var columnNameWrapper = sanitizeColumnName(form, mapping.dbTable(), mapping.dbColumn(), conn);
            if (columnNameWrapper.isEmpty())
                return Collections.emptyList();
            try (final var st = conn.prepareStatement(
                    sql.formatted(
                            columnNameWrapper.get(),
                            form.toString(),
                            mapping.dbTable(),
                            columnNameWrapper.get(),
                            columnNameWrapper.get())
            )) {
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
            String submissionIndex,
            FormType form,
            BiFunction<FieldMapping, Integer, String> keyMaker) throws SQLException {
        final var ds = dataSourceProvider.get();
        final var schema = form.toString();
        final var result = new HashMap<String, String>();
        try (final var connection = ds.getConnection()) {
            final var formMappings = findFieldMappingsInternal(connection, form.toString());
            String refColumn;
            final var sql = """
                    SELECT FORMAT('SELECT %I::TEXT FROM %I.%I df WHERE df.%I=CAST(%L AS INTEGER);', ?, ?, ?, ?, ?);
                    """;
            final var childTables = List.of(PERSONNEL_INFO_TABLE, PIECES_TABLE, STATISTICS_TABLE, VILLAGES_TABLE);
            try (final var ps = connection.prepareStatement(sql)) {
                for (final var mapping : formMappings) {
                    refColumn = childTables.contains(mapping.dbTable()) ? "_parent_index" : "_index";
                    ps.setString(1, mapping.dbColumn());
                    ps.setString(2, schema);
                    ps.setString(3, mapping.dbTable());
                    ps.setString(4, refColumn);
                    ps.setString(5, submissionIndex);

                    String query;
                    try (final var rs = ps.executeQuery()) {
                        rs.next();
                        query = rs.getString(1);
                    }
                    try (final var st = connection.createStatement()) {
                        try (final var rs = st.executeQuery(query)) {
                            var cnt = 0;
                            while (rs.next()) {
                                result.put(keyMaker.apply(mapping, cnt++), rs.getString(1));
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    // @SuppressWarnings({"DuplicatedCode"})
    public void updateSubmission(
            String submissionIndex,
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
                        processDeletionChange(change.getOrdinal() + 1, form.toString(), change.getField(),
                                submissionIndex, connection);
                        continue;
                    }
                    call.setString(1, submissionIndex);
                    call.setString(2, form.name().toLowerCase());
                    call.setInt(3, change.getOrdinal());
                    final var field = fieldExtractor.apply(change.getField());
                    call.setString(4, field);
                    call.setObject(5, change.getNewValue());
                    try (final var rs = call.executeQuery()) {
                        if (rs.next())
                            submissionIndex = rs.getString(1);
                        else
                            throw new IllegalStateException("An error occurred");
                    }
                }
            }
            connection.commit();
        } catch (SQLException e) {
            log.error("Error updating submission {} for form {}", submissionIndex, form, e);
            throw e;
        }
    }

    private void processDeletionChange(
            int ordinal,
            String form,
            String fieldPattern,
            String submissionIndex,
            Connection connection) throws SQLException {
        try (final var call = connection.prepareCall("""
                CALL civilio.proc_process_deletion_change(
                    submission_index := ?,
                    field_pattern := ?,
                    ordinal := ?,
                    form_type := CAST(? as civilio.form_types)
                );
                """)) {
            call.setString(1, submissionIndex);
            call.setString(2, fieldPattern);
            call.setInt(3, ordinal);
            call.setString(4, form);
            call.executeUpdate();
        }
    }

    private Optional<String> sanitizeColumnName(FormType form, String table, String column, Connection connection)
            throws SQLException {
        try (final var st = connection.prepareStatement("""
                SELECT
                    quote_ident(c.column_name)
                FROM
                    information_schema.columns c
                WHERE
                    c.table_name = ? AND c.column_name = ? AND c.table_schema = ? LIMIT 1;
                """)) {
            st.setString(1, table);
            st.setString(2, column);
            st.setString(3, form.toString());
            try (final var rs = st.executeQuery()) {
                if (!rs.next())
                    return Optional.empty();
                return Optional.ofNullable(rs.getString(1));
            }
        }
    }

    public void deleteSubmissions(FormType form, String... indices) throws SQLException {
        if (indices.length == 0)
            return;
        final var dataSource = this.dataSourceProvider.get();
        try (final var connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try (final var st = connection.prepareStatement("""
                    DELETE FROM %s.data d WHERE d._index IN (%s);
                    """.formatted(form.toString(), String.join(",", Collections.nCopies(indices.length, "?"))))) {
                for (var i = 0; i < indices.length; i++) {
                    st.setString(i + 1, indices[i]);
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
            String schema = form.toString();
            String sql;
            if (form == FormType.FOSA || form == FormType.CHIEFDOM)
                sql = """
                        SELECT
                            df._id,
                            df._index,
                            df._validation_status,
                            df.q14_02_validation_code,
                            df._submitted_by,
                            df.q1_12_officename,
                            df._submission_time::DATE
                        FROM
                            %s.data df
                        WHERE
                            %s
                        ORDER BY
                            _submission_time::DATE DESC
                        OFFSET ?
                        LIMIT ?;
                        """.formatted(schema, filter.getWhereClause());
            else
                sql = """
                        SELECT
                            df._id,
                            df._index,
                            df._validation_status,
                            df.code_de_validation,
                            df._submitted_by,
                            df.q2_4_officename,
                            df._submission_time::DATE
                        FROM
                            csc.data df
                        WHERE
                            %s
                        ORDER BY
                            _submission_time::DATE DESC
                        OFFSET ?
                        LIMIT ?;
                        """.formatted(filter.getWhereClause());
            final var countSql = """
                    SELECT
                        COUNT(distinct _index)
                    FROM
                        %s.data
                    WHERE
                        %s;
                    """.formatted(schema, filter.getWhereClause());
            try (
                    final var ps = connection.prepareStatement(sql);
                    final var countPs = connection.prepareStatement(countSql)) {
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
                                        .index(rs.getString(2))
                                        .validationStatus(rs.getString(3))
                                        .validationCode(rs.getString(4))
                                        .submittedBy(rs.getString(5))
                                        .facilityName(rs.getString(6))
                                        .submittedOn(rs.getDate(7))
                                        .build());
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

    /**
     * Retrieves the available formType options for a given formType formType.
     * <p>
     * This method queries the <code>civilio.choices</code> table for all options associated with the specified formType formType.
     * The results are grouped by the "group" column, and each group contains a list of {@link Option} objects.
     * </p>
     *
     * @param formType the formType or identifier of the formType whose options are to be retrieved
     * @return a map where the key is the group name and the value is a list of {@link Option} objects for that group
     * @throws SQLException if a database access error occurs
     */
    public Map<String, List<Option>> findFormOptions(FormType formType) throws SQLException {
        final var result = new HashMap<String, List<Option>>();
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement("""
                    SELECT
                        c.name, c.label, c.parent, c."group", c.i18n_key
                    FROM
                        civilio.choices c
                    WHERE
                        c.version = CAST(? AS civilio.form_types);
                    """)) {
                st.setString(1, formType.toString());
                try (final var rs = st.executeQuery()) {
                    while (rs.next()) {
                        final var list = result.computeIfAbsent(rs.getString(4), k -> new ArrayList<>());
                        list.add(new Option(
                                        rs.getString(2),
                                        rs.getString(1),
                                        rs.getString(5),
                                        rs.getString(3)
                                )
                        );
                    }
                }
            }
        }

        return result;
    }

    public Optional<SubmissionRef> findSubmissionRefByIndex(String index, FormType form) throws SQLException {
        final var ds = dataSourceProvider.get();
        final var schema = form.toString();
        try (final var connection = ds.getConnection()) {
            String validationCodeColumn = "q14_02_validation_code";
            if (form == FormType.CSC)
                validationCodeColumn = "code_de_validation";

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
                                    %s as q14_02_validation_code,
                                    lead(_index) over (order by _index) as next,
                                    lag(_index) over (order by _index)  as prev
                            from
                                    %s.data
                         ) as d
                    where d._index = CAST(? as integer);
                    """.formatted(validationCodeColumn, schema))) {
                st.setString(1, index);
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

    public Collection<SubmissionRef> findSubmissionRefsByIndex(String query, String fieldId, FormType form)
            throws SQLException {
        if (StringUtils.isBlank(query))
            return Collections.emptyList();
        final var ds = dataSourceProvider.get();
        final var schema = form.toString();
        try (final var conn = ds.getConnection()) {
            final var mappingWrapper = findFieldMappingInternal(conn, form.toString(), fieldId);
            if (mappingWrapper.isEmpty()) {
                return Collections.emptyList();
            }
            final var mapping = mappingWrapper.get();

            try (final var st = conn.prepareStatement("""
                    SELECT FORMAT('
                        SELECT
                            d._id::TEXT,
                            d._submission_time::DATE,
                            d._index::TEXT,
                            d.q14_02_validation_code,
                            d.prev::TEXT,
                            d.next::TEXT
                        FROM (
                            SELECT
                                _id,
                                _submission_time,
                                _index,
                                q14_02_validation_code,
                                lead(_index) over (order by _index) as next,
                                lag(_index) over (order by _index)  as prev
                            FROM
                                %I.data
                            ) as d
                        WHERE
                            d._index LIKE %L OR LOWER(d.%I) LIKE LOWER(%L)
                        LIMIT 10;
                    ', ?, ?, ?, ?);
                                        """)) {
                st.setString(1, schema);
                st.setString(2, "%%%s%%".formatted(query));
                st.setString(3, mapping.dbColumn());
                st.setString(4, "%%%s%%".formatted(query));
                try (final var rs = st.executeQuery()) {
                    final var builder = Stream.<SubmissionRef>builder();
                    while (rs.next()) {
                        builder.add(new SubmissionRef(
                                rs.getString(1),
                                rs.getDate(2).toLocalDate(),
                                rs.getString(3),
                                rs.getString(4),
                                rs.getString(5),
                                rs.getString(6))
                        );
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
                    final var sql = Files.readString(
                            Paths.get(Objects.requireNonNull(FormService.class.getResource(migration)).toURI()));
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
                SELECT EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_name = 'migrations' AND t.table_schema = 'civilio');
                """;
        try (final var ps = connection.prepareStatement(sql)) {
            try (final var rs = ps.executeQuery()) {
                return rs.next() && rs.getBoolean(1);
            }
        }
    }
}
