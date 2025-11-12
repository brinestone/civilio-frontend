DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc ON "csc"."data";
CREATE TRIGGER
	"change_delta_logger_trigger_csc"
	BEFORE UPDATE OR INSERT
	ON "csc"."data"
	FOR EACH ROW
EXECUTE FUNCTION "civilio"."func_log_delta_changes"();
