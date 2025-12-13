DROP VIEW "civilio"."vw_facilities";
--> statement-breakpoint
CREATE VIEW "civilio"."vw_facilities" AS
(
SELECT UPPER(info.facility_name) AS facility_name,
			 info.index,
			 info.form,
			 UPPER(info.location)      AS location,
			 info.gps_coordinates,
			 validated                 AS approved,
			 extra_info
FROM (SELECT c._index                                    as index,
						 'csc'::civilio.form_types                   as form,
						 c.q2_4_officename                           as facility_name,
						 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
						 c.q2_12_gps_coordinates                     as gps_coordinates,
						 COALESCE(c._validation_status = 'validation_status_approved',
											false)                             as validated,
						 jsonb_build_object(
							 'milieu', mil.label,
							 'is_functional', COALESCE(c.q2_10_fonctionnel = '1', false),
							 'degree', deg_o.label,
							 'is_chiefdom', COALESCE(c.q2_1a_chefferie = '1', false),
							 'size', COALESCE(c_size.label, c.q2_06_taille_commune),
							 'village_count', COALESCE(v_counts.village_count, 0),
							 'employee_count', COALESCE(em_counts.employee_count, 1),
							 'equipment',
							 (
								 COALESCE(c.q6_01_computers::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_02_serveurs::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_03_printers::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_4_scanners::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_5_onduleur::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_6_climatiseur::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_7_ventilateur::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_9_tablea_bureau::DOUBLE PRECISION::INTEGER,
													0) +
								 COALESCE(c.q6_10_chaise::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q6_12_car::DOUBLE PRECISION::INTEGER, 0) +
								 COALESCE(c.q9_13_moto::DOUBLE PRECISION::INTEGER, 0)
								 ),
							 'has_internet', COALESCE(
								 c.q4_12_batiment_connecte::DOUBLE PRECISION::INTEGER = 1,
								 false),
							 'has_power', COALESCE(
								 c.q4_02_reseau_electrique::DOUBLE PRECISION::INTEGER = 1 OR
								 c.q4_5_autre_source::DOUBLE PRECISION::INTEGER = 1, false),
							 'has_water',
							 COALESCE(c.q4_7alimentation_eau::TEXT NOT IN ('1'), false)
						 )                                           as extra_info
			FROM csc.data c
						 LEFT JOIN (SELECT _parent_index, COUNT(*) AS employee_count
												FROM csc.data_personnel
												GROUP BY _parent_index) em_counts
											 ON em_counts._parent_index = c._index
						 LEFT JOIN (SELECT _parent_index, COUNT(*) AS village_count
												FROM csc.data_villages
												GROUP BY _parent_index) v_counts
											 ON v_counts._parent_index = c._index
						 LEFT JOIN civilio.choices c_size
											 ON c_size."group" = 'pq1hw83' AND
													c_size.version = 'csc' AND
													c_size.name = c.q2_06_taille_commune
						 LEFT JOIN civilio.choices mil
											 ON mil."group" = 'vb2qk85' AND mil.version = 'csc' AND
													mil.name = c.milieu::TEXT
						 LEFT JOIN civilio.choices deg_o
											 ON deg_o."group" = 'sl95o71' AND
													deg_o.version = 'csc' AND deg_o.name = c.degr::TEXT
						 LEFT JOIN civilio.choices mu_div
											 ON mu_div."group" = 'division' AND
													mu_div.name = c.q2_01_division::TEXT AND
													mu_div.version = 'csc'
						 LEFT JOIN civilio.choices mu_ch
											 ON mu_ch."group" = 'commune' AND
													mu_ch.name = c.q2_02_municipality::TEXT AND
													mu_ch.version = 'csc' AND
													mu_ch.parent = c.q2_01_division::TEXT
			UNION
			SELECT c._index,
						 'fosa'::civilio.form_types                  as form,
						 c.q1_12_officename                          as facility_name,
						 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
						 c.q1_13_gps_coordinates                     as gps_coordinates,
						 COALESCE(c._validation_status = 'validation_status_approved',
											false)                             as validated,
						 jsonb_build_object(
							 'milieu', ml.label,
							 'health_area', mha.label,
							 'health_district', mda.label,
							 'category',
							 COALESCE(NULLIF(TRIM(BOTH ' ' FROM c.autre_cat_gorie), ''),
												c_cat.label),
							 'status', c_status.label,
							 'employee_count', COALESCE(em_counts.employee_count, 1),
							 'has_internet', COALESCE(
								 c.q7_08_broadband_conn_available::DOUBLE PRECISION::INTEGER =
								 1, false),
							 'has_power', COALESCE(
								 c.q7_01_facility_conn_power_grid::DOUBLE PRECISION::INTEGER =
								 1,
								 c.q7_04_any_source_of_backup::DOUBLE PRECISION::INTEGER = 1,
								 false),
							 'has_water', COALESCE(
								 c.q6_09aalimentation_eau::DOUBLE PRECISION::INTEGER = 1,
								 false),
							 'equipment', (
								 COALESCE(c.q9_02_computers, 0) +
								 COALESCE(c.q9_03_printers, 0) +
								 COALESCE(c.q9_04_tablets, 0) +
								 COALESCE(c.q9_10_car, 0) +
								 COALESCE(c.q9_11_mopeds, 0)
								 ),
							 'stats_l_5', jsonb_build_object('births',
																							 COALESCE(group_ce1sz98_ligne_colonne, 0) +
																							 COALESCE(group_ce1sz98_ligne_1_colonne, 0) +
																							 COALESCE(group_ce1sz98_ligne_2_colonne, 0) +
																							 COALESCE(group_ce1sz98_ligne_3_colonne, 0) +
																							 COALESCE(group_ce1sz98_ligne_4_colonne, 0),
																							 'deaths',
																							 COALESCE(group_ce1sz98_ligne_colonne_1, 0) +
																							 COALESCE(group_ce1sz98_ligne_1_colonne_1, 0) +
																							 COALESCE(group_ce1sz98_ligne_2_colonne_1, 0) +
																							 COALESCE(group_ce1sz98_ligne_3_colonne_1, 0) +
																							 COALESCE(group_ce1sz98_ligne_4_colonne_1, 0)
														)
						 )                                           AS extra_info
			FROM fosa.data c
						 LEFT JOIN (SELECT _parent_index, COUNT(*) AS employee_count
												FROM fosa.data_personnel
												GROUP BY _parent_index) em_counts
											 ON em_counts._parent_index = c._index
						 LEFT JOIN civilio.choices c_status
											 ON c_status."group" = 'qy7we33' AND
													c_status.name = c.statut_de_la_fosa::TEXT AND
													c_status.version = 'fosa'
						 LEFT JOIN civilio.choices c_cat
											 ON c_cat."group" = 'pa9ii12' AND
													c_cat.name = c.q1_07_type_healt_facility::TEXT AND
													c_cat.version = 'fosa'
						 LEFT JOIN civilio.choices mda
											 ON mda."group" = 'district' AND
													mda.name = c.ds_rattachement::TEXT AND
													mda.version = 'fosa'
						 LEFT JOIN civilio.choices mha ON mha."group" = 'airesante' AND
																							mha.name =
																							c.as_rattachement::TEXT AND
																							mha.version = 'fosa' AND
																							mha.parent = c.ds_rattachement::TEXT
						 LEFT JOIN civilio.choices ml
											 ON ml."group" = 'vb2qk85' AND
													ml.name = c.milieu::TEXT AND ml.version = 'fosa'
						 LEFT JOIN civilio.choices mu_div
											 ON mu_div."group" = 'division' AND
													mu_div.name = c.q1_02_division::TEXT AND
													mu_div.version = 'fosa'
						 LEFT JOIN civilio.choices mu_ch
											 ON mu_ch."group" = 'commune' AND
													mu_ch.name = c.q1_03_municipality::TEXT AND
													mu_ch.version = 'fosa' AND
													mu_ch.parent = c.q1_02_division::TEXT
			UNION
			SELECT c._index,
						 'chefferie'::civilio.form_types             as form,
						 c.q1_12_officename                          as facility_name,
						 CONCAT_WS(' - ', mu_ch.label, mu_div.label) as location,
						 c.q1_13_gps_coordinates                     as gps_coordinates,
						 COALESCE(c._validation_status = 'validation_status_approved',
											false)                             as validated,
						 jsonb_build_object(
							 'degree', c_deg.label,
							 'equipment', (COALESCE(c.q9_02_computers, 0) +
														 COALESCE(c.q9_03_printers, 0) +
														 COALESCE(c.q9_04_tablets, 0) +
														 COALESCE(c.q9_10_car, 0) +
														 COALESCE(c.q9_11_mopeds, 0)),
							 'has_internet', COALESCE(
								 c.q4_02_broadband_conn_available::DOUBLE PRECISION::INTEGER =
								 1, false),
							 'has_water', COALESCE(
								 c.q6_09aalimentation_eau::DOUBLE PRECISION::INTEGER = 1,
								 false),
							 'has_power',
							 COALESCE(c.q4_04_electricite::DOUBLE PRECISION::INTEGER = 1,
												false),
							 'employee_count', employee_count
						 )                                           AS extra_info
			FROM chefferie.data c
						 LEFT JOIN (SELECT _parent_index, COUNT(*) AS employee_count
												FROM chefferie.data_personnel
												GROUP BY _parent_index) em_counts
											 ON em_counts._parent_index = c._index
						 LEFT JOIN civilio.choices c_deg
											 ON c_deg."group" = 'vb2qk85' AND
													c_deg.name = c.degre::TEXT AND
													c_deg.version = 'chefferie'
						 LEFT JOIN civilio.choices mu_div
											 ON mu_div."group" = 'division' AND
													mu_div.name = c.q1_02_division::TEXT AND
													mu_div.version = 'chefferie'
						 LEFT JOIN civilio.choices mu_ch
											 ON mu_ch."group" = 'commune' AND
													mu_ch.name = c.q1_03_municipality::TEXT AND
													mu_ch.version = 'chefferie' AND
													mu_ch.parent = c.q1_02_division::TEXT) AS info
	);
