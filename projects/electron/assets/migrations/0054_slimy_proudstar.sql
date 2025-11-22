DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_data_villages ON csc.data_statistiques;
CREATE TRIGGER change_delta_logger_trigger_csc_data_villages
	BEFORE UPDATE OR DELETE OR INSERT
	ON csc.data_villages
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();

DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_data_personnel ON csc.data_statistiques;
CREATE TRIGGER change_delta_logger_trigger_csc_data_personnel
	BEFORE UPDATE OR DELETE OR INSERT
	ON csc.data_personnel
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();


DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_data ON csc.data_statistiques;
CREATE TRIGGER change_delta_logger_trigger_csc_data
	BEFORE UPDATE OR DELETE OR INSERT
	ON csc.data
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
