CREATE OR REPLACE FUNCTION civilio.func_log_delta_changes() RETURNS TRIGGER
	LANGUAGE plpgsql
AS
$$
DECLARE
	old_store         hstore;
	new_store         hstore;
	diff_store        hstore;
	delta_json        JSONB;
	_submission_index INTEGER;
	_record_index     INTEGER;
	_new_version      TEXT;
	_parent_version   TEXT;
	k                 TEXT;
	form_type         civilio.form_types;
	actor             TEXT;
	new_data          JSONB;
	old_data          JSONB;
	_now              TIMESTAMP;
BEGIN
	new_data := TO_JSONB(NEW);
	old_data := TO_JSONB(OLD);
	actor := COALESCE(
		current_setting('session.actor', true),
		NULLIF(new_data ->> '_submitted_by', ''),
		NULLIF(new_data ->> '_submission_submitted_by', ''),
		NULLIF(old_data ->> '_submitted_by', ''),
		NULLIF(old_data ->> '_submission_submitted_by', ''),
		SESSION_USER
					 );

	form_type := TG_TABLE_SCHEMA::civilio.form_types;
	_parent_version := COALESCE(
		NULLIF(current_setting('session.parent_version', true), ''),
		old_data ->> '_version_',
		old_data ->> '_submission_version',
		new_data ->> '_version_',
		new_data ->> '_submission_version'
										 );
	_submission_index := CASE
												 WHEN TG_TABLE_NAME = 'data' THEN COALESCE(
													 (new_data ->> '_index')::INTEGER,
													 (old_data ->> '_index')::INTEGER
																													)
												 ELSE COALESCE(
													 (new_data ->> '_parent_index')::INTEGER,
													 (old_data ->> '_parent_index')::INTEGER
															) END;

	_record_index := COALESCE(
		(new_data ->> '_index')::INTEGER,
		(old_data ->> '_index')::INTEGER
									 );

	IF TG_OP = 'INSERT' THEN
		old_store := ''::hstore;
		new_store := hstore(NEW.*);
		diff_store := new_store;
	ELSIF TG_OP = 'UPDATE' THEN
		-- Default snapshot comparison:
		old_store := hstore(OLD.*);
		new_store := hstore(NEW.*);

		IF NULLIF(_parent_version, '') IS NOT NULL THEN
			DECLARE
				parent_data           JSONB;
				_found_record_index   INTEGER := -1; -- Renamed for clarity
				-- _index_column_map_key: The field name corresponding to the _index db_column
				_index_column_map_key TEXT    := (SELECT field
																					FROM civilio.form_field_mappings
																					WHERE db_table = TG_TABLE_NAME::TEXT
																						AND form = form_type
																						AND db_column = '_index'
																					LIMIT 1);
				_row_data             JSONB   := '{}'::JSONB;
				_mapping              civilio.form_field_mappings;
			BEGIN
				-- Guard against missing index mapping
				IF tg_table_name != 'data' AND _index_column_map_key IS NULL THEN
					RAISE EXCEPTION 'form: % table: % does not have an identifier key mapping for "_index"', form_type::TEXT, TG_TABLE_NAME;
				END IF;

				-- Retrieve the full version snapshot (Object for 'data', Column-major Array for sub-tables)
				parent_data :=
					revisions.get_version_data(form_type, _submission_index, tg_table_name::TEXT,
																		 _parent_version, FALSE);
				RAISE NOTICE 'parent_data = %', parent_data::TEXT;
				IF TG_TABLE_NAME = 'data' THEN
					-- Main Table: parent_data is the object, use it directly
					IF parent_data IS NOT NULL AND jsonb_typeof(parent_data) = 'object' THEN
						RAISE NOTICE 'parent_data: %', parent_data::TEXT;
						old_store := jsonb_to_hstore(parent_data);
					ELSE
						RAISE WARNING 'Main table version reconstruction failed for parent version %. Falling back to OLD.*.', _parent_version;
					END IF;
				ELSE
					-- Sub-Table Logic: Find the row and reconstruct it
					IF parent_data IS NOT NULL AND jsonb_typeof(parent_data) = 'object' THEN
						-- 1. Find the array index (_found_record_index) corresponding to OLD._index
						FOR i IN 0..(jsonb_array_length(parent_data -> '_index') - 1)
							LOOP
								-- Compare the column array element (record ID) with the OLD row's index
								IF (parent_data -> '_index') ->> i = OLD._index::TEXT THEN
									_found_record_index := i;
									EXIT;
								END IF;
							END LOOP;

						-- 2. Reconstruct the single row if found
						IF _found_record_index >= 0 THEN
							FOR _mapping IN SELECT *
															FROM civilio.form_field_mappings m
															WHERE m.db_table = TG_TABLE_NAME
																AND m.form = form_type
								LOOP
									-- Build the row: {db_column: (parent_data -> field)[_record_index]}
									_row_data := _row_data || jsonb_build_object(
										_mapping.db_column,
										(parent_data -> _mapping.db_column) -> _found_record_index
																						);
								END LOOP;

							-- 3. Set old_store to the reconstructed row for comparison
							old_store := jsonb_to_hstore(_row_data);
							RAISE NOTICE 'Sub-table % V2V delta performed against parent hash %', TG_TABLE_NAME, _parent_version;
						ELSE
							RAISE WARNING 'Record index % not found in parent version % sub-table. Falling back to OLD.*.', OLD._index, _parent_version;
						END IF;
					ELSE
						RAISE WARNING 'Sub-table version reconstruction failed (not an object) for parent version %. Falling back to OLD.*.', _parent_version;
					END IF;
				END IF;
			END;
		END IF;

		-- The final diff is calculated using the (potentially version-reconstructed) old_store
		diff_store := (old_store - new_store) || (new_store - old_store);
	ELSIF TG_OP = 'DELETE' THEN
		old_store := hstore(OLD.*);
		new_store := ''::hstore;
		diff_store := old_store;
	END IF;

	delta_json := '{}'::JSONB;
	IF TG_OP IN ('UPDATE', 'INSERT') THEN
		FOR k IN SELECT skeys(diff_store)
			LOOP
				CONTINUE WHEN k IN (
														'_index', '_parent_index', '_created_at', '_updated_at',
														'_submission_time', '_version_', '_submission_version',
														'_submitted_by', '_submission_submitted_by'
					);

				delta_json := delta_json || jsonb_build_object(k, to_jsonb(diff_store -> k));
			END LOOP;
	END IF;

	IF delta_json = '{}'::JSONB AND TG_OP = 'UPDATE' THEN
		RETURN COALESCE(NEW, OLD);
	END IF;

	_now := NOW();
	_new_version := COALESCE(
		NULLIF(current_setting('session.working_version', true), ''),
		MD5(
			COALESCE(delta_json::TEXT, '{}') || '|' ||
			_now::TEXT || '|' ||
			_submission_index::TEXT || '|' ||
			_record_index::TEXT || '|' ||
			TG_TABLE_NAME || '|' ||
			TG_TABLE_SCHEMA || '|' ||
			COALESCE(actor, 'system') || '|' ||
			TG_OP || '|' ||
			COALESCE(_parent_version, 'v0')
		)
									);

	INSERT INTO "revisions"."deltas"(hash, submission_index, index, form, table_name, delta_data, changed_by, op,
																	 parent, changed_at, change_notes)
	VALUES (_new_version,
					_submission_index,
					_record_index,
					form_type,
					tg_table_name::text,
					delta_json,
					actor,
					tg_op::revisions.change_op,
					_parent_version,
					_now,
					NULLIF(current_setting('session.notes', true), ''))
	ON CONFLICT(hash, submission_index, index,form, table_name) DO UPDATE
		SET delta_data = EXCLUDED.delta_data,
				op         = EXCLUDED.op,
				changed_at = EXCLUDED.changed_at,
				changed_by = EXCLUDED.changed_by,
				parent     = EXCLUDED.parent;

	IF tg_op IN ('INSERT', 'UPDATE') THEN
		IF tg_table_name = 'data' THEN
			NEW._version_ := _new_version;
		ELSE
			NEW._submission_version := _new_version;
		END IF;
		RAISE NOTICE 'Setting version to: %', _new_version;
	END IF;
	RETURN COALESCE(NEW, OLD);
END;
$$;
