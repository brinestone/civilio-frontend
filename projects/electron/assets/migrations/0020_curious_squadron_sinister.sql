DROP TRIGGER IF EXISTS sync_version_trigger ON revisions.deltas;
CREATE TRIGGER sync_version_trigger
	AFTER INSERT
	ON revisions.deltas
	FOR EACH ROW
EXECUTE FUNCTION revisions.func_sync_version();
