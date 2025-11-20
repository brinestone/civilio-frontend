ALTER TABLE csc.data_villages
	DROP CONSTRAINT IF EXISTS constraint_3;
ALTER TABLE csc.data_villages
	DROP CONSTRAINT IF EXISTS data_villages_parent_index_data_index_fk;
ALTER TABLE csc.data_villages
	ADD CONSTRAINT data_villages_parent_index_data_index_fk FOREIGN KEY (_parent_index) REFERENCES csc.data (_index) ON DELETE CASCADE;
