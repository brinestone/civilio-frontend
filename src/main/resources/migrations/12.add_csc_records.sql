CREATE OR REPLACE FUNCTION civilio.func_create_csc_village_record(IN parent_index INTEGER, IN parent_table_name TEXT) RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index INTEGER;
BEGIN
    INSERT INTO csc.data_villages(_index, _parent_index, _submission_id, _parent_table_name)
    VALUES (nextval('civilio.csc_villages_seq'), parent_index,
            (SELECT df._id FROM csc.data df WHERE df._index = parent_index), parent_table_name)
    RETURNING _index INTO new_index;
    RETURN new_index;
END;
$$;

CREATE OR REPLACE FUNCTION civilio.func_create_csc_stat_record(IN parent_index INTEGER, IN parent_table_name TEXT) RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index INTEGER;
BEGIN
    INSERT INTO csc.data_statistiques(_index, _parent_index, _submission_id, _parent_table_name)
    VALUES (nextval('civilio.csc_villages_seq'), parent_index,
            (SELECT df._id FROM csc.data df WHERE df._index = parent_index), parent_table_name)
    RETURNING _index INTO new_index;
    RETURN new_index;
end;
$$;

CREATE OR REPLACE FUNCTION civilio.func_create_csc_pieces(IN parent_index INTEGER, parent_table_name TEXT) RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index INTEGER;
BEGIN
    INSERT INTO csc.data_pieces(_index, _parent_index, _submission_id, _parent_table_name)
    VALUES (nextval('civilio.csc_villages_seq'), parent_index,
            (SELECT df._id FROM csc.data df WHERE df._index = parent_index), parent_table_name)
    RETURNING _index INTO new_index;
    RETURN new_index;
END;
$$;

CREATE OR REPLACE FUNCTION civilio.func_create_csc_record() RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index INTEGER;
BEGIN
    INSERT INTO csc.data(_index, _id)
    VALUES (nextval('civilio.csc_index_seq'), nextval('civilio.csc_id_seq')::VARCHAR(20))
    RETURNING _index INTO new_index;
END;
$$;