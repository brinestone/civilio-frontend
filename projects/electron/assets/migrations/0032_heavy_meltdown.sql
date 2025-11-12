DROP TRIGGER IF EXISTS change_delta_logger_trigger_chefferie_personnel ON chefferie.data_personnel;
CREATE TRIGGER change_delta_logger_trigger_chefferie_personnel
	BEFORE UPDATE OR INSERT
	ON chefferie.data_personnel
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
