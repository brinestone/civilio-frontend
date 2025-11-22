CREATE OR REPLACE PROCEDURE civilio.proc_delete_submission(
	IN p_form civilio.form_types,
	IN p_index INTEGER,
	IN p_actor TEXT,
	IN p_new_version TEXT,
	IN p_change_notes TEXT
) AS
$$
DECLARE
	_delta     JSONB;
	_now       TIMESTAMP := NOW();
	_data      JSONB;
	_sql       TEXT;
	_sub_table TEXT;
BEGIN
	FOR _sub_table IN SELECT t.table_name::TEXT
										FROM information_schema.tables t
										WHERE t.table_schema = p_form::TEXT
											AND t.table_name <> 'data'
		LOOP
			_sql := FORMAT('SELECT to_jsonb(t) FROM (SELECT * FROM %I.%I d WHERE d._parent_index = $1) t', p_form::TEXT,
										 _sub_table);
			FOR _data IN EXECUTE _sql USING p_index
				LOOP
					INSERT INTO revisions.deltas(submission_index, index, form, table_name, delta_data, changed_by, op,
																			 parent, hash, change_notes, changed_at)
					VALUES (p_index,
									_data ->> '_index',
									p_form,
									_sub_table,
									_data - 'version',
									p_actor, 'DELETE',
									_data ->> 'version',
									p_new_version,
									p_change_notes,
									_now);
				end loop;
		end loop;

	_sql := FORMAT('SELECT to_jsonb(t) FROM (SELECT * FROM %I.data d WHERE d._index = $1) t', p_form::TEXT);
	EXECUTE _sql USING p_index INTO _data;
	IF _data IS NOT NULL THEN
		INSERT INTO revisions.deltas(submission_index, index, form, table_name, changed_at, delta_data, changed_by, op,
																 parent, hash, change_notes)
		VALUES (p_index,
						p_index,
						p_form,
						'data',
						_now,
						_data - 'version',
						p_actor,
						'DELETE',
						_data ->> 'version',
						p_new_version,
						p_change_notes);
		EXECUTE FORMAT('DELETE FROM %I.data WHERE _index = $1', p_form::TEXT) USING p_index;
	end if;
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE EXCEPTION USING MESSAGE = SQLERRM;

end;
$$ LANGUAGE plpgsql;
