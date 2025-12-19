DO
$$
	BEGIN
		IF EXISTS(SELECT 1
							FROM information_schema.views v
							WHERE v.table_schema::TEXT = 'civilio'
								AND v.table_name::TEXT = 'vw_facility_info') THEN
			ALTER VIEW IF EXISTS "civilio"."vw_facility_info" RENAME TO "vw_facilities";
		end if;
	end;
$$;
