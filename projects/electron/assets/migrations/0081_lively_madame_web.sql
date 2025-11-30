DROP PROCEDURE IF EXISTS revisions.revert_submission(civilio.form_types, INTEGER, TEXT);
CREATE OR REPLACE PROCEDURE
	revisions.revert_submission(
	IN p_form civilio.form_types,
	IN p_index INTEGER,
	IN p_version TEXT,
	IN p_change_notes TEXT,
	IN p_actor TEXT,
	IN p_new_version TEXT DEFAULT NULL
) AS
$$
DECLARE
BEGIN

END;
$$ LANGUAGE plpgsql;
