drop function if exists civilio.func_upsert_field_change (
    text,
    civilio.form_types,
    integer,
    text,
    text
);

create function civilio.func_upsert_field_change(submission_index text, form_type civilio.form_types, ordinal integer,
                                                 field_id text, _value text) returns integer
    language plpgsql
as
$$
DECLARE
    table_name      TEXT;
    column_name     TEXT;
    field_type      TEXT;
    sub_table_index INTEGER;
    update_query    TEXT;
    schema_name     TEXT;
    sub_table_query TEXT;
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

    schema_name := form_type::TEXT;
    IF submission_index IS NULL OR submission_index = '' THEN
        IF table_name = 'data' THEN
            IF schema_name = 'fosa' THEN
                SELECT civilio.func_create_fosa_record()::TEXT INTO submission_index;
            ELSIF schema_name = 'csc' THEN
                SELECT civilio.func_create_csc_record()::TEXT INTO submission_index;
            ELSIF schema_name = 'chefferie' THEN
                SELECT civilio.func_create_chefferie_record()::TEXT INTO submission_index;
            ELSE
                RAISE EXCEPTION 'Invalid value for form_type specified: %. form_type must be one of (''fosa'', ''chefferie'', ''csc'').', schema_name;
            END IF;
--         ELSIF table_name IN ('data_personnel', 'data_statistiques', 'data_villages', 'data_pieces') THEN
--             SELECT civilio.create_chefferie_record()::TEXT INTO submission_index;
        ELSE
            RAISE EXCEPTION 'Unsupported table: %', table_name;
        END IF;
    END IF;

    IF table_name IN ('data_personnel', 'data_statistiques', 'data_villages', 'data_pieces') THEN
        sub_table_query := FORMAT(
                'SELECT _index FROM %I.%I dp WHERE dp._submission_id = submission_id::INTEGER ORDER BY _index OFFSET %L LIMIT 1;',
                schema_name,
                table_name,
                ordinal
            );

        EXECUTE sub_table_query INTO sub_table_index;

        -- Create new personnel record if not found
        IF sub_table_index IS NULL THEN
            IF table_name = 'data_personnel' THEN
                SELECT civilio.func_create_personnel_record(
                               submission_index::INTEGER,
                               'FOSA OUEST',
                               schema_name
                           )
                INTO sub_table_index;
            ELSIF table_name = 'data_statistiques' THEN
                SELECT civilio.func_create_csc_stat_record(submission_index::INTEGER) INTO sub_table_index;
            ELSIF table_name = 'data_villages' THEN
                SELECT civilio.func_create_csc_village_record(submission_index::INTEGER) INTO sub_table_index;
            ELSIF table_name = 'data_pieces' THEN
                SELECT civilio.func_create_csc_pieces(submission_index::INTEGER) INTO sub_table_index;
            ELSE
                RAISE EXCEPTION 'Unsupported table: %', table_name;
            end if;
        END IF;
    END IF;

    -- Build and execute the appropriate update query
    IF table_name = 'data' THEN
        update_query := FORMAT(
                'UPDATE %I.data SET %I = %L::%s WHERE _id = %L',
                schema_name,
                column_name,
                _value,
                field_type,
                submission_index
            );
    ELSE
        RAISE EXCEPTION 'Unsupported table: %', table_name;
    END IF;

    EXECUTE update_query;

    RETURN submission_index::INTEGER;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating field % in table %: %', field_id, table_name, SQLERRM;
END;
$$;