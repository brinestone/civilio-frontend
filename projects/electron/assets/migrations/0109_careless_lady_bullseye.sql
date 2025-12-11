CREATE OR REPLACE FUNCTION revisions.func_update_ledger() RETURNS TRIGGER AS
$$
BEGIN
	DELETE FROM revisions.ledger WHERE hash = old.hash AND form = old.form AND submission_index = old.submission_index;
end;
$$
	LANGUAGE plpgsql;
