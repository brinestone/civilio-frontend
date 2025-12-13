DROP VIEW "civilio"."vw_facility_info";
--> statement-breakpoint
CREATE VIEW "civilio"."vw_facility_info" AS
(
SELECT UPPER(info.facility_name) AS facility_name,
			 info.index,
			 info.form,
			 info.location,
			 info.gps_coordinates
FROM (SELECT c._index                                    as index,
						 'csc'::civilio.form_types                   as form,
						 c.q2_4_officename                           as facility_name,
						 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
						 c.q2_12_gps_coordinates                     as gps_coordinates
			FROM csc.data c
						 RIGHT JOIN civilio.choices mu_div
												ON mu_div."group" = 'division' AND
													 mu_div.name = c.q2_01_division::TEXT AND
													 mu_div.version = 'csc'
						 RIGHT JOIN civilio.choices mu_ch
												ON mu_ch."group" = 'commune' AND
													 mu_ch.name = c.q2_02_municipality::TEXT AND
													 mu_ch.version = 'csc' AND
													 mu_ch.parent = c.q2_01_division::TEXT
			UNION
			SELECT c._index,
						 'fosa'::civilio.form_types                  as form,
						 c.q1_12_officename                          as facility_name,
						 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
						 c.q1_13_gps_coordinates                     as gps_coordinates
			FROM fosa.data c
						 RIGHT JOIN civilio.choices mu_div
												ON mu_div."group" = 'division' AND
													 mu_div.name = c.q1_02_division::TEXT AND
													 mu_div.version = 'fosa'
						 RIGHT JOIN civilio.choices mu_ch
												ON mu_ch."group" = 'commune' AND
													 mu_ch.name = c.q1_03_municipality::TEXT AND
													 mu_ch.version = 'fosa' AND
													 mu_ch.parent = c.q1_02_division::TEXT
			UNION
			SELECT c._index,
						 'chefferie'::civilio.form_types             as form,
						 c.q1_12_officename                          as facility_name,
						 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
						 c.q1_13_gps_coordinates                     as gps_coordinates
			FROM chefferie.data c
						 RIGHT JOIN civilio.choices mu_div
												ON mu_div."group" = 'division' AND
													 mu_div.name = c.q1_02_division::TEXT AND
													 mu_div.version = 'chefferie'
						 RIGHT JOIN civilio.choices mu_ch
												ON mu_ch."group" = 'commune' AND
													 mu_ch.name = c.q1_03_municipality::TEXT AND
													 mu_ch.version = 'chefferie' AND
													 mu_ch.parent = c.q1_02_division::TEXT) AS info
	);
