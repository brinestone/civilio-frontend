create or replace function revisions.get_version_data(p_form civilio.form_types, p_index integer, p_table text,
																											p_version text DEFAULT NULL::text) returns jsonb
	language plpgsql
as
$$
DECLARE
	_snapshot          JSONB   := '{}'::JSONB;
	_c_delta           revisions.deltas;
	_row_exists        BOOLEAN;
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

	SELECT EXISTS (SELECT 1
								 FROM revisions.deltas d
								 where d.table_name = 'data'
									 AND d.op <> 'DELETE'
									 AND d.submission_index = p_index),
				 changed_at
	FROM revisions.deltas
	WHERE hash = _version
		AND table_name = p_table
		AND submission_index = p_index
	LIMIT 1
	INTO _row_exists, _version_timestamp;

	IF NOT _row_exists THEN
		RAISE EXCEPTION 'Target version hash % not found for submission % in table %', _version, p_index, p_table;
	END IF;

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
				IF _cached_index = -1 THEN
					FOR i IN 0..(jsonb_array_length(_table_array) - 1)
						LOOP
							IF (_table_array -> i) -> 'index' = to_jsonb(_record_index) THEN
								_cached_index := i;
								EXIT;
							end if;
						end loop;
					_element_indices := jsonb_set(_element_indices, ARRAY [_record_index::text],
																				to_jsonb(COALESCE(_cached_index, -1)), true);
				end if;

				IF _c_delta.op = 'INSERT' THEN
					_snapshot := _table_array || _c_delta.delta_data;
				ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
					IF _cached_index >= 0 THEN
						_snapshot := jsonb_set(_table_array, ARRAY [_cached_index::TEXT],
																	 (_table_array -> _cached_index) || _c_delta.delta_data, false);
					ELSE
						_snapshot := _table_array || _c_delta.delta_data;
					end if;
				ELSIF _c_delta.op = 'DELETE' THEN
					IF _cached_index >= 0 THEN
						_snapshot := _table_array - _cached_index;
					end if;
				end if;
			end if;

			IF _c_delta.hash = _version THEN
				EXIT;
			end if;
		end loop;

	IF NOT _is_sub_table THEN
		WITH mapping_data AS (SELECT m.field,
																 COALESCE(_snapshot -> m.db_column, 'null'::JSONB) as field_value
													FROM civilio.form_field_mappings m
													WHERE m.form = p_form
														AND m.db_table = p_table)
		SELECT jsonb_object_agg(field, field_value)
		INTO _result
		FROM mapping_data;
	ELSE
		WITH unnested_data AS (
			-- Unnest the final array snapshot
			SELECT elem
			FROM jsonb_array_elements(_snapshot) AS elem),
				 mapped_elements
					 AS (SELECT unnested_data.elem -> '_index'                                               as _index, -- Keep track of the index for stability
											jsonb_object_agg(m.field,
																			 COALESCE(unnested_data.elem -> m.db_column, 'null'::JSONB)) as mapped_record
							 FROM unnested_data,
										civilio.form_field_mappings m
							 WHERE m.form = p_form
								 AND m.db_table = p_table
							 GROUP BY 1, unnested_data.elem)
		-- Aggregate the mapped records back into a final JSONB array
		SELECT jsonb_agg(mapped_record ORDER BY _index)
		INTO _result
		FROM mapped_elements;
	end if;
	RETURN _result;
end;
$$;

