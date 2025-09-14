create or replace procedure civilio.proc_process_deletion_change(submission_index text, IN field_pattern text,
                                                                 IN ordinal integer, IN form_type civilio.form_types)
    language plpgsql
as
$$
DECLARE
    table_name             TEXT;
    ref_index              INTEGER;
    schema_name            TEXT;
    personnel_lookup_query TEXT;
    delete_query           TEXT;
BEGIN
    IF submission_index IS NULL OR submission_index = '' THEN
        RAISE EXCEPTION 'Invalid submission index: "%"', submission_index;
    end if;

    SELECT ffm.db_table
    FROM civilio.form_field_mappings ffm
    WHERE ffm.form = form_type
      AND ffm.field ~ field_pattern
    LIMIT 1
    INTO table_name;

    IF table_name IS NULL THEN
        RAISE EXCEPTION 'Field is not mapped: % for form type %', field_pattern, form_type;
    end if;
    schema_name := form_type::TEXT;
    IF table_name IN ('data_personnel', 'data_statistiques', 'data_pieces', 'data_villages') THEN
        personnel_lookup_query := FORMAT(
                'SELECT sq._index FROM (SELECT _index, ROW_NUMBER() OVER (ORDER BY _index) AS rn FROM %I.%I dp WHERE dp._parent_index = %L::INTEGER) AS sq WHERE sq.rn = %L;',
                schema_name,
                table_name,
                submission_index,
                ordinal
            );
        EXECUTE personnel_lookup_query INTO ref_index;

        IF ref_index IS NULL THEN
            RAISE NOTICE 'Personnel record not found at position %', ordinal;
            RETURN;
        end if;
    ELSIF table_name = 'data' THEN
        ref_index := submission_index;
    end if;

    delete_query := FORMAT(
            'DELETE FROM %I.%I WHERE _index = %L;',
            schema_name,
            table_name,
            ref_index
        );
    EXECUTE delete_query;
END;
$$;