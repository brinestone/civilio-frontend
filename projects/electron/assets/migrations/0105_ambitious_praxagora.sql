drop function if exists revisions.get_version_chain;
create function revisions.get_version_chain(
	IN p_index integer,
	IN p_form civilio.form_types)
	returns TABLE
					(
						changed_at     timestamp with time zone,
						operation      revisions.change_op,
						version        text,
						parent_version text,
						changed_by     text,
						is_current     boolean,
						change_notes   text
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
						 d.hash = (SELECT revisions.get_record_current_version(p_form, p_index))
						 )      AS is_current,
					 l.notes  as change_notes

		FROM revisions.deltas d
					 LEFT JOIN revisions.ledger l ON l.hash = d.hash AND l.submission_index = d.submission_index
		WHERE d.submission_index = p_index
			AND d.table_name = 'data'
		ORDER BY d.changed_at DESC;
END;
$$;
