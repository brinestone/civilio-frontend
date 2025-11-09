DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_stats ON csc.data_statistiques;
CREATE TRIGGER change_delta_logger_trigger_csc_stats
	BEFORE UPDATE
	ON csc.data_statistiques
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
