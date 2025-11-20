create or replace function civilio.func_log_delta_changes() returns trigger
	language plpgsql
as
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
	_submission_index := COALESCE(
		(new_data ->> '_index')::INTEGER,
		(old_data ->> '_index')::INTEGER,
		(new_data ->> '_parent_index')::INTEGER,
		(old_data ->> '_parent_index')::INTEGER
											 );

	_record_index := COALESCE(
		(new_data ->> '_index')::INTEGER,
		(old_data ->> '_index')::INTEGER
									 );

	IF TG_OP = 'INSERT' THEN
		old_store := ''::hstore;
		new_store := hstore(NEW.*);
		diff_store := new_store;
	ELSEIF TG_OP = 'UPDATE' THEN
		old_store := hstore(OLD.*);
		new_store := hstore(NEW.*);
		diff_store := (old_store - new_store) || (new_store - old_store);
	ELSEIF TG_OP = 'DELETE' THEN
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

				IF (new_store -> k) IS NOT NULL THEN
					delta_json := delta_json || jsonb_build_object(k, to_jsonb(new_store -> k));
				ELSIF (new_store -> k) IS NULL AND (old_store -> k) IS NOT NULL THEN -- The value at k changed from a non-null value to a null value.
					delta_json := delta_json || jsonb_build_object(k, 'null'::JSONB);
				end if;
			end loop;
	end if;

	IF delta_json = '{}'::JSONB AND TG_OP = 'UPDATE' THEN
		RETURN COALESCE(NEW, OLD);
	end if;

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
					NEW._index,
					form_type,
					tg_table_name::text,
					delta_json,
					actor,
					tg_op::revisions.change_op,
					_parent_version,
					_now,
					NULLIF(current_setting('session.notes'), ''))
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
		end if;
		RAISE NOTICE 'Setting version to: %', _new_version;
	end if;
	return COALESCE(NEW, OLD);
END;
$$;
