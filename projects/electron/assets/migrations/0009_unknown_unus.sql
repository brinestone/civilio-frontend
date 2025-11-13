CREATE OR REPLACE FUNCTION revisions.get_record_current_version(
	IN form civilio.form_types,
	IN table_name TEXT,
	IN _submission_index INTEGER) RETURNS TEXT AS
$$
DECLARE
	ans              TEXT;
	query            TEXT;
	version_col_name TEXT;
	index_col_name   TEXT;
BEGIN
	IF table_name = 'data' THEN
		version_col_name := '_version_';
		index_col_name := '_index';
	ELSE
		version_col_name := '_submission_version';
		index_col_name := '_parent_index';
	end if;
	query :=
		format('SELECT d.%I FROM %I.%I d WHERE d.%I = %L LIMIT 1', version_col_name, form::TEXT, table_name, index_col_name,
					 _submission_index);
	EXECUTE query INTO ans;
	RETURN ans;
end;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION revisions.get_version_chain(
	IN _index INTEGER,
-- 	IN record_index INTEGER,
	IN _form civilio.form_types
)
	RETURNS TABLE
					(
						changed_at     TIMESTAMP,
						operation      revisions.change_op,
						version        TEXT,
						parent_version TEXT,
						changed_by     TEXT,
						is_current     boolean
					)
AS
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
$$ LANGUAGE plpgsql;
