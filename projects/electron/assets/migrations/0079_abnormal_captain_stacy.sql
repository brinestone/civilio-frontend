create or replace function revisions.get_version_chain(p_index integer, p_form civilio.form_types)
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
		SELECT chain.*
		FROM (SELECT DISTINCT ON (d.hash) d.changed_at,
																			d.op     as operation,
																			d.hash   as version,
																			d.parent as parent_version,
																			d.changed_by,
																			(
																				d.hash = (SELECT revisions.get_record_current_version(p_form, p_index))
																				)    AS is_current

					FROM revisions.deltas d
					WHERE d.submission_index = p_index
					ORDER BY d.hash) chain
		ORDER BY chain.changed_at DESC;
END;
$$;
