DROP TRIGGER IF EXISTS remove_ledger_entry ON revisions.deltas;
CREATE TRIGGER remove_ledger_entry
	AFTER DELETE
	ON revisions.deltas
	FOR EACH ROW
EXECUTE FUNCTION revisions.func_update_ledger();
