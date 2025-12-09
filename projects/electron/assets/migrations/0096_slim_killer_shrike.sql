drop function revisions.get_record_current_version(civilio.form_types, integer);

create function revisions.get_record_current_version(p_form civilio.form_types,
																										 p_submission_index integer DEFAULT NULL::integer) returns text
	language plpgsql
as
$$
DECLARE
	_version TEXT;
BEGIN
	SELECT t.hash as version
	INTO _version
	FROM (SELECT DISTINCT hash, changed_at
				FROM revisions.deltas
				WHERE form = p_form
					AND submission_index = p_submission_index) t
	ORDER BY t.changed_at DESC
	LIMIT 1;
	RETURN _version;
end;
$$;

