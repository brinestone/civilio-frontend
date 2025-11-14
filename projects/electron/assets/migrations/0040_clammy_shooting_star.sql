CREATE OR REPLACE FUNCTION revisions.get_version_data(
	IN p_form civilio.form_types,
	IN p_index INTEGER,
	IN p_version TEXT DEFAULT NULL
) RETURNS JSONB AS
$$
DECLARE
	_sub_snapshot      JSONB := '{}'::JSONB;
	_main_snapshot     JSONB := '{}'::JSONB;
	_c_snapshot        JSONB;
	_c_delta           revisions.deltas;
	_row_exists        BOOLEAN;
	_version           TEXT  := COALESCE(p_version,
																			 (SELECT revisions.get_record_current_version(p_form, 'data', p_index)));
	_version_timestamp TIMESTAMP;
	_data_array        JSONB := '[]'::JSONB;
	_existing_element  JSONB;
	_element_index     INTEGER;
	_result            JSONB := '{}'::JSONB;
	_mapping           civilio.form_field_mappings;
	_temp_array        JSONB;
	_element_data      JSONB;
	_actual_column     TEXT; -- To handle column name mapping
BEGIN
	RAISE NOTICE 'Starting get_version_data for form %, index %, version %', p_form, p_index, _version;

	EXECUTE FORMAT('SELECT EXISTS(SELECT 1 FROM %I.data WHERE _index = $1)', p_form) USING p_index INTO _row_exists;
	IF NOT _row_exists THEN
		RAISE NOTICE 'Main data does not exist, exiting';
		RETURN NULL;
	end if;

	SELECT changed_at FROM revisions.deltas WHERE hash = _version LIMIT 1 INTO _version_timestamp;

	FOR _c_delta IN SELECT *
									FROM revisions.deltas
									WHERE submission_index = p_index
										AND form = p_form
										AND changed_at <= _version_timestamp
										AND hash = _version
									ORDER BY changed_at
		LOOP
			-- Process sub-table deltas (not 'data' table)
			IF _c_delta.table_name != 'data' THEN
				_data_array := COALESCE(_sub_snapshot -> _c_delta.table_name, '[]'::JSONB);

				_element_index := -1;
				FOR i IN 0..(jsonb_array_length(_data_array) - 1)
					LOOP
						IF (_data_array -> i) -> '_index' = to_jsonb(_c_delta.index) THEN
							_element_index := i;
							EXIT;
						END IF;
					END LOOP;

				IF _c_delta.op = 'INSERT' THEN
					_c_snapshot := _c_delta.delta_data;
					_data_array := _data_array || _c_snapshot;

				ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
					IF _element_index >= 0 THEN
						_existing_element := _data_array -> _element_index;
						_c_snapshot := _existing_element || _c_delta.delta_data;
						_data_array := jsonb_set(_data_array, ARRAY [_element_index::TEXT], _c_snapshot);
					ELSE
						_c_snapshot := _c_delta.delta_data;
						_data_array := _data_array || _c_snapshot;
					END IF;

				ELSIF _c_delta.op = 'DELETE' THEN
					IF _element_index >= 0 THEN
						_data_array := _data_array - _element_index;
					END IF;
				end if;

				_sub_snapshot := jsonb_set(_sub_snapshot, ARRAY [_c_delta.table_name], _data_array, true);

				-- Process main table deltas ('data' table)
			ELSIF _c_delta.table_name = 'data' THEN
				IF _c_delta.op = 'INSERT' THEN
					_main_snapshot := _c_delta.delta_data;
				ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
					_main_snapshot := _main_snapshot || _c_delta.delta_data;
				ELSIF _c_delta.op = 'DELETE' THEN
					_main_snapshot := '{}'::JSONB;
				end if;
			END IF;
		END LOOP;

	-- Process mappings with column name translation
	FOR _mapping IN SELECT * FROM civilio.form_field_mappings WHERE form = p_form
		LOOP
		-- Try to map the db_column to actual column names in your data
		-- You may need to customize this mapping logic based on your naming conventions
			_actual_column := _mapping.db_column;

			-- Example: if your mappings use "category" but data uses "q2_5_cat_cec"
			-- You could add translation logic here

			IF _mapping.db_table = 'data' THEN
				_result := jsonb_set(_result, ARRAY[_mapping.field],
														 COALESCE(_main_snapshot -> _actual_column, 'null'::jsonb));
			ELSE
				_temp_array := '[]'::JSONB;

				IF _sub_snapshot ? _mapping.db_table THEN
					FOR _element_data IN SELECT * FROM jsonb_array_elements(_sub_snapshot -> _mapping.db_table)
						LOOP
							_temp_array := _temp_array || COALESCE(_element_data -> _actual_column, 'null'::jsonb);
						END LOOP;
				END IF;

				_result := jsonb_set(_result, ARRAY[_mapping.field], _temp_array);
			END IF;
		END LOOP;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE EXCEPTION 'Error in get_version_data: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
end;
$$ LANGUAGE plpgsql;
