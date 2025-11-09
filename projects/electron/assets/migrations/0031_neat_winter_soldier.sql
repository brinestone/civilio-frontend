DROP TRIGGER IF EXISTS change_delta_logger_trigger_chefferie ON chefferie.data;
CREATE TRIGGER change_delta_logger_trigger_chefferie
	BEFORE UPDATE
	ON chefferie.data
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
