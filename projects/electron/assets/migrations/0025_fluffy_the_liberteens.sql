DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_villages ON csc.data_villages;
CREATE TRIGGER change_delta_logger_trigger_csc_villages
	BEFORE UPDATE
	ON csc.data_villages
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
