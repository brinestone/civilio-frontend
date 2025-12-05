DO
$$
    DECLARE
        _table_name   TEXT;
        _table_schema TEXT;
    BEGIN
        FOR _table_name, _table_schema IN SELECT DISTINCT c.table_name::TEXT, c.table_schema::TEXT
                                          FROM information_schema.columns c
                                          WHERE c.table_schema IN ('csc', 'chefferie', 'fosa')
                                            AND c.table_name <> 'data'
                                            AND c.column_name = '_submission_version_'
            LOOP
            EXECUTE FORMAT('ALTER TABLE %I.%I ALTER COLUMN _submission_version_ SET DATA TYPE TEXT;', _table_schema,
                           _table_name);
            EXECUTE FORMAT('ALTER TABLE %I.%I RENAME COLUMN _submission_version_ TO _submission_version;',
                           _table_schema,
                           _table_name);
            end loop;

        FOR _table_name, _table_schema IN SELECT DISTINCT c.table_name::TEXT, c.table_schema
                                          FROM information_schema.columns c
                                          WHERE c.table_schema IN ('csc', 'chefferie', 'fosa')
                                            AND c.table_name = 'data'
                                            AND c.column_name = '_version_'
            LOOP
            EXECUTE FORMAT('ALTER TABLE %I.%I ALTER COLUMN _version_ SET DATA TYPE TEXT;', _table_schema, _table_name);
            end loop;
    END
$$;
-- ALTER TABLE csc.data_personnel
-- 	ALTER COLUMN _submission_version_ SET DATA TYPE TEXT;
-- ALTER TABLE csc.data_pieces
-- 	ALTER COLUMN _submission_version SET DATA TYPE TEXT;
-- ALTER TABLE csc.data_statistiques
-- 	ALTER COLUMN _submission_version SET DATA TYPE TEXT;
-- ALTER TABLE csc.data_villages
-- 	ALTER COLUMN _submission_version SET DATA TYPE TEXT;
--
-- ALTER TABLE csc.data_personnel
-- 	RENAME COLUMN _submission_version_ TO _submission_version;
--
-- -- fosa
-- ALTER TABLE fosa.data
-- 	ALTER COLUMN _version_ SET DATA TYPE TEXT;
-- ALTER TABLE fosa.data_personnel
-- 	ALTER COLUMN _submission_version_ SET DATA TYPE TEXT;
--
-- ALTER TABLE fosa.data_personnel
-- 	RENAME COLUMN _submission_version_ TO _submission_version;
--
-- -- chefferie
-- ALTER TABLE chefferie.data
-- 	ALTER COLUMN _version_ SET DATA TYPE TEXT;
-- ALTER TABLE chefferie.data_personnel
-- 	ALTER COLUMN _submission_version_ TYPE TEXT;
--
-- ALTER TABLE chefferie.data_personnel
-- 	RENAME COLUMN _submission_version_ TO submission_version;
