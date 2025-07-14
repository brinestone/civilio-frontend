create type civilio.form_types AS ENUM ('fosa', 'chefferie', 'csc');
create sequence civilio.fosa_id_seq start with 484119070;
create sequence civilio.fosa_index_seq start with 971;
create sequence civilio.fosa_personnel_index_seq start with 1261;
CREATE SEQUENCE civilio.chefferie_id_seq START WITH 457502754;
CREATE SEQUENCE civilio.chefferie_index_seq START WITH 324;
CREATE SEQUENCE civilio.chefferie_personnel_index_seq START WITH 186;
CREATE SEQUENCE civilio.csc_id_seq START WITH 475016321;
CREATE SEQUENCE civilio.csc_index_seq START WITH 445;
CREATE SEQUENCE civilio.csc_personnel_index_seq START WITH 774;
CREATE SEQUENCE civilio.csc_pieces_index_seq START WITH 543;
CREATE SEQUENCE civilio.csc_statistics_index_seq START WITH 1463;
CREATE SEQUENCE civilio.csc_villages_seq START WITH 2344;

CREATE OR REPLACE FUNCTION civilio.func_create_personnel_record(parent_index INTEGER, IN form_type civilio.form_types,
                                                                IN parent_table_name TEXT) RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index    INTEGER;
    insert_query TEXT;
BEGIN
    insert_query :=
            FORMAT(
                    'INSERT INTO %I.data_personnel (_index, _parent_index, _submission_id, _parent_table_name) VALUES (nextval(''civilio.%s_personnel_index_seq''), %L, (SELECT df._id FROM %I.data df WHERE df._index = %L), %L) RETURNING _index;',
                    form_type::TEXT, form_type::TEXT, parent_index, form_type::TEXT, parent_index, parent_table_name);
    RAISE NOTICE 'Executing personnel info insert query: %', insert_query;
    EXECUTE insert_query INTO new_index;
    RETURN new_index;
end;
$$;

DO
$$
    DECLARE
        columns         JSONB[];
        schema_names    TEXT[] := ARRAY ['csc','chefferie','fosa'];
        _current_schema TEXT;
        _alter_query    TEXT;
        col_spec        JSONB;
        _current_table  TEXT;
        _current_column TEXT;
    BEGIN
        FOREACH _current_schema IN ARRAY schema_names
            LOOP
                RAISE NOTICE 'Processing schema: %', _current_schema;
                columns := '{}';

                SELECT array_agg(json_build_object('column', c.column_name, 'table', c.table_name))
                FROM information_schema.columns c
                WHERE c.table_schema = _current_schema
                  AND c.is_nullable = 'NO'
                  AND c.column_name NOT IN ('_index', '_parent_index', '_id', '_submission_id')
                INTO columns;

                IF columns IS NOT NULL AND array_length(columns, 1) > 0 THEN
                    FOREACH col_spec IN ARRAY columns
                        LOOP
                            BEGIN
                                _current_table := col_spec ->> 'table';
                                _current_column := col_spec ->> 'column';

                                IF _current_table IS NULL OR _current_column IS NULL THEN
                                    RAISE WARNING 'Invalid column specification: %', col_spec;
                                    CONTINUE;
                                END IF;

                                RAISE NOTICE 'Altering %.%.%', _current_schema, _current_table, _current_column;
                                _alter_query := FORMAT(
                                        'ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL;',
                                        _current_schema,
                                        _current_table,
                                        _current_column
                                    );
                                EXECUTE _alter_query;
                            EXCEPTION
                                WHEN OTHERS THEN
                                    RAISE WARNING 'Failed to alter %.%.%: %', _current_schema, _current_table, _current_column, SQLERRM;
                            END;
                        END LOOP;
                ELSE
                    RAISE NOTICE 'No non-nullable columns found in schema % (or all excluded)', _current_schema;
                END IF;
            END LOOP;
    END;
$$;