CREATE OR REPLACE FUNCTION civilio.func_upsert_field_change(
    IN submission_id TEXT,
    IN form_type civilio.form_types,
    IN ordinal INTEGER,
    IN field_id TEXT,
    IN _value TEXT
)
    RETURNS INTEGER AS
$$
DECLARE
    table_name      TEXT;
    column_name     TEXT;
    field_type      TEXT;
    personnel_index INTEGER;
BEGIN
    SELECT ffm.db_table,
           ffm.db_column_type,
           ffm.db_column
    FROM civilio.form_field_mappings ffm
    WHERE ffm.field = field_id
      AND ffm.form = form_type
    INTO table_name, field_type, column_name;

    IF table_name IS NULL OR field_type IS NULL THEN
        RAISE EXCEPTION 'Field is not mapped: %s', field_id;
    END IF;

    IF table_name = 'data_fosa' AND (submission_id IS NULL OR length(submission_id)) = 0 THEN
        SELECT civilio.create_fosa_record()::TEXT INTO submission_id;
    end if;

    if table_name = 'data_personnel' then
        SELECT _index
        FROM data_personnel dp
        WHERE dp._submission_id = submission_id::INTEGER
        OFFSET ordinal LIMIT 1
        INTO personnel_index;

        IF personnel_index IS NULL THEN
            SELECT civilio.func_create_personnel_record(submission_id, NULL) INTO personnel_index;
        end if;
    end if;

    if table_name = 'data_fosa' then
        EXECUTE 'UPDATE data_fosa'
                    || ' SET ' ||
                column_name ||
                ' = ' || _value ||
                ' WHERE _id = ' || submission_id ||
                ';';
    end if;

    if table_name = 'data_personnel' then
        EXECUTE 'UPDATE data_fosa'
                    || ' SET ' ||
                column_name ||
                ' = CAST(' || _value ||
                ' AS ' || field_type ||
                ') WHERE _index = ' || personnel_index ||
                ' AND _submission_id = ' || submission_id ||
                ';';
    end if;
    RETURN submission_id;
END;
$$ language plpgsql;