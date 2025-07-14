CREATE OR REPLACE FUNCTION civilio.func_create_fosa_record()
    RETURNS INTEGER AS
$$
DECLARE
    submission_id INTEGER;
BEGIN
    INSERT INTO fosa.data(_index, _id)
    VALUES (nextval('civilio.fosa_index_seq'), nextval('civilio.fosa_id_seq'))
    RETURNING _id INTO submission_id;
    RETURN submission_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION civilio.func_create_fosa_personnel_record(
    IN parent_id INTEGER,
    IN parent_table TEXT DEFAULT 'FOSA OUEST'
) RETURNS INTEGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    new_index INTEGER := nextval('civilio.fosa_personnel_index_seq');
BEGIN
    INSERT INTO fosa.data_personnel(_index, _parent_index, _submission_id, _parent_table_name)
    VALUES (new_index, (SELECT df._index FROM fosa.data df WHERE _id = parent_id), parent_id, parent_table)
    RETURNING _index INTO new_index;
    RETURN new_index;
END;
$$;