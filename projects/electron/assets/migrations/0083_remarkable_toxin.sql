CREATE TABLE IF NOT EXISTS csc.data_archives
(
	_index              INTEGER NOT NULL PRIMARY KEY,
	_parent_index       INTEGER NOT NULL,
	q12_1_annee         INTEGER DEFAULT 0,
	q12_2_Naissance     INTEGER DEFAULT 0,
	q12_3_mariage       INTEGER DEFAULT 0,
	q12_4_deces         INTEGER DEFAULT 0,
	_submission_version TEXT,
	CONSTRAINT _data_archives_parent_index_data__index_fk FOREIGN KEY (_parent_index) REFERENCES csc.data (_index) ON DELETE CASCADE
);
