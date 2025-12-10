DROP VIEW IF EXISTS "civilio"."vw_db_columns";
CREATE VIEW "civilio"."vw_db_columns" AS
(
SELECT c.column_name, c.data_type, c.table_name, CAST(c.table_schema as "civilio"."form_types")
FROM information_schema.columns c
WHERE c.table_schema in ('fosa', 'chefferie', 'csc'));
