package fr.civipol.civilio.services;

import java.io.IOException;
import java.net.JarURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Stream;

import javax.sql.DataSource;

import org.apache.commons.lang3.StringUtils;

import dagger.Lazy;
import fr.civipol.civilio.domain.FieldChange;
import fr.civipol.civilio.domain.PageResult;
import fr.civipol.civilio.entity.FieldMapping;
import fr.civipol.civilio.entity.FormSubmission;
import fr.civipol.civilio.entity.FormType;
import fr.civipol.civilio.event.SubmissionRef;
import fr.civipol.civilio.form.field.Option;
import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__(@Inject))
public class FormService implements AppService {
    private static final String DATA_TABLE = "data";
    private static final String PERSONNEL_INFO_TABLE = "data_personnel";
    private static final String STATISTICS_TABLE = "data_statistiques";
    private static final String PIECES_TABLE = "data_pieces";
    private static final String VILLAGES_TABLE = "data_villages";
    private final Lazy<DataSource> dataSourceProvider;
    private final Lazy<ConfigService> configServiceProvider;
    private final Map<String, Connection> batchConnections = new ConcurrentHashMap<>();
    private final Map<String, Set<PreparedStatement>> batchQueries = new ConcurrentHashMap<>();

    public Collection<FieldMapping> findFieldMappings(FormType form) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            return findFieldMappingsInternal(connection, form.toString());
        }
    }

    public boolean isValidationCodeValid(String code, FormType formType) {
        if (StringUtils.isBlank(code))
            return true;
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement("""
                    select exists(select *
                                  from civilio.validation_codes
                                  where form = CAST(? as civilio.form_types)
                                  and code = ?);
                                        """)) {
                st.setString(2, code);
                st.setString(1, formType.toString());
                try (final var rs = st.executeQuery()) {
                    return rs.next() && rs.getBoolean(1);
                }
            }
        } catch (SQLException ex) {
            log.error("could not validate validation code: {}", code);
        }
        return false;
    }

    public Optional<FieldMapping> findFieldMapping(FormType form, String field) throws SQLException {
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            return findFieldMappingInternal(connection, form.toString(), field);
        }
    }

    public String startBatchOperation() throws SQLException {
        final var ds = dataSourceProvider.get();
        final var batchKey = "%d".formatted(System.currentTimeMillis());
        batchConnections.put(batchKey, ds.getConnection());
        batchQueries.put(batchKey, new HashSet<>());
        return batchKey;
    }

    public void completeBatchOperation(String id) throws SQLException {
        if (Optional.ofNullable(id).filter(StringUtils::isNotBlank).filter(batchConnections::containsKey).isEmpty())
            throw new IllegalArgumentException("id parameter is unknown");
        try (final var conn = batchConnections.get(id)) {
            conn.setAutoCommit(false);
            final var statements = batchQueries.get(id);
            if (statements.isEmpty()) {
                return;
            }
            for (var st : statements) {
                try (st) {
                    st.executeUpdate();
                }
            }
            conn.commit();
        } finally {
            batchConnections.remove(id);
            batchQueries.remove(id);
        }
    }

    public void updateFieldMapping(FormType form, String field, String i18nKey, String dbColumn, String batchKey)
            throws SQLException {
        String tableName = DATA_TABLE;
        final var connection = batchConnections.get(batchKey);
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
                else if (field.contains("sub_forms.indexing") || field.contains("deeds"))
                    tableName = STATISTICS_TABLE;
                else if (field.contains("sub_forms.officers"))
                    tableName = PERSONNEL_INFO_TABLE;
            } else {
                tableName = DATA_TABLE;
            }
            final var schema = form.toString();
            st = connection.prepareStatement(sql);
            st.setString(1, field);
            st.setString(2, i18nKey);
            st.setObject(3, dbColumn);
            st.setString(4, tableName);
            st.setString(5, form.toString());
            st.setObject(6, dbColumn);
            st.setString(7, tableName);
            st.setString(8, schema);
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
        final var queryEntry = batchQueries.get(batchKey);
        queryEntry.add(st);
        log.debug("{} now has {} batched queries", batchKey, queryEntry.size());
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
                    field, i18n_key, db_column, db_table, db_column_type
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
                            columnNameWrapper.get()))) {
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
            Integer submissionIndex,
            FormType form,
            BiFunction<FieldMapping, Integer, String> keyMaker) throws SQLException {
        final var ds = dataSourceProvider.get();
        final var schema = form.toString();
        final var result = new HashMap<String, String>();
        try (final var connection = ds.getConnection()) {
            final var formMappings = findFieldMappingsInternal(connection, form.toString());
            String refColumn;
            final var sql = """
                    SELECT FORMAT('SELECT %I::TEXT FROM %I.%I df WHERE df.%I=%L;', ?, ?, ?, ?, ?);
                    """;
            final var childTables = List.of(PERSONNEL_INFO_TABLE, PIECES_TABLE, STATISTICS_TABLE, VILLAGES_TABLE);
            try (final var ps = connection.prepareStatement(sql)) {
                for (final var mapping : formMappings) {
                    refColumn = childTables.contains(mapping.dbTable()) ? "_parent_index" : "_index";
                    ps.setString(1, mapping.dbColumn());
                    ps.setString(2, schema);
                    ps.setString(3, mapping.dbTable());
                    ps.setString(4, refColumn);
                    ps.setInt(5, submissionIndex);

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
            Integer submissionIndex,
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
                    call.setString(1, String.valueOf(submissionIndex));
                    call.setString(2, form.name().toLowerCase());
                    call.setInt(3, change.getOrdinal());
                    final var field = fieldExtractor.apply(change.getField());
                    call.setString(4, field);
                    call.setObject(5, change.getNewValue());
                    try (final var rs = call.executeQuery()) {
                        if (rs.next())
                            submissionIndex = rs.getInt(1);
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
            Integer submissionIndex,
            Connection connection) throws SQLException {
        try (final var call = connection.prepareCall("""
                CALL civilio.proc_process_deletion_change(
                    submission_index := ?,
                    field_pattern := ?,
                    ordinal := ?,
                    form_type := CAST(? as civilio.form_types)
                );
                """)) {
            call.setString(1, String.valueOf(submissionIndex));
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

    public PageResult<FormSubmission> findFormSubmissions(
            FormType form,
            int page,
            int size,
            String filterQuery) throws SQLException {
        final var dataSource = this.dataSourceProvider.get();
        final var resultBuilder = PageResult.<FormSubmission>builder();
        try (final var connection = dataSource.getConnection()) {
            final var schema = form.toString();
            String sql, countSql;
            if (filterQuery.isBlank()) {
                sql = """
                        SELECT FORMAT('SELECT _id, _index, _validation_status, validation_code, facility_name, _submission_time, form, is_valid FROM
                        civilio.vw_submissions WHERE form = %L::civilio.form_types OFFSET %L::INTEGER LIMIT %L::INTEGER;', ?, ?, ?);
                        """;
                countSql = """
                        SELECT FORMAT('SELECT COUNT(*) FROM civilio.vw_submissions WHERE form = %L::civilio.form_types;', ?);
                        """;
            } else {
                sql = """
                        SELECT FORMAT('SELECT _id, _index, _validation_status, validation_code, facility_name, _submission_time, form, is_valid FROM civilio.vw_submissions WHERE form = %L::civilio.form_types AND (LOWER(_index::TEXT) LIKE %L OR LOWER(validation_code) LIKE %L OR LOWER(facility_name) LIKE %L) OFFSET %L::INTEGER LIMIT %L::INTEGER;', ?, ?, ?, ?, ?, ?);
                        """;
                countSql = """
                        SELECT FORMAT('SELECT COUNT(*) FROM civilio.vw_submissions WHERE form = %L::civilio.form_types AND (LOWER(_index::TEXT) LIKE %L OR LOWER(validation_code) LIKE %L OR LOWER(facility_name) LIKE %L);', ?, ?, ?, ?)
                        """;
            }
            String query, countQuery;
            try (final var ps1 = connection.prepareStatement(sql);
                 final var ps2 = connection.prepareStatement(countSql)) {
                var index = 1;
                ps1.setString(index, schema);
                ps2.setString(index++, schema);
                if (!filterQuery.isBlank()) {
                    String value = "%%%s%%".formatted(filterQuery.toLowerCase());
                    ps1.setString(index, value);
                    ps2.setString(index++, value);
                    ps1.setString(index, value);
                    ps2.setString(index++, value);
                    ps1.setString(index, value);
                    ps2.setString(index++, value);
                }
                ps1.setInt(index++, page * size);
                ps1.setInt(index, size);

                try (final var rs1 = ps1.executeQuery(); final var rs2 = ps2.executeQuery()) {
                    if (!rs1.next())
                        throw new IllegalStateException("Could not generate queries for form submissions");
                    if (!rs2.next())
                        throw new IllegalStateException("Could not generate queries for form submissions");

                    query = rs1.getString(1);
                    countQuery = rs2.getString(1);
                }

                try (final var st1 = connection.createStatement(); final var st2 = connection.createStatement()) {
                    try (final var rs1 = st1.executeQuery(query); final var rs2 = st2.executeQuery(countQuery)) {
                        if (!rs2.next())
                            throw new IllegalStateException("Could not count the total number of records of query");
                        resultBuilder.totalRecords(rs2.getLong(1));

                        final var streamBuilder = Stream.<FormSubmission>builder();
                        while (rs1.next()) {
                            streamBuilder.add(FormSubmission.builder()
                                    .id(rs1.getInt("_id"))
                                    .index(rs1.getInt("_index"))
                                    .validationStatus(rs1.getString("_validation_status"))
                                    .validationCode(rs1.getString("validation_code"))
                                    .facilityName(rs1.getString("facility_name"))
                                    .submittedOn(Optional.ofNullable(rs1.getDate("_submission_time"))
                                            .map(Date::toLocalDate).orElse(null))
                                    .valid(rs1.getBoolean("is_valid"))
                                    .build());
                        }
                        resultBuilder.data(streamBuilder.build().toList());
                    }
                }
            }
        }

        return resultBuilder.build();
    }

    /**
     * Retrieves the available formType options for a given formType formType.
     * <p>
     * This method queries the <code>civilio.choices</code> table for all options
     * associated with the specified formType formType.
     * The results are grouped by the "group" column, and each group contains a list
     * of {@link Option} objects.
     * </p>
     *
     * @param formType the formType or identifier of the formType whose options are
     *                 to be retrieved
     * @return a map where the key is the group name and the value is a list of
     * {@link Option} objects for that group
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
                                rs.getString(3)));
                    }
                }
            }
        }

        return result;
    }

    public Optional<SubmissionRef> findSubmissionRefByIndex(Integer index, FormType form) throws SQLException {
        final var ds = dataSourceProvider.get();
        final var schema = form.toString();
        try (final var connection = ds.getConnection()) {
            try (final var st = connection.prepareStatement("""
                    select d._id,
                           d._submission_time,
                           d._index,
                           d.validation_code,
                           d.next,
                           d.prev
                    from civilio.vw_submissions d
                    where d._index = ? AND d.form = CAST(? as civilio.form_types)
                    limit 1;
                    """)) {
                st.setInt(1, index);
                st.setString(2, schema);
                try (final var rs = st.executeQuery()) {
                    if (!rs.next())
                        return Optional.empty();
                    return Optional.of(new SubmissionRef(rs.getInt(1),
                            Optional.ofNullable(rs.getDate(2))
                                    .map(Date::toLocalDate)
                                    .orElse(null),
                            rs.getInt(3),
                            rs.getString(4),
                            rs.getInt(6),
                            rs.getInt(5)));
                }
            }
        }
    }

    public Collection<SubmissionRef> searchSubmissionRefsByIndex(String query, FormType form)
            throws SQLException {
        if (StringUtils.isBlank(query))
            return Collections.emptyList();
        final var ds = dataSourceProvider.get();
        final var schema = form.toString();
        try (final var conn = ds.getConnection()) {
            String sql;
            try (final var st = conn.prepareStatement("""
                    select d._id,
                           d._submission_time,
                           d._index,
                           d.validation_code,
                           d.next,
                           d.prev
                    from civilio.vw_submissions d
                    where d._index::TEXT LIKE ? AND d.form = CAST(? as civilio.form_types)
                    limit 1;
                    """)) {
                st.setString(1, "%%%s%%".formatted(query.toLowerCase()));
                st.setString(2, schema);
                try (final var rs = st.executeQuery()) {
                    if (!rs.next())
                        throw new IllegalStateException("Could not generate query");
                    sql = rs.getString(1);
                }
            }

            try (final var st = conn.createStatement()) {
                try (final var rs = st.executeQuery(sql)) {
                    final var builder = Stream.<SubmissionRef>builder();
                    while (rs.next()) {
                        builder.add(new SubmissionRef(
                                rs.getInt("_id"),
                                Optional.ofNullable(rs.getDate("_submission_time")).map(Date::toLocalDate).orElse(null),
                                rs.getInt("_index"),
                                rs.getString("validation_code"),
                                rs.getInt("prev"),
                                rs.getInt("next")));
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

    @Override
    public boolean isConfigured(ConfigService cm) throws Exception {
        return configServiceProvider.get().databaseConfigurationValid();
    }

    private int extractMigrationVersion(String fileName) {
        try {
            var version = fileName.substring(0, fileName.indexOf("."));
            return Integer.parseInt(version);
        } catch (Exception ignored) {
            log.warn("Invalid migration version number: {}", fileName);
            return Integer.MAX_VALUE;
        }
    }

    private int compareMigrationVersions(String migration1, String migration2) {
        final var v1 = extractMigrationVersion(migration1);
        final var v2 = extractMigrationVersion(migration2);
        return Integer.compare(v1, v2);
    }

    private Stream<String> getMigrationScripts() throws IOException, URISyntaxException {
        final var path = "migrations/";
        final var resourceUrl = FormService.class.getClassLoader().getResource(path);
        if (resourceUrl == null) {
            final var packagePath = FormService.class.getPackageName().replaceAll("\\.", "/");
            log.warn("No migration directory found at resource path: {}", "/%s/%s".formatted(packagePath, path));
            return Stream.empty();
        }

        final var migrationStream = Stream.<String>builder();
        if ("file".equals(resourceUrl.getProtocol())) {
            final var migrationsPath = Paths.get(resourceUrl.toURI());
            try (final var files = Files.list(migrationsPath)) {
                files.filter(Files::isRegularFile)
                        .map(Path::getFileName)
                        .filter(fileName -> fileName.endsWith(".sql"))
                        .map(Path::toString)
                        .forEach(migrationStream::add);
            }
            return migrationStream.build().sorted(this::compareMigrationVersions);
        } else if ("jar".equals(resourceUrl.getProtocol())) {
            final var connection = (JarURLConnection) resourceUrl.openConnection();
            final var jarFile = connection.getJarFile();
            final var entries = jarFile.entries();
            while (entries.hasMoreElements()) {
                final var entry = entries.nextElement();
                final var entryName = entry.getName();
                if (entryName.startsWith(path + "/") &&
                        !entryName.equals(path + "/") &&
                        entryName.endsWith(".sql")) {
                    String filename = entryName.substring(path.length() + 1);
                    migrationStream.add(filename);
                }
            }
            return migrationStream.build().sorted(this::compareMigrationVersions);
        }

        return Stream.empty();
    }

    private void runMigrations() throws SQLException, IOException, URISyntaxException {
        log.debug("running migration scripts...");
        final var ds = dataSourceProvider.get();
        try (final var connection = ds.getConnection()) {
            connection.setAutoCommit(false);
            assertMigrationsTable(connection);
            final var prefix = "/migrations/";
            final var appliedMigrations = countAppliedMigrations(connection);
            final var migrations = getMigrationScripts()
                    .skip(appliedMigrations)
                    .map(s -> prefix + s)
                    .toList();

            if (migrations.isEmpty()) {
                log.info("Migrations already applied");
                return;
            }
            for (var i = appliedMigrations; i < migrations.size(); i++) {
                final var migrationFile = migrations.get(i);
                final var migrationId = extractMigrationVersion(migrationFile);
                final var resourcePath = "migrations/%s".formatted(migrationFile);
                try (final var is = FormService.class.getResourceAsStream(resourcePath)) {
                    byte[] data;
                    if (is == null) {
                        throw new IOException("Migration file not found: " + resourcePath);
                    }
                    data = is.readAllBytes();
                    if (data == null) {
                        log.warn("Migration file is empty: {}", resourcePath);
                        continue;
                    }
                    final var sql = new String(data, StandardCharsets.UTF_8);
                    try (final var st = connection.createStatement()) {
                        st.executeUpdate(sql);
                    }
                    try (final var ps = connection.prepareStatement("""
                            INSERT INTO civilio.migrations(_version) VALUES (?);
                            """)) {
                        ps.setInt(1, migrationId);
                        ps.executeUpdate();
                    }
                    log.debug("Applied migration: {}", migrationFile);
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
