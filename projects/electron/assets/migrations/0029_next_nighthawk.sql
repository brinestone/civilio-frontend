DROP TRIGGER IF EXISTS change_delta_logger_trigger_fosa ON fosa.data;
CREATE TRIGGER change_delta_logger_trigger_fosa
	BEFORE UPDATE OR INSERT
	ON fosa.data
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
