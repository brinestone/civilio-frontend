ALTER TABLE fosa.data
	DROP CONSTRAINT IF EXISTS data_pk2;
ALTER TABLE fosa.data
	ALTER COLUMN _id DROP NOT NULL;
ALTER TABLE fosa.data_personnel
	ALTER COLUMN _parent_index SET NOT NULL;
ALTER TABLE chefferie.data
	DROP CONSTRAINT IF EXISTS _id__index_pk;
ALTER TABLE chefferie.data
	ALTER COLUMN _id DROP NOT NULL;
-- ALTER TABLE chefferie.data
-- 	ADD CONSTRAINT "_index__parent_index_pk" PRIMARY KEY (_index);
ALTER TABLE chefferie.data_personnel
	DROP CONSTRAINT IF EXISTS parent_index_data__index_fk;
ALTER TABLE chefferie.data_personnel
	DROP CONSTRAINT IF EXISTS data_personnel__index__submission_id_pk;
ALTER TABLE chefferie.data_personnel
	DROP CONSTRAINT IF EXISTS _index_pk;
ALTER TABLE chefferie.data_personnel
	DROP CONSTRAINT IF EXISTS data__id_idx;
ALTER TABLE chefferie.data_personnel
	DROP CONSTRAINT IF EXISTS data__index_idx;
-- ALTER TABLE chefferie.data_personnel
-- 	ADD CONSTRAINT "data_personnel__index__parent_index_pk" PRIMARY KEY (_index, _parent_index);
-- ALTER TABLE chefferie.data_personnel
-- 	ADD CONSTRAINT "data_personnel__parent_index_data__index_fk" FOREIGN KEY (_parent_index) REFERENCES chefferie.data (_index);
ALTER TABLE chefferie.data_personnel
	ALTER COLUMN _submission_id DROP NOT NULL;
