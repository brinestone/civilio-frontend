create or replace function revisions.func_log_submission_state(p_index integer, p_form civilio.form_types) returns text
	language plpgsql
as
$$
DECLARE
	_new_hash            TEXT;
	_sub_form_tables     TEXT[];
	_sub_form_table_name TEXT;
	_sql                 TEXT;
	_main_data           JSONB;
	_sub_form_data       JSONB;
	__sub_form_data      JSONB;
	_rows_changed        INTEGER;
BEGIN
	RAISE NOTICE 'Disabling user triggers on table: revisions.deltas';
	ALTER TABLE revisions.deltas
		DISABLE TRIGGER USER;

	RAISE NOTICE 'Checking whether submission for form: % exists with index: %', p_form, p_index;

	_sql := FORMAT('SELECT row_to_json(dd)::JSONB FROM (SELECT * FROM %I.data WHERE _index = $1) dd', p_form::TEXT);
	EXECUTE _sql USING p_index INTO _main_data;

	IF _main_data IS NULL OR _main_data = '{}'::JSONB THEN
		RAISE NOTICE 'Submission with index: % does not exist for form: %, re-enabling user triggers on table: revisions.deltas', p_index, p_form;
		ALTER TABLE revisions.deltas
			ENABLE TRIGGER USER;
		RETURN NULL;
	end if;

	_main_data := _main_data - '_version_';
	_new_hash := MD5(NOW()::TEXT || '.' || _main_data::TEXT || '.' ||
									 COALESCE(_main_data ->> '_submitted_by', SESSION_USER)::TEXT || '.' ||
									 'INSERT');
	RAISE NOTICE 'Computed version hash to %, saving delta for submission: % in table %', _new_hash, p_index, 'data';

	INSERT INTO revisions.deltas(changed_at, submission_index, index, form, table_name, delta_data, changed_by, op,
															 parent, hash, sync_status)
	VALUES (COALESCE((_main_data ->> '_submission_time')::TIMESTAMP, NOW()),
					p_index,
					p_index,
					p_form,
					'data',
					_main_data,
					(_main_data ->> '_submitted_by'),
					'INSERT',
					NULL,
					_new_hash,
					'synced')
	ON CONFLICT (submission_index,hash,form,table_name, index) DO NOTHING;
	GET DIAGNOSTICS _rows_changed = ROW_COUNT;

	IF _rows_changed > 0 THEN
		EXECUTE FORMAT('UPDATE %I.data SET _version_ = $1 WHERE _index = $2', p_form) USING _new_hash, p_index;
	end if;

	RAISE NOTICE 'Finding sub-form data for index: % in form: %', p_index, p_form;

	FOR _sub_form_table_name IN SELECT DISTINCT t.table_name::TEXT
															FROM information_schema.tables t
															WHERE t.table_schema = p_form::TEXT
																AND t.table_name <> 'data'
		LOOP
			RAISE NOTICE 'Disabling user triggers on table %.%', p_form, _sub_form_table_name;
			EXECUTE FORMAT('ALTER TABLE %I.%I DISABLE TRIGGER USER', p_form, _sub_form_table_name);
			_sql := FORMAT('SELECT row_to_json(tt)::JSONB FROM (SELECT * FROM %I.%I WHERE _parent_index = $1) tt',
										 p_form, _sub_form_table_name);
			FOR _sub_form_data IN EXECUTE _sql USING p_index
				LOOP
					__sub_form_data := _sub_form_data - '_submission_version';
					INSERT INTO revisions.deltas(changed_at, submission_index, index, form, table_name, delta_data,
																			 changed_by, op,
																			 parent, hash, sync_status)
					VALUES (COALESCE((_main_data ->> '_submission_time')::TIMESTAMP, NOW()),
									p_index,
									(__sub_form_data ->> '_index')::INTEGER,
									p_form,
									_sub_form_table_name,
									__sub_form_data,
									(_main_data ->> '_submitted_by')::TEXT,
									'INSERT',
									NULL,
									_new_hash,
									'synced')
					ON CONFLICT (submission_index,hash,form,table_name, index) DO NOTHING;
					IF _rows_changed > 0 THEN
						EXECUTE FORMAT('UPDATE %I.%I SET _submission_version = $1 WHERE _parent_index = $2', p_form,
													 _sub_form_table_name) USING _new_hash, p_index;
					end if;
				end loop;
			RAISE NOTICE 'Re-enabling user triggers on table %.%', p_form, _sub_form_table_name;
			EXECUTE FORMAT('ALTER TABLE %I.%I ENABLE TRIGGER USER', p_form, _sub_form_table_name);
		end loop;

	RAISE NOTICE 'Enabling user triggers on table revisions.deltas';
	ALTER TABLE revisions.deltas
		ENABLE TRIGGER USER;
	RETURN _new_hash;
EXCEPTION
	WHEN OTHERS THEN
		RAISE NOTICE 'Execution failed: %', SQLERRM;
		ALTER TABLE revisions.deltas
			ENABLE TRIGGER USER;
		IF _sub_form_tables IS NOT NULL THEN
			FOREACH _sub_form_table_name IN ARRAY _sub_form_tables
				LOOP
					EXECUTE FORMAT('ALTER TABLE %I.%I ENABLE TRIGGER USER', p_form, _sub_form_table_name);
				end loop;
		end if;
		RAISE EXCEPTION USING MESSAGE = SQLERRM, HINT = SQLSTATE;
end;
$$;

