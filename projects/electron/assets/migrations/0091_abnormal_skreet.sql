DROP FUNCTION IF EXISTS public.get_record_current_version(civilio.form_types, TEXT INTEGER);
DROP FUNCTION IF EXISTS revisions.get_record_current_version(civilio.form_types, TEXT INTEGER);
CREATE FUNCTION revisions.get_record_current_version(
	IN p_form civilio.form_types,
	IN p_submission_index INTEGER DEFAULT NULL
) RETURNS TEXT AS
$$
DECLARE
BEGIN
	SELECT t.hash as version
	FROM (SELECT DISTINCT hash, changed_at
				FROM revisions.deltas
				WHERE form = p_form
					AND submission_index = p_submission_index) t
	ORDER BY t.changed_at DESC
	LIMIT 1;
end;
$$ LANGUAGE plpgsql;
