CREATE OR REPLACE PROCEDURE revisions.sync_version(IN p_form civilio.form_types, IN p_index integer, IN p_version text DEFAULT NULL::text)
	language plpgsql
as
$$
DECLARE
	_version TEXT;
	_c_table TEXT;
BEGIN
	_version := COALESCE(
		p_version,
		NULLIF(current_setting('session.working_version', TRUE), ''),
		NULLIF(revisions.get_record_current_version(p_form, p_index), '')
							);
	--     IF _version IS NULL THEN
--         EXECUTE FORMAT('SELECT _version_ FROM %I.data WHERE _index = $1', p_form) USING p_index INTO _version;
--     end if;

	IF _version IS NULL THEN
		RAISE EXCEPTION 'could not current version for submission % in form %', p_index, p_form;
	end if;

	PERFORM set_config('session.syncing', 'true', true);
	FOR _c_table IN SELECT t.table_name::TEXT FROM information_schema.tables t WHERE t.table_schema = p_form::TEXT
		LOOP
			IF _c_table = 'data' THEN
				EXECUTE FORMAT('UPDATE %I.data SET _version_ = $1 WHERE _index = $2', p_form) USING _version, p_index;
			ELSE
				EXECUTE FORMAT('UPDATE %I.%I SET _submission_version = $1 WHERE _parent_index = $2', p_form,
											 _c_table) USING _version, p_index;
			end if;
		end loop;
	PERFORM set_config('session.syncing', 'false', true);
EXCEPTION
	WHEN OTHERS THEN
		PERFORM set_config('session.syncing', 'false', true);
		ROLLBACK;
		RAISE EXCEPTION USING MESSAGE = SQLERRM, HINT = SQLSTATE;
end;
$$;
