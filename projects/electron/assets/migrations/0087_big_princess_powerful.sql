DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_archives ON "csc"."data_archives";
CREATE TRIGGER
	"change_delta_logger_trigger_csc_archives"
	BEFORE INSERT OR UPDATE OR DELETE
	ON "csc"."data_archives"
	FOR EACH ROW
EXECUTE FUNCTION "civilio"."func_log_delta_changes"();
