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
	_version           TEXT;
	_version_timestamp TIMESTAMP;
	_result            JSONB := '{}'::JSONB;

	-- Optimization variables
	_element_indices   JSONB := '{}'::JSONB;
	_cached_index      INTEGER;
	_table_array       JSONB;
BEGIN
	RAISE NOTICE 'Starting get_version_data for form %, index %, version %', p_form, p_index, p_version;

	-- Get version once and reuse
	_version := COALESCE(p_version, revisions.get_record_current_version(p_form, 'data', p_index));

	-- Check existence and get timestamp in single query
	EXECUTE FORMAT(
		'SELECT EXISTS(SELECT 1 FROM %I.data WHERE _index = $1), changed_at FROM revisions.deltas WHERE hash = $2 LIMIT 1;',
		p_form) USING p_index, _version INTO _row_exists, _version_timestamp;

	IF NOT _row_exists THEN
		RAISE NOTICE 'Main data does not exist, exiting';
		RETURN '{}'::JSONB;
	end if;

	-- Optimized delta processing with caching
	FOR _c_delta IN
		SELECT * FROM revisions.deltas
		WHERE submission_index = p_index
			AND form = p_form
			AND changed_at <= _version_timestamp
			AND hash = _version
		ORDER BY changed_at
		LOOP
			IF _c_delta.table_name != 'data' THEN
				-- Get or create the table array
				_table_array := COALESCE(_sub_snapshot -> _c_delta.table_name, '[]'::JSONB);

				-- Use cached indices to avoid repeated array scanning
				_cached_index := COALESCE((_element_indices -> _c_delta.table_name ->> _c_delta.index::text)::int, -1);

				IF _cached_index = -1 THEN
					-- Find index only if not cached
					_cached_index := -1;
					FOR i IN 0..(jsonb_array_length(_table_array) - 1) LOOP
							IF (_table_array -> i) -> '_index' = to_jsonb(_c_delta.index) THEN
								_cached_index := i;
								EXIT;
							END IF;
						END LOOP;

					-- Cache the result
					_element_indices := jsonb_set(
						_element_indices,
						ARRAY[_c_delta.table_name, _c_delta.index::text],
						to_jsonb(COALESCE(_cached_index, -1)),
						true
															);
				END IF;

				-- Process the operation
				IF _c_delta.op = 'INSERT' THEN
					_c_snapshot := _c_delta.delta_data;
					_table_array := _table_array || _c_snapshot;

				ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
					IF _cached_index >= 0 THEN
						_c_snapshot := (_table_array -> _cached_index) || _c_delta.delta_data;
						_table_array := jsonb_set(_table_array, ARRAY[_cached_index::TEXT], _c_snapshot);
					ELSE
						_c_snapshot := _c_delta.delta_data;
						_table_array := _table_array || _c_snapshot;
					END IF;

				ELSIF _c_delta.op = 'DELETE' THEN
					IF _cached_index >= 0 THEN
						_table_array := _table_array - _cached_index;
					END IF;
				END IF;

				-- Update the sub_snapshot
				_sub_snapshot := jsonb_set(_sub_snapshot, ARRAY[_c_delta.table_name], _table_array, true);

				-- Process main table deltas
			ELSIF _c_delta.table_name = 'data' THEN
				IF _c_delta.op = 'INSERT' THEN
					_main_snapshot := _c_delta.delta_data;
				ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
					_main_snapshot := _main_snapshot || _c_delta.delta_data;
				ELSIF _c_delta.op = 'DELETE' THEN
					_main_snapshot := '{}'::JSONB;
				END IF;
			END IF;
		END LOOP;

	-- Optimized mapping processing using bulk operations
	WITH mapping_data AS (
		SELECT
			m.field,
			CASE
				WHEN m.db_table = 'data' THEN
					COALESCE(_main_snapshot -> m.db_column, 'null'::jsonb)
				ELSE
					COALESCE(
						(
							SELECT jsonb_agg(COALESCE(elem -> m.db_column, 'null'::jsonb))
							FROM jsonb_array_elements(COALESCE(_sub_snapshot -> m.db_table, '[]'::jsonb)) AS elem
						),
						'[]'::jsonb
					)
				END as field_value
		FROM civilio.form_field_mappings m
		WHERE m.form = p_form
	)
	SELECT jsonb_object_agg(field, field_value)
	INTO _result
	FROM mapping_data;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE EXCEPTION 'Error in get_version_data: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
end;
$$ LANGUAGE plpgsql;
