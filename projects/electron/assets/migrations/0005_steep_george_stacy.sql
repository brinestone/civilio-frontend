-- csc
ALTER TABLE csc.data ALTER COLUMN _version_ SET DATA TYPE TEXT;
ALTER TABLE csc.data_personnel ALTER COLUMN _submission_version_ SET DATA TYPE TEXT;
ALTER TABLE csc.data_pieces ALTER COLUMN _submission_version SET DATA TYPE TEXT;
ALTER TABLE csc.data_statistiques ALTER COLUMN _submission_version SET DATA TYPE TEXT;
ALTER TABLE csc.data_villages ALTER COLUMN _submission_version SET DATA TYPE TEXT;

ALTER TABLE csc.data_personnel RENAME COLUMN _submission_version_ TO _submission_version;

-- fosa
ALTER TABLE fosa.data ALTER COLUMN _version_ SET DATA TYPE TEXT;
ALTER TABLE fosa.data_personnel ALTER COLUMN _submission_version_ SET DATA TYPE TEXT;

ALTER TABLE fosa.data_personnel RENAME COLUMN _submission_version_ TO _submission_version;

-- chefferie
ALTER TABLE chefferie.data ALTER COLUMN _version_ SET DATA TYPE TEXT;
ALTER TABLE chefferie.data_personnel ALTER COLUMN _submission_version_ TYPE TEXT;

ALTER TABLE chefferie.data_personnel RENAME COLUMN _submission_version_ TO submission_version;
