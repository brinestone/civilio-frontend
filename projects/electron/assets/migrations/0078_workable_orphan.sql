DROP FUNCTION IF EXISTS revisions.get_version_data(TEXT, INTEGER, TEXT);
create or replace function revisions.get_version_data(
	IN p_form civilio.form_types,
	IN p_index integer,
	IN p_table text,
	IN p_version text DEFAULT NULL::text,
	IN p_use_mappings BOOLEAN DEFAULT true
) returns jsonb
	language plpgsql
as
$$
DECLARE
	_snapshot          JSONB   := '{}'::JSONB;
	_c_delta           revisions.deltas;
	_version           TEXT;
	_version_timestamp TIMESTAMP;
	_result            JSONB   := '{}'::JSONB;
	_is_sub_table      BOOLEAN := p_table != 'data';
	_table_array       JSONB;
	_record_index      INTEGER;
	_cached_index      INTEGER;
	_element_indices   JSONB   := '{}'::JSONB;
BEGIN
	RAISE NOTICE 'Starting get_version_data for form %, index %, version %, table %', p_form, p_index, p_version, p_table;
	_snapshot := CASE WHEN _is_sub_table THEN '[]'::JSONB ELSE '{}'::JSONB END;
	_version := COALESCE(p_version, revisions.get_record_current_version(p_form, p_index));

	RAISE NOTICE 'Resolved version: %', _version;

	-- --- START FIX ---
	-- 1. Get the changed_at timestamp for the specific version hash *and* the target table (p_table).
	SELECT changed_at
	INTO _version_timestamp
	FROM revisions.deltas
	WHERE hash = _version
--       AND table_name = p_table
		AND submission_index = p_index
	LIMIT 1;

	-- 2. If no timestamp found, the target delta doesn't exist for this table.
	IF _version_timestamp IS NULL THEN
		RAISE NOTICE 'Target version % for table % does not exist. Returning empty object.', _version, p_table;
		RETURN '{}'::JSONB;
	END IF;
	-- --- END FIX ---

	FOR _c_delta IN SELECT *
									FROM revisions.deltas
									WHERE submission_index = p_index
										AND form = p_form
										AND table_name = p_table
										AND (changed_at, hash) <= (_version_timestamp, _version)
									ORDER BY changed_at, table_name, op, parent
		LOOP
			_record_index := _c_delta.index;
			IF NOT _is_sub_table THEN
				IF _c_delta.op = 'INSERT' THEN
					_snapshot := _c_delta.delta_data;
				ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
					_snapshot := _snapshot || COALESCE(_c_delta.delta_data, '{}'::JSONB);
				ELSIF _c_delta.op = 'DELETE' THEN
					_snapshot := NULL;
				end if;
			ELSE
				_table_array := _snapshot;
				_cached_index := COALESCE((_element_indices -> _record_index::TEXT)::int, -1);

				-- Optimization: Only search for existing index if operation is UPDATE/DELETE
				IF _c_delta.op IN ('UPDATE', 'REVERT', 'DELETE') AND _cached_index = -1 THEN
					FOR i IN 0..(jsonb_array_length(_table_array) - 1)
						LOOP
							IF (_table_array -> i) -> '_index' = to_jsonb(_record_index) THEN
								_cached_index := i;
								EXIT;
							end if;
						end loop;
					-- Update cache ONLY if found
					IF _cached_index >= 0 THEN
						_element_indices := jsonb_set(_element_indices, ARRAY [_record_index::text],
																					to_jsonb(_cached_index), true);
					END IF;
				END IF;


				IF _c_delta.op = 'INSERT' THEN
					-- For INSERT, always append the new record.
					-- We add the current record_index to the delta_data so it is locatable later
					_snapshot := _table_array || (_c_delta.delta_data || jsonb_build_object('_index', _record_index));

					-- Clear/Invalidate the cache entry for this index, as its array position changed
					-- (Though we don't strictly need to do this if we only cache on update/delete)
					-- For simplicity, let's stick to the core append logic.

				ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
					IF _cached_index >= 0 THEN
						_snapshot := jsonb_set(_table_array, ARRAY [_cached_index::TEXT],
																	 (_table_array -> _cached_index) || _c_delta.delta_data, false);
						-- Position did not change, cache remains valid
					ELSE
						-- This should not happen for an UPDATE/REVERT, but if it does, it's an error state.
						-- For robustness, append (treating it as an INSERT of an existing key).
						_snapshot := _table_array || _c_delta.delta_data;
					end if;
				ELSIF _c_delta.op = 'DELETE' THEN
					IF _cached_index >= 0 THEN
						_snapshot := _table_array - _cached_index;
						-- Position changed for all elements after this, invalidate the cache for safety (not strictly needed by current logic, but good practice)
						_element_indices := '{}'::JSONB;
					end if;
				end if;
			end if;

			IF _c_delta.hash = _version AND NOT _is_sub_table THEN
				EXIT;
			end if;
		end loop;

	IF NOT _is_sub_table THEN
		IF p_use_mappings THEN

			WITH mapping_data AS (SELECT m.field,
																	 COALESCE(_snapshot -> m.db_column, 'null'::JSONB) as field_value
														FROM civilio.form_field_mappings m
														WHERE m.form = p_form
															AND m.db_table = p_table)
			SELECT jsonb_object_agg(field, field_value)
			INTO _result
			FROM mapping_data;
		ELSE
			RETURN _snapshot;
		END IF;
	ELSE
		WITH unnested_mapped_data AS (
			-- ... (CTE definition) ...
			SELECT m.field,
						 m.db_column,
						 COALESCE(elem -> m.db_column, 'null'::JSONB) AS field_value,
						 (elem -> '_index')::TEXT                     AS order_key
			FROM jsonb_array_elements(_snapshot) AS elem,
					 civilio.form_field_mappings m
			WHERE m.form = p_form
				AND m.db_table = p_table),
				 column_arrays AS (SELECT field,
																	db_column,
																	jsonb_agg(field_value ORDER BY order_key::INTEGER) AS field_array
													 FROM unnested_mapped_data
													 GROUP BY field, db_column)
		-- 3. Final Aggregation: Use COALESCE to ensure '{}' is returned if column_arrays is empty (no mappings found).
		SELECT COALESCE(jsonb_object_agg(CASE WHEN p_use_mappings THEN field ELSE db_column END, field_array),
										'{}'::JSONB)
		INTO _result
		FROM column_arrays;
	end if;

	RAISE NOTICE '_snapshot: %', _snapshot::TEXT;
	RAISE NOTICE '_result: %', _result::TEXT;
	RETURN _result;
END;
$$;
