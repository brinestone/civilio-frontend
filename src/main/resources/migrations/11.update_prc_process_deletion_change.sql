drop procedure if exists civilio.proc_process_deletion_change(text, text, integer, civilio.form_types);

create procedure civilio.proc_process_deletion_change(IN submission_id text, IN field_pattern text, IN ordinal integer,
                                                      IN form_type civilio.form_types)
    language plpgsql
as
$$
DECLARE
    table_name      TEXT;
    personnel_index INTEGER;
BEGIN

    IF (submission_id IS NULL OR submission_id = '') THEN
        RAISE EXCEPTION 'Invalid submission ID: "%"', submission_id;
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

    IF table_name = 'data_personnel' THEN
        SELECT sq._index
        FROM (SELECT _index, ROW_NUMBER() OVER (ORDER BY _index) AS rn
              FROM public.data_personnel dp
              WHERE dp._submission_id = submission_id::INTEGER) as sq
        WHERE sq.rn = ordinal
        INTO personnel_index;

        IF personnel_index IS NULL THEN
            RETURN;
        end if;

        DELETE FROM public.data_personnel WHERE _index = personnel_index;
    ELSIF table_name = 'data_chefferie_personnel' THEN
        SELECT sq._index
        FROM (SELECT _index, ROW_NUMBER() OVER (ORDER BY _index) AS rn
              FROM public.data_chefferie_personnel dcp
              WHERE dcp._submission_id = submission_id::INTEGER) AS sq
        WHERE sq.rn = ordinal
        INTO personnel_index;

        IF personnel_index IS NULL THEN
            RETURN;
        end if;

        DELETE FROM public.data_chefferie_personnel WHERE _index = personnel_index;
    ELSIF table_name = 'data_fosa' THEN
        DELETE FROM public.data_fosa df WHERE df._id = submission_id::INTEGER;
    ELSIF table_name = 'data_chefferie' THEN
        DELETE FROM public.data_chefferie dc WHERE dc._id = submission_id::INTEGER;
    END IF;
END;
$$;