CREATE OR REPLACE FUNCTION "civilio"."func_log_delta_changes"()
	RETURNS TRIGGER AS
$$
DECLARE
	old_store         hstore;
	new_store         hstore;
	diff_store        hstore;
	delta_json        JSONB;
	_submission_index INTEGER;
	_new_version      TEXT;
	_parent_version   TEXT;
	k                 TEXT;
	form_type         civilio.form_types;
	actor             TEXT;
BEGIN
	actor := COALESCE(
		current_setting('app.user_id', true),
		current_setting('actor', true),
		NEW._submitted_by,
		SESSION_USER
					 );

	form_type := TG_TABLE_SCHEMA;

	IF TG_TABLE_NAME = 'data' THEN
		_parent_version := COALESCE(NEW._version_, OLD._version_);
		_submission_index := COALESCE(NEW._index, OLD._index);
	ELSE
		_parent_version := COALESCE(NEW._submission_version, OLD._submission_version);
		_submission_index := COALESCE(NEW._parent_index, OLD._parent_index);
	end if;

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
				CONTINUE WHEN k IN ('_index', '_parent_index', '_created_at', '_submission_time', '_version_');

				IF (new_store -> k) IS NOT NULL THEN
					delta_json := delta_json || jsonb_build_object(k, to_jsonb(new_store -> k));
				end if;
			end loop;
	end if;

	INSERT INTO "revisions"."deltas"(submission_index, index, form, table_name, delta_data, changed_by, op,
																	 parent)
	VALUES (_submission_index,
					NEW._index,
					tg_table_schema::civilio.form_types,
					tg_table_name::text,
					delta_json,
					actor,
					tg_op::revisions.change_op,
					_parent_version)
	ON CONFLICT (hash, submission_index, index, form, table_name) DO NOTHING
	RETURNING hash INTO _new_version;
--     RAISE NOTICE 'old._version_ = %, new._version_ = %, _new_version=%', old._version_, new._version_, _new_version;

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
$$ LANGUAGE plpgsql;
