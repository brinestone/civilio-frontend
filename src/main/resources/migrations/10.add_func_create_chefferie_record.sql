CREATE OR REPLACE FUNCTION civilio.func_create_chefferie_record() RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index INTEGER;
BEGIN
    INSERT INTO chefferie.data (_index, _id)
    VALUES (nextval('civilio.chefferie_index_seq'), nextval('civilio.chefferie_id_seq'))
    RETURNING _index INTO new_index;
    RETURN new_index;
END;
$$;
