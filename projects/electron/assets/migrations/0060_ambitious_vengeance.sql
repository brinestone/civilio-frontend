create or replace function get_record_current_version(
	IN p_form civilio.form_types,
	IN p_index integer
) returns text
	language plpgsql
as
$$
DECLARE
	ans   TEXT;
	query TEXT;
BEGIN
	query :=
		format('SELECT d._version_ FROM %I.data d WHERE d._index = $1 LIMIT 1', p_form::TEXT);
	EXECUTE query INTO ans USING p_index;
	RETURN ans;
end;
$$;
