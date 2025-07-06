create function func_upsert_field_change(submission_id text, form_type civilio.form_types, ordinal integer,
                                         field_id text, _value text) returns integer
    language plpgsql
as
$$
DECLARE
    table_name      TEXT;
    column_name     TEXT;
    field_type      TEXT;
    personnel_index INTEGER;
    update_query    TEXT;
BEGIN
    -- Get field mapping information
    SELECT ffm.db_table,
           ffm.db_column_type,
           ffm.db_column
    FROM civilio.form_field_mappings ffm
    WHERE ffm.field = field_id
      AND ffm.form = form_type
    INTO table_name, field_type, column_name;

    IF table_name IS NULL OR field_type IS NULL OR column_name IS NULL THEN
        RAISE EXCEPTION 'Field is not mapped: % for form type %', field_id, form_type;
    END IF;

    -- Handle FOSA record creation if needed
    IF table_name = 'data_fosa' AND (submission_id IS NULL OR submission_id = '') THEN
        SELECT civilio.create_fosa_record()::TEXT INTO submission_id;
    END IF;

    -- Handle personnel record
    IF table_name = 'data_personnel' THEN
        -- Try to find existing personnel record
        SELECT _index
        FROM data_personnel dp
        WHERE dp._submission_id = submission_id::INTEGER
        ORDER BY _index
        OFFSET ordinal LIMIT 1
        INTO personnel_index;

        -- Create new personnel record if not found
        IF personnel_index IS NULL THEN
            SELECT civilio.func_create_personnel_record(
                           submission_id::INTEGER,
                           CASE WHEN form_type = 'fosa' THEN 'FOSA OUEST' ELSE NULL END
                       )
            INTO personnel_index;
        END IF;
    END IF;

    -- Build and execute the appropriate update query
    IF table_name = 'data_fosa' THEN
        update_query := format(
                'UPDATE data_fosa SET %I = %L::%s WHERE _id = %L',
                column_name,
                _value,
                field_type,
                submission_id
            );
    ELSIF table_name = 'data_personnel' THEN
        update_query := format(
                'UPDATE data_personnel SET %I = %L::%s WHERE _index = %s AND _submission_id = %L',
                column_name,
                _value,
                field_type,
                personnel_index,
                submission_id
            );
    ELSE
        RAISE EXCEPTION 'Unsupported table: %', table_name;
    END IF;

    EXECUTE update_query;

    RETURN submission_id::INTEGER;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating field % in table %: %', field_id, table_name, SQLERRM;
END;
$$;