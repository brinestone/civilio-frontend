create or replace function revisions.get_version_chain(_index integer, _form civilio.form_types)
	returns TABLE
					(
						changed_at     timestamp with time zone,
						operation      revisions.change_op,
						version        text,
						parent_version text,
						changed_by     text,
						is_current     boolean
					)
	language plpgsql
as
$$
BEGIN
	RETURN QUERY
		SELECT d.changed_at,
					 d.op     as operation,
					 d.hash   as version,
					 d.parent as parent_version,
					 d.changed_by,
					 (
						 d.hash = (SELECT revisions.get_record_current_version(
																_form,
																'data',
																_index
															))
						 )      AS is_current

		FROM revisions.deltas d
		WHERE d.submission_index = _index
			AND d.table_name = 'data'
		ORDER BY d.changed_at DESC;
END;
$$;
