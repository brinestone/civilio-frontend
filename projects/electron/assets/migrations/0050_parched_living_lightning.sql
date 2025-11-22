DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_stats ON csc.data_statistiques;
CREATE TRIGGER change_delta_logger_trigger_csc_stats
	BEFORE UPDATE OR DELETE OR INSERT
	ON csc.data_statistiques
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();

DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_pieces ON csc.data_pieces;
CREATE TRIGGER change_delta_logger_trigger_csc_pieces
	BEFORE UPDATE OR DELETE OR INSERT
	ON csc.data_pieces
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();

DROP TRIGGER IF EXISTS change_delta_logger_trigger_fosa ON fosa.data;
CREATE TRIGGER change_delta_logger_trigger_fosa
	BEFORE UPDATE OR DELETE OR INSERT
	ON fosa.data
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();

DROP TRIGGER IF EXISTS change_delta_logger_trigger_fosa_personnel ON fosa.data_personnel;
CREATE TRIGGER change_delta_logger_trigger_fosa_personnel
	BEFORE UPDATE OR DELETE OR INSERT
	ON fosa.data_personnel
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();

DROP TRIGGER IF EXISTS change_delta_logger_trigger_chefferie ON chefferie.data;
CREATE TRIGGER change_delta_logger_trigger_chefferie
	BEFORE UPDATE OR DELETE OR INSERT
	ON chefferie.data
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();

DROP TRIGGER IF EXISTS change_delta_logger_trigger_chefferie_personnel ON chefferie.data_personnel;
CREATE TRIGGER change_delta_logger_trigger_chefferie_personnel
	BEFORE UPDATE OR DELETE OR INSERT
	ON chefferie.data_personnel
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
