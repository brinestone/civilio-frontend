CREATE EXTENSION IF NOT EXISTS hstore;
CREATE OR REPLACE FUNCTION "civilio"."func_log_delta_changes"()
	RETURNS TRIGGER AS
$$
DECLARE
	old_store         hstore;
	new_store         hstore;
	diff_store        hstore;
	diff_json         JSONB;
	_submission_index INTEGER;
	_new_version      TEXT;
	k                 TEXT;
	form_type         civilio.form_types;
	actor             TEXT;
	old_val           jsonb;
	new_val           jsonb;
BEGIN
	actor := COALESCE(
		current_setting('app.user_id', true),
		current_setting('actor', true),
		NEW._submitted_by,
		SESSION_USER
					 );

	form_type := TG_TABLE_SCHEMA;

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

	diff_json := '{}'::JSONB;

	FOR k IN SELECT skeys(diff_store)
		LOOP
			CONTINUE WHEN k IN ('_index', '_parent_index', 'created_at', 'updated_at', '_submission_time',
													'_submission_version');

			old_val := to_jsonb(old_store -> k);
			new_val := to_jsonb(new_store -> k);

			diff_json := diff_json || jsonb_build_object(k,
																									 json_build_object(
																										 'old',
																										 CASE
																											 WHEN TG_OP IN ('UPDATE', 'DELETE') THEN old_val
																											 ELSE NULL END,
																										 'new',
																										 CASE
																											 WHEN TG_OP IN ('INSERT', 'UPDATE') THEN new_val
																											 ELSE NULL END
																									 ));
		END LOOP;
	IF diff_json = '{}'::JSONB AND TG_OP <> 'DELETE' THEN
		RETURN COALESCE(NEW, OLD);
	END IF;

	IF tg_table_name = 'data' THEN
		_submission_index := NEW._index;
	ELSE
		_submission_index := NEW._parent_index;
	END IF;
	INSERT INTO "revisions"."deltas"(submission_index, index, form, table_name, delta_data, changed_by, op,
																	 parent)
	VALUES (_submission_index,
					NEW._index,
					tg_table_schema::civilio.form_types,
					tg_table_name::text,
					diff_json,
					actor,
					tg_op::revisions.change_op,
					OLD._version_)
	ON CONFLICT (hash, submission_index, index, form, table_name) DO NOTHING
	RETURNING hash INTO _new_version;
--     RAISE NOTICE 'old._version_ = %, new._version_ = %, _new_version=%', old._version_, new._version_, _new_version;

	IF tg_op IN ('INSERT', 'UPDATE') THEN
		IF tg_table_name = 'data' THEN
			NEW._version_ := _new_version;
		ELSE
			NEW._submission_version := _new_version;
		end if;
	end if;
	return COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
