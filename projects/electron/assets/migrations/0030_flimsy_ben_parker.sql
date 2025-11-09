DROP TRIGGER IF EXISTS change_delta_logger_trigger_fosa_personnel ON fosa.data_personnel;
CREATE TRIGGER change_delta_logger_trigger_fosa_personnel
	BEFORE UPDATE
	ON fosa.data_personnel
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
