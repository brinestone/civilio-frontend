ALTER TABLE csc.data_personnel
	ALTER COLUMN _submission_id DROP NOT NULL;
ALTER TABLE csc.data_pieces
	ALTER COLUMN _submission_id DROP NOT NULL;
ALTER TABLE csc.data_statistiques
	ALTER COLUMN _submission_id DROP NOT NULL;
ALTER TABLE csc.data_villages
	ALTER COLUMN _submission_id DROP NOT NULL;
