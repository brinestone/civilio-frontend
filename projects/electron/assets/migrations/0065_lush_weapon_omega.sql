drop function revisions.get_version_data(civilio.form_types, integer, text, text);

create function revisions.get_version_data(p_form civilio.form_types, p_index integer, p_table text,
																					 p_version text DEFAULT NULL::text) returns jsonb
	language plpgsql
as
$$
DECLARE
	_snapshot          JSONB := '{}'::JSONB;
	_c_delta           revisions.deltas;
	_row_exists        BOOLEAN;
	_version           TEXT;
	_version_timestamp TIMESTAMP;
	_result            JSONB := '{}'::JSONB;
BEGIN
	RAISE NOTICE 'Starting get_version_data for form %, index %, version %, table %', p_form, p_index, p_version, p_table;

	-- Get version once and reuse
	_version := COALESCE(p_version, revisions.get_record_current_version(p_form, p_index));

	-- Check existence and get timestamp in single query
	EXECUTE FORMAT(
		'SELECT EXISTS(SELECT 1 FROM %I.data WHERE _index = $1), changed_at FROM revisions.deltas WHERE hash = $2 LIMIT 1;',
		p_form) USING p_index, _version INTO _row_exists, _version_timestamp;

	IF NOT _row_exists THEN
		RAISE EXCEPTION 'Main data does not exist';
	end if;

	FOR _c_delta IN SELECT *
									FROM revisions.deltas
									WHERE submission_index = p_index
										AND form = p_form
										AND table_name = p_table
										AND (changed_at, hash) <= (_version_timestamp, _version)
									ORDER BY changed_at, table_name, op, parent
		LOOP
			IF _c_delta.op = 'INSERT' THEN
				_snapshot := _c_delta.delta_data;
			ELSIF _c_delta.op IN ('UPDATE', 'REVERT') THEN
				_snapshot := _snapshot || COALESCE(_c_delta.delta_data, '{}'::JSONB);
			ELSIF _c_delta.op = 'DELETE' THEN
				_snapshot := NULL;
			end if;

			IF _c_delta.hash = _version THEN
				EXIT;
			end if;
		end loop;

	WITH mapping_data AS (SELECT m.field,
															 COALESCE(_snapshot -> m.db_column, 'null'::JSONB) as field_value
												FROM civilio.form_field_mappings m
												WHERE m.form = p_form
													AND m.db_table = p_table)
	SELECT jsonb_object_agg(field, field_value)
	INTO _result
	FROM mapping_data;
	RETURN _result;
end;
$$;
