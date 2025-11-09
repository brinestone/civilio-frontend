CREATE OR REPLACE FUNCTION revisions.func_sync_version() RETURNS TRIGGER AS
$$
DECLARE
	_other_tables     TEXT[];
	_other_table      TEXT;
	_sync_sql         TEXT;
	_index_col_name   TEXT;
	_version_col_name TEXT;
	_rows_affected    INTEGER;
BEGIN
	IF TG_OP = 'INSERT' AND NEW.sync_status = 'pending' THEN
		RAISE NOTICE 'Starting version synchronization for delta %, operation: %', NEW.hash, NEW.op;

		SELECT ARRAY_AGG(DISTINCT t.table_name::TEXT)
		FROM information_schema.tables t
		WHERE t.table_schema::TEXT = NEW.form::TEXT
			AND t.table_name <> NEW.table_name
		INTO _other_tables;

		IF _other_tables IS NOT NULL THEN
			FOREACH _other_table IN ARRAY _other_tables
				LOOP
					BEGIN
						IF _other_table = 'data' THEN
							_index_col_name = '_index';
							_version_col_name = '_version_';
						ELSE
							_index_col_name = '_parent_index';
							_version_col_name = '_submission_version';
						end if;
						_sync_sql := FORMAT('UPDATE %I.%I SET %I = $1 WHERE %I = $2', NEW.form, _other_table,
																_version_col_name, _index_col_name);
						EXECUTE _sync_sql USING NEW.hash, NEW.submission_index;
						GET DIAGNOSTICS _rows_affected = ROW_COUNT;

						RAISE NOTICE 'Synced version % to "%" table for submission index %, affected rows: %', NEW.hash, _other_table, NEW.submission_index, _rows_affected;
					EXCEPTION
						WHEN OTHERS THEN
							RAISE WARNING 'Failed to sync version to table %.%: %', NEW.form, _other_table, SQLERRM;
					end;
				end loop;
		end if;
		UPDATE revisions.deltas SET sync_status = 'synced' WHERE hash = NEW.hash;
	end if;

	RETURN NEW;
end;
$$ LANGUAGE plpgsql;
