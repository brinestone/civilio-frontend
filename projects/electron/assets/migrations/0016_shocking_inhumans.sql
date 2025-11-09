DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_personnel ON "csc"."data_personnel";
CREATE TRIGGER
	"change_delta_logger_trigger_csc_personnel"
	BEFORE UPDATE
	ON "csc"."data_personnel"
	FOR EACH ROW
EXECUTE FUNCTION "civilio"."func_log_delta_changes"();
