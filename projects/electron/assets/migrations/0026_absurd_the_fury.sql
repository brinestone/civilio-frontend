DROP TRIGGER IF EXISTS change_delta_logger_trigger_csc_pieces ON csc.data_pieces;
CREATE TRIGGER change_delta_logger_trigger_csc_pieces
	BEFORE UPDATE OR INSERT
	ON csc.data_pieces
	FOR EACH ROW
EXECUTE FUNCTION civilio.func_log_delta_changes();
