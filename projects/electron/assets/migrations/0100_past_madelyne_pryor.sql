--
-- Data for Name: form_field_mappings; Type: TABLE DATA; Schema: civilio; Owner: -
--

INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.respondent.fields.names', 'csc.form.sections.respondent.fields.names', 'q0_02_name', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.respondent.fields.position', 'csc.form.sections.respondent.fields.position',
				'q0_01_position', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.respondent.fields.phone', 'csc.form.sections.respondent.fields.phone', 'q0_03_phone', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.respondent.fields.email', 'csc.form.sections.respondent.fields.email', 'q0_04_mail', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.respondent.fields.knows_creation_date',
				'csc.form.sections.respondent.fields.knows_creation_date', 'q0_05_know_date_creation', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.respondent.fields.creation_date', 'csc.form.sections.respondent.fields.creation_date',
				'q0_06_date_creation', 'data', 'csc', 'date', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.division', 'csc.form.sections.identification.fields.division',
				'q2_01_division', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.municipality', 'csc.form.sections.identification.fields.municipality',
				'q2_02_municipality', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.quarter', 'csc.form.sections.identification.fields.quarter',
				'q1_03_quater', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.facility_name',
				'csc.form.sections.identification.fields.facility_name', 'q2_4_officename', 'data', 'csc', 'character varying',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.category', 'csc.form.sections.identification.fields.category',
				'q2_5_cat_cec', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.is_chiefdom', 'csc.form.sections.identification.fields.is_chiefdom',
				'q2_1a_chefferie', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.degree', 'csc.form.sections.identification.fields.degree', 'degr',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.size', 'csc.form.sections.identification.fields.size',
				'q2_06_taille_commune', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.milieu', 'csc.form.sections.identification.fields.milieu', 'milieu',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.attached_csc_count',
				'csc.form.sections.identification.fields.attached_csc_count', 'q2_08_cec_rattaches', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.is_functional',
				'csc.form.sections.identification.fields.is_functional', 'q2_10_fonctionnel', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.gps_coords', 'csc.form.sections.identification.fields.gps_coords',
				'q2_12_gps_coordinates', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.non_function_reason',
				'csc.form.sections.identification.fields.non_function_reason', 'q2_11_motif_non_fonctionnement', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.custom_non_function_reason',
				'csc.form.sections.identification.fields.custom_non_function_reason', 'q2_11a_autre_motif', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.non_function_duration',
				'csc.form.sections.identification.fields.non_function_duration', 'q2_12_depuis_combien_temps', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.csc_creation_declaration',
				'csc.form.sections.identification.fields.csc_creation_declaration', 'q2_13_arrete_cec', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.is_officer_appointed',
				'csc.form.sections.identification.fields.is_officer_appointed', 'q2_14_officier_nomme', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.identification.fields.officer_declaration',
				'csc.form.sections.identification.fields.officer_declaration', 'q2_15_arrete_officier', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.general.fields.serving_roads',
				'csc.form.sections.accessibility.sections.general.fields.serving_roads', 'q3_1_voie_comm', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.general.fields.has_obstacles',
				'csc.form.sections.accessibility.sections.general.fields.has_obstacles', 'q3_2_obstacle', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.general.fields.is_road_degradable',
				'csc.form.sections.accessibility.sections.general.fields.is_road_degradable', 'q3_3_chemin_degrade', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.general.fields.attached_villages_count',
				'csc.form.sections.accessibility.sections.general.fields.attached_villages_count',
				'q3_4_nbre_villages_rattaches', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.general.fields.cover_radius',
				'csc.form.sections.accessibility.sections.general.fields.cover_radius', 'q3_5_rayon_couverture', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.villages.fields.index',
				'csc.form.sections.accessibility.sections.villages.fields.index', '_index', 'data_villages', 'csc', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.villages.fields.name',
				'csc.form.sections.accessibility.sections.villages.fields.name', 'q3_61nom_du_village', 'data_villages', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.villages.fields.avg_dist',
				'csc.form.sections.accessibility.sections.villages.fields.avg_dist', 'q3_62_distance_moyenne_du_cec',
				'data_villages', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.accessibility.sections.villages.fields.observations',
				'csc.form.sections.accessibility.sections.villages.fields.observations', 'q3_63_observations', 'data_villages',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.status', 'csc.form.sections.infra.fields.status', 'q4_01_statut_batiment',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.other_building', 'csc.form.sections.infra.fields.other_building',
				'autre_b_timent_public', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.eneo_connection', 'csc.form.sections.infra.fields.eneo_connection',
				'q4_02_reseau_electrique', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.has_power_outages', 'csc.form.sections.infra.fields.has_power_outages',
				'q4_3_interruption', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.has_stable_power', 'csc.form.sections.infra.fields.has_stable_power',
				'q4_4_courant_stable', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.has_backup_power', 'csc.form.sections.infra.fields.has_backup_power',
				'q4_5_autre_source', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.backup_power_sources', 'csc.form.sections.infra.fields.backup_power_sources',
				'q4_6_autre_energie', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.other_power_source', 'csc.form.sections.infra.fields.other_power_source',
				'q4_6a_autre_source_energie', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.water_sources', 'csc.form.sections.infra.fields.water_sources',
				'q4_7alimentation_eau', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.toilets_available', 'csc.form.sections.infra.fields.toilets_available',
				'q4_8_toilette', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.are_toilets_separated', 'csc.form.sections.infra.fields.are_toilets_separated',
				'q4_9_toilette_separe', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.has_fiber_connection', 'csc.form.sections.infra.fields.has_fiber_connection',
				'q4_10_fibre_optique', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.network_type', 'csc.form.sections.infra.fields.network_type',
				'q4_11_operateur_telecom_zone', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.other_network_type', 'csc.form.sections.infra.fields.other_network_type',
				'q4_11_autre_operateur', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.has_internet', 'csc.form.sections.infra.fields.has_internet',
				'q4_12_batiment_connecte', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.internet_type', 'csc.form.sections.infra.fields.internet_type',
				'q4_12_operateur_cec', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.other_internet_type', 'csc.form.sections.infra.fields.other_internet_type',
				'autres_op_rateurs_fo_s_d_acc_s_internet', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.infra.fields.internet_sponsor', 'csc.form.sections.infra.fields.internet_sponsor',
				'q4_13_fraisconnexion', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms',
				'csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms', 'q5_2_autre_salle', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.areas.sections.general.fields.moving_plans',
				'csc.form.sections.areas.sections.general.fields.moving_plans', 'q5_4_nouveau_batiment', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.areas.sections.rooms.fields.index', 'csc.form.sections.areas.sections.rooms.fields.index',
				'_index', 'data_pieces', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.bike_count', 'csc.form.sections.equipment.fields.bike_count', 'q9_13_moto',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.areas.sections.rooms.fields.condition',
				'csc.form.sections.areas.sections.rooms.fields.condition', 'etatdelapice', 'data_pieces', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.areas.sections.rooms.fields.area', 'csc.form.sections.areas.sections.rooms.fields.area',
				'superficielongueurxlargeur', 'data_pieces', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.areas.sections.rooms.fields.renovation_nature',
				'csc.form.sections.areas.sections.rooms.fields.renovation_nature', 'naturedestravauxdernovation', 'data_pieces',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.pc_count', 'csc.form.sections.equipment.fields.pc_count', 'q6_01_computers',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.server_count', 'csc.form.sections.equipment.fields.server_count',
				'q6_02_serveurs', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.printer_count', 'csc.form.sections.equipment.fields.printer_count',
				'q6_03_printers', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.scanner_count', 'csc.form.sections.equipment.fields.scanner_count',
				'q6_4_scanners', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.inverter_count', 'csc.form.sections.equipment.fields.inverter_count',
				'q6_5_onduleur', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.ac_count', 'csc.form.sections.equipment.fields.ac_count',
				'q6_6_climatiseur', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.fan_count', 'csc.form.sections.equipment.fields.fan_count',
				'q6_7_ventilateur', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.projector_count', 'csc.form.sections.equipment.fields.projector_count',
				'q6_8_video_projecteur', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.office_table_count',
				'csc.form.sections.equipment.fields.office_table_count', 'q6_9_tablea_bureau', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.chair_count', 'csc.form.sections.equipment.fields.chair_count',
				'q6_10_chaise', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.tablet_count', 'csc.form.sections.equipment.fields.tablet_count',
				'q6_11_tablets', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.equipment.fields.car_count', 'csc.form.sections.equipment.fields.car_count', 'q6_12_car',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.external_service_from_cr',
				'csc.form.sections.digitization.fields.external_service_from_cr', 'q7_1_autre_system', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.external_cr_uses_internet',
				'csc.form.sections.digitization.fields.external_cr_uses_internet', 'q7_1a_utilise_internet', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.has_cs_software',
				'csc.form.sections.digitization.fields.has_cs_software', 'q7_2_logiciel_ec', 'data', 'csc', 'character varying',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.cs_software_name',
				'csc.form.sections.digitization.fields.cs_software_name', 'q7_2a_nom_system_ec', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.cs_software_license_sponsor',
				'csc.form.sections.digitization.fields.cs_software_license_sponsor', 'q7_3_system', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.other_cs_software_license_sponsor',
				'csc.form.sections.digitization.fields.other_cs_software_license_sponsor',
				'autre_cadre_d_acquisition_du_syst_me', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.users_receive_digital_acts',
				'csc.form.sections.digitization.fields.users_receive_digital_acts', 'q7_4_remise_acte', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.software_activation_date',
				'csc.form.sections.digitization.fields.software_activation_date', 'q7_5_date_mise_service', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.software_feedback',
				'csc.form.sections.digitization.fields.software_feedback', 'q7_6_avis_fonctionnalite', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.software_trained_user_count',
				'csc.form.sections.digitization.fields.software_trained_user_count', 'q7_7_nbre_personne_formes', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.software_recorded_births_count',
				'csc.form.sections.digitization.fields.software_recorded_births_count', 'q7_8a_nbr_naissance_enregistre',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.software_recorded_marriage_count',
				'csc.form.sections.digitization.fields.software_recorded_marriage_count', 'q7_8b_nbr_mariage_enregistres',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.software_recorded_death_count',
				'csc.form.sections.digitization.fields.software_recorded_death_count', 'q7_8c_nbr_deces_enregistres_00', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.is_software_functioning',
				'csc.form.sections.digitization.fields.is_software_functioning', 'q7_9_logiciel_fonctionne', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.digitization.fields.software_non_functioning_reason',
				'csc.form.sections.digitization.fields.software_non_functioning_reason', 'q7_9a_raison_non_fonctionnemen',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.extra.fields.validation_code', 'csc.form.sections.extra.fields.validation_code',
				'code_de_validation', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.extra.fields.relevant_info', 'csc.form.sections.extra.fields.relevant_info',
				'q14_01_relevant_infos', 'data', 'csc', 'text', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.records_scanned',
				'csc.form.sections.record_indexing.fields.records_scanned', 'q72_acte_numerise', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.staff_trained',
				'csc.form.sections.record_indexing.fields.staff_trained', 'q72_2_formation_agent_numerisa', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.document_scan_start_date',
				'csc.form.sections.record_indexing.fields.document_scan_start_date', 'quelle_est_l_ann_e_de_d_but_de', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.data_indexed',
				'csc.form.sections.record_indexing.fields.data_indexed', 'q72_4_donnee_indexe', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.births_scanned',
				'csc.form.sections.record_indexing.fields.births_scanned', 'q72_5a_naissance_scanne', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.marriages_scanned',
				'csc.form.sections.record_indexing.fields.marriages_scanned', 'q72_5b_mariage_scanne', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.deaths_scanned',
				'csc.form.sections.record_indexing.fields.deaths_scanned', 'q72_5c_mariage_scanne', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.births_indexed',
				'csc.form.sections.record_indexing.fields.births_indexed', 'q72_6a_naissance_indexe', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.marriages_indexed',
				'csc.form.sections.record_indexing.fields.marriages_indexed', 'q72_6b_deces_indexe', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.deaths_indexed',
				'csc.form.sections.record_indexing.fields.deaths_indexed', 'q72_6c_deces_indexe', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.is_data_used_by_csc',
				'csc.form.sections.record_indexing.fields.is_data_used_by_csc', 'q72_7_utilisation_donnees', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_indexing.fields.data_usage', 'csc.form.sections.record_indexing.fields.data_usage',
				'q7_8_comment_utilisation_donne', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_procurement.fields.has_there_been_lack_off_registers',
				'csc.form.sections.record_procurement.fields.has_there_been_lack_off_registers', 'q8_1_rupture', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_procurement.fields.records_provider',
				'csc.form.sections.record_procurement.fields.records_provider', 'q8_2_approvisionnement', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_procurement.fields.other_records_provider',
				'csc.form.sections.record_procurement.fields.other_records_provider',
				'autre_source_d_appro_nnement_en_registres', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_procurement.fields.uses_non_compliant_reigsters',
				'csc.form.sections.record_procurement.fields.uses_non_compliant_reigsters', 'q8_3_achat_registre', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_procurement.fields.blank_births',
				'csc.form.sections.record_procurement.fields.blank_births', 'q8_4a_naissance_vierge', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_procurement.fields.blank_marriages',
				'csc.form.sections.record_procurement.fields.blank_marriages', 'q8_4b_mariage_vierge', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.record_procurement.fields.blank_deaths',
				'csc.form.sections.record_procurement.fields.blank_deaths', 'q8_4c_deces_vierge', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.birth_cert_cost',
				'csc.form.sections.financial_stats.fields.birth_cert_cost', 'q9_11_extrait_naissance', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.birth_cert_copy_cost',
				'csc.form.sections.financial_stats.fields.birth_cert_copy_cost', 'q9_12_copie_naissance', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.marriage_cert_copy_cost',
				'csc.form.sections.financial_stats.fields.marriage_cert_copy_cost', 'q9_13_copie_mariage', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.death_cert_copy_cost',
				'csc.form.sections.financial_stats.fields.death_cert_copy_cost', 'q9_14_copie_deces', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.celibacy_cert_copy_cost',
				'csc.form.sections.financial_stats.fields.celibacy_cert_copy_cost', 'q9_15_celibat', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.non_registered_certs',
				'csc.form.sections.financial_stats.fields.non_registered_certs', 'q9_16_non_inscription', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.rates_under_deliberation',
				'csc.form.sections.financial_stats.fields.rates_under_deliberation', 'q9_3_deliberation_tarif', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.prices_displayed',
				'csc.form.sections.financial_stats.fields.prices_displayed', 'q9_4_tarif_affiches', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.municipality_budget_2024',
				'csc.form.sections.financial_stats.fields.municipality_budget_2024', 'q9_5_budget_2024', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.financial_stats.fields.cs_budget_2024',
				'csc.form.sections.financial_stats.fields.cs_budget_2024', 'q9_6_budget_ec_2024', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.has_archiving_room',
				'csc.form.sections.archiving_function.sections.general.fields.has_archiving_room', 'q10_1_salle_archive',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.archive_room_electric_condition',
				'csc.form.sections.archiving_function.sections.general.fields.archive_room_electric_condition',
				'q10_2_etat_electricite', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.has_fire_extinguisher',
				'csc.form.sections.archiving_function.sections.general.fields.has_fire_extinguisher', 'q10_3_extincteur',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.locked_door',
				'csc.form.sections.archiving_function.sections.general.fields.locked_door', 'q10_4_ferme_cle', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.is_archive_room_access_limited',
				'csc.form.sections.archiving_function.sections.general.fields.is_archive_room_access_limited',
				'q10_5_acces_limite', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.room_has_humidity',
				'csc.form.sections.archiving_function.sections.general.fields.room_has_humidity', 'q10_6_humidite', 'data',
				'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.register_archiving_type',
				'csc.form.sections.archiving_function.sections.general.fields.register_archiving_type', 'q10_7_mode_archivage',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.other_archiving_type',
				'csc.form.sections.archiving_function.sections.general.fields.other_archiving_type',
				'autre_mode_d_archivage_des_registres', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.has_written_archiving_plan',
				'csc.form.sections.archiving_function.sections.general.fields.has_written_archiving_plan',
				'q10_8_plan_archivage', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.are_registers_deposited',
				'csc.form.sections.archiving_function.sections.general.fields.are_registers_deposited',
				'q10_9_registres_sous_prefectur', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.are_registers_deposited_systematically',
				'csc.form.sections.archiving_function.sections.general.fields.are_registers_deposited_systematically',
				'q10_10_registre_transmis_mairi', 'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.is_vandalized',
				'csc.form.sections.archiving_function.sections.general.fields.is_vandalized', 'q10_11_archive_vandalise',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.general.fields.vandalization_date',
				'csc.form.sections.archiving_function.sections.general.fields.vandalization_date', 'q10_11b_decrire_contexte',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.archive_stats.fields.year',
				'csc.form.sections.archiving_function.sections.archive_stats.fields.year', 'q12_1_annee', 'data_archives',
				'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.archive_stats.fields.index',
				'csc.form.sections.archiving_function.sections.archive_stats.fields.index', '_index', 'data_archives', 'csc',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.archive_stats.fields.birth_count',
				'csc.form.sections.archiving_function.sections.archive_stats.fields.birth_count', 'q12_2_naissance',
				'data_archives', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.archive_stats.fields.marriage_count',
				'csc.form.sections.archiving_function.sections.archive_stats.fields.marriage_count', 'q12_3_mariage',
				'data_archives', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.archiving_function.sections.archive_stats.fields.death_count',
				'csc.form.sections.archiving_function.sections.archive_stats.fields.death_count', 'q12_4_deces',
				'data_archives', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.deeds.fields.birth_certs_not_withdrawn',
				'csc.form.sections.deeds.fields.birth_certs_not_withdrawn', 'actesdenaissancenonretirs', 'data_statistiques',
				'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.deeds.fields.marriage_certs_drawn', 'csc.form.sections.deeds.fields.marriage_certs_drawn',
				'actesdemariagedresss', 'data_statistiques', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.deeds.fields.index', 'csc.form.sections.deeds.fields.index', '_index', 'data_statistiques',
				'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.deeds.fields.marriage_certs_not_withdrawn',
				'csc.form.sections.deeds.fields.marriage_certs_not_withdrawn', 'actesdemariagenonretirs', 'data_statistiques',
				'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.deeds.fields.birth_certs_drawn', 'csc.form.sections.deeds.fields.birth_certs_drawn',
				'actesdenaissancedresss', 'data_statistiques', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.deeds.fields.death_certs_drawn', 'csc.form.sections.deeds.fields.death_certs_drawn',
				'actesdedcsdresss', 'data_statistiques', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.deeds.fields.death_certs_not_withdrawn',
				'csc.form.sections.deeds.fields.death_certs_not_withdrawn', 'actesdedcsnonretirs', 'data_statistiques', 'csc',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.general.fields.male_count',
				'csc.form.sections.employees.sections.general.fields.male_count', 'q13_1a_off_homme', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.general.fields.female_count',
				'csc.form.sections.employees.sections.general.fields.female_count', 'q13_1b_off_femme', 'data', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.general.fields.non_officer_male_count',
				'csc.form.sections.employees.sections.general.fields.non_officer_male_count', 'q13_2a_staff_etatcivil_homme_f',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.general.fields.non_officer_female_count',
				'csc.form.sections.employees.sections.general.fields.non_officer_female_count', 'q13_2b_staff_etatcivil_femme',
				'data', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.index',
				'csc.form.sections.employees.sections.officers.fields.index', '_index', 'data_personnel', 'csc', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.name',
				'csc.form.sections.employees.sections.officers.fields.name', 'q131_1_name', 'data_personnel', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.position',
				'csc.form.sections.employees.sections.officers.fields.position', 'q131_2_fonction', 'data_personnel', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.other_position',
				'csc.form.sections.employees.sections.officers.fields.other_position', 'q131_2a_autre_fonction',
				'data_personnel', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.prof_status',
				'csc.form.sections.employees.sections.officers.fields.prof_status', 'q131_2a_statut_professionnel',
				'data_personnel', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.other_prof_status',
				'csc.form.sections.employees.sections.officers.fields.other_prof_status', 'autre_statut_professionnel',
				'data_personnel', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.gender',
				'csc.form.sections.employees.sections.officers.fields.gender', 'q131_03_sex', 'data_personnel', 'csc',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.phone',
				'csc.form.sections.employees.sections.officers.fields.phone', 'q131_4_phone', 'data_personnel', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.age',
				'csc.form.sections.employees.sections.officers.fields.age', 'q131_5_age', 'data_personnel', 'csc', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.email',
				'csc.form.sections.employees.sections.officers.fields.email', 'q131_6_adresse_mail', 'data_personnel', 'csc',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.ed_level',
				'csc.form.sections.employees.sections.officers.fields.ed_level', 'q131_7_education_level_attain',
				'data_personnel', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.computer_level',
				'csc.form.sections.employees.sections.officers.fields.computer_level', 'q131_8_niveau_informatique',
				'data_personnel', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.ec_training',
				'csc.form.sections.employees.sections.officers.fields.ec_training', 'q131_9_formation_ec', 'data_personnel',
				'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.archive_training',
				'csc.form.sections.employees.sections.officers.fields.archive_training', 'q131_10_formation_archivage',
				'data_personnel', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.computer_training',
				'csc.form.sections.employees.sections.officers.fields.computer_training', 'q131_11_formation_informatique',
				'data_personnel', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.cs_seniority',
				'csc.form.sections.employees.sections.officers.fields.cs_seniority', 'q131_12_nombre_ancienne_ec',
				'data_personnel', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.employees.sections.officers.fields.monthly_salary',
				'csc.form.sections.employees.sections.officers.fields.monthly_salary', 'q131_13_indemnites_2023',
				'data_personnel', 'csc', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.respondent.fields.name', 'chefferie.form.sections.respondent.fields.name',
				'q0_02_name', 'data', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.respondent.fields.position', 'chefferie.form.sections.respondent.fields.position',
				'q0_01_position', 'data', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.respondent.fields.phone', 'chefferie.form.sections.respondent.fields.phone',
				'q0_03_phone', 'data', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.respondent.fields.email', 'chefferie.form.sections.respondent.fields.email',
				'q0_04_mail', 'data', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.respondent.fields.creation_date',
				'chefferie.form.sections.respondent.fields.creation_date', 'q0_06_date_creation', 'data', 'chefferie', 'date',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.identification.fields.division',
				'chefferie.form.sections.identification.fields.division', 'q1_02_division', 'data', 'chefferie', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.identification.fields.municipality',
				'chefferie.form.sections.identification.fields.municipality', 'q1_03_municipality', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.identification.fields.quarter',
				'chefferie.form.sections.identification.fields.quarter', 'q1_04_quater', 'data', 'chefferie',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.identification.fields.facility_name',
				'chefferie.form.sections.identification.fields.facility_name', 'q1_12_officename', 'data', 'chefferie',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.identification.fields.degree', 'chefferie.form.sections.identification.fields.degree',
				'degre', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.identification.fields.cs_proximity',
				'chefferie.form.sections.identification.fields.cs_proximity', 'q1_08_dist_from_health_facil', 'data',
				'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.identification.fields.gps_coords',
				'chefferie.form.sections.identification.fields.gps_coords', 'q1_13_gps_coordinates', 'data_personnel',
				'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.general.fields.is_chief_officer',
				'chefferie.form.sections.services.sections.general.fields.is_chief_officer',
				'est_ce_que_vous_util_formation_sanitaire_', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.general.fields.is_oath_taken',
				'chefferie.form.sections.services.sections.general.fields.is_oath_taken', 'serment', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.general.fields.records_location',
				'chefferie.form.sections.services.sections.general.fields.records_location',
				'une_formation_a_t_el_e_normalis_du_dhis2', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.general.fields.other_records_location',
				'chefferie.form.sections.services.sections.general.fields.other_records_location', 'autre_lieu_conservation',
				'data', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.general.fields.officer_trained_cs',
				'chefferie.form.sections.services.sections.general.fields.officer_trained_cs',
				'transmettez_vous_les_u_centre_d_tat_civil', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.general.fields.has_waiting_room',
				'chefferie.form.sections.services.sections.general.fields.has_waiting_room',
				'est_ce_qu_il_y_a_un_le_pour_les_usagers_', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.general.fields.toilets_accessible',
				'chefferie.form.sections.services.sections.general.fields.toilets_accessible', 'toilettes_accessible_usager',
				'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.equipment.fields.pc_count',
				'chefferie.form.sections.services.sections.equipment.fields.pc_count', 'q9_02_computers', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.equipment.fields.printer_count',
				'chefferie.form.sections.services.sections.equipment.fields.printer_count', 'q9_03_printers', 'data',
				'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.equipment.fields.tablet_count',
				'chefferie.form.sections.services.sections.equipment.fields.tablet_count', 'q9_04_tablets', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.equipment.fields.car_count',
				'chefferie.form.sections.services.sections.equipment.fields.car_count', 'q9_10_car', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.services.sections.equipment.fields.bike_count',
				'chefferie.form.sections.services.sections.equipment.fields.bike_count', 'q9_11_mopeds', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.is_residence', 'chefferie.form.sections.infra.fields.is_residence',
				'q4_01_residence', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.has_internet', 'chefferie.form.sections.infra.fields.has_internet',
				'q4_02_broadband_conn_available', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.conn_type', 'chefferie.form.sections.infra.fields.conn_type',
				'q4_03_type_connexion', 'data', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.has_power', 'chefferie.form.sections.infra.fields.has_power',
				'q4_04_electricite', 'data', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.has_water_source',
				'chefferie.form.sections.infra.fields.has_water_source', 'q6_09aalimentation_eau', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.water_sources', 'chefferie.form.sections.infra.fields.water_sources',
				'q6_09b_type_eau', 'data', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.other_water_source',
				'chefferie.form.sections.infra.fields.other_water_source', 'autre_source_d_alime_u_potable_disponible', 'data',
				'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.infra.fields.has_fire_extinguisher',
				'chefferie.form.sections.infra.fields.has_fire_extinguisher', 'q4_07_extincteur_fon', 'data', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.general.fields.employee_count',
				'chefferie.form.sections.personnel_status.general.fields.employee_count', 'q5_01_employees_at_site', 'data',
				'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.index',
				'chefferie.form.sections.personnel_status.employees.fields.index', '_index', 'data_personnel', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.name',
				'chefferie.form.sections.personnel_status.employees.fields.name', 'q12_01_name', 'data_personnel', 'chefferie',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.position',
				'chefferie.form.sections.personnel_status.employees.fields.position', 'q12_02_tittle_position',
				'data_personnel', 'chefferie', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.gender',
				'chefferie.form.sections.personnel_status.employees.fields.gender', 'q12_03_gender', 'data_personnel',
				'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.phone',
				'chefferie.form.sections.personnel_status.employees.fields.phone', 't_l_phone', 'data_personnel', 'chefferie',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.ed_level',
				'chefferie.form.sections.personnel_status.employees.fields.ed_level', 'q12_08_education_level_attaine',
				'data_personnel', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.has_cs_training',
				'chefferie.form.sections.personnel_status.employees.fields.has_cs_training',
				'avez_vous_re_u_une_f_ion_sur_l_tat_civil_', 'data_personnel', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.computer_level',
				'chefferie.form.sections.personnel_status.employees.fields.computer_level', 'niveau_en_informatique',
				'data_personnel', 'chefferie', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.personnel_status.employees.fields.age',
				'chefferie.form.sections.personnel_status.employees.fields.age', 'age_en_ann_es', 'data_personnel', 'chefferie',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.comments.fields.relevant_info',
				'chefferie.form.sections.comments.fields.relevant_info', 'q14_01_relevant_infos', 'data', 'chefferie',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('chefferie.form.sections.comments.fields.validation_code',
				'chefferie.form.sections.comments.fields.validation_code', 'q14_02_validation_code', 'data', 'chefferie',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.respondent.fields.names', 'fosa.form.sections.respondent.fields.names', 'q0_02_name',
				'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.respondent.fields.device', 'fosa.form.sections.respondent.fields.device',
				'a_partir_de_quel_app_us_le_questionnaire_', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.respondent.fields.position', 'fosa.form.sections.respondent.fields.position',
				'q0_01_position', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.respondent.fields.phone', 'fosa.form.sections.respondent.fields.phone', 'q0_03_phone',
				'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.respondent.fields.email', 'fosa.form.sections.respondent.fields.email', 'q0_04_mail',
				'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.respondent.fields.knows_creation_date',
				'fosa.form.sections.respondent.fields.knows_creation_date', 'q0_05_know_date_creation', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.respondent.fields.creation_date', 'fosa.form.sections.respondent.fields.creation_date',
				'q0_06_date_creation', 'data', 'fosa', 'date', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.division', 'fosa.form.sections.identification.fields.division',
				'q1_02_division', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.municipality',
				'fosa.form.sections.identification.fields.municipality', 'q1_03_municipality', 'data', 'fosa', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.quarter', 'fosa.form.sections.identification.fields.quarter',
				'q1_04_quater', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.locality', 'fosa.form.sections.identification.fields.locality',
				'q1_05_locality', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.facility_name',
				'fosa.form.sections.identification.fields.facility_name', 'q1_12_officename', 'data', 'fosa',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.district', 'fosa.form.sections.identification.fields.district',
				'ds_rattachement', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.health_area', 'fosa.form.sections.identification.fields.health_area',
				'as_rattachement', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.milieu', 'fosa.form.sections.identification.fields.milieu', 'milieu',
				'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.category', 'fosa.form.sections.identification.fields.category',
				'q1_07_type_healt_facility', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.other_category',
				'fosa.form.sections.identification.fields.other_category', 'autre_cat_gorie', 'data', 'fosa',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.status', 'fosa.form.sections.identification.fields.status',
				'statut_de_la_fosa', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.has_maternity',
				'fosa.form.sections.identification.fields.has_maternity', 'existence_d_une_maternit_dans_la_fosa', 'data',
				'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.attached_cs', 'fosa.form.sections.identification.fields.attached_cs',
				'cec_rattachement', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.cs_proximity',
				'fosa.form.sections.identification.fields.cs_proximity', 'q1_08_dist_from_health_facil', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.knows_gps_coords',
				'fosa.form.sections.identification.fields.knows_gps_coords', 'q1_9a_possibilite_localisation', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.identification.fields.gps_coords', 'fosa.form.sections.identification.fields.gps_coords',
				'q1_13_gps_coordinates', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.reg_cs_events.fields.dhis2_usage', 'fosa.form.sections.reg_cs_events.fields.dhis2_usage',
				'est_ce_que_vous_util_formation_sanitaire_', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.reg_cs_events.fields.uses_bunec_birth_form',
				'fosa.form.sections.reg_cs_events.fields.uses_bunec_birth_form', 'est_ce_que_la_fosa_e_fourni_par_le_bunec',
				'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.reg_cs_events.fields.dhis2_form_training',
				'fosa.form.sections.reg_cs_events.fields.dhis2_form_training', 'une_formation_a_t_el_e_normalis_du_dhis2',
				'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.reg_cs_events.fields.birth_declaration_transmission_to_csc',
				'fosa.form.sections.reg_cs_events.fields.birth_declaration_transmission_to_csc',
				'transmettez_vous_les_u_centre_d_tat_civil', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.reg_cs_events.fields.csc_event_reg_type',
				'fosa.form.sections.reg_cs_events.fields.csc_event_reg_type', 'sous_quelles_formes_s_faits_d_tat_civil_',
				'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_1.fields.stats_year_1', 'fosa.form.sections.stats.line_1.fields.stats_year_1',
				'group_ce1sz98_ligne_note', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_1.fields.stats_births_1',
				'fosa.form.sections.stats.line_1.fields.stats_births_1', 'group_ce1sz98_ligne_colonne', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_1.fields.stats_deaths_1',
				'fosa.form.sections.stats.line_1.fields.stats_deaths_1', 'group_ce1sz98_ligne_colonne_1', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_2.fields.stats_year_2', 'fosa.form.sections.stats.line_2.fields.stats_year_2',
				'group_ce1sz98_ligne_1_note', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_2.fields.stats_births_2',
				'fosa.form.sections.stats.line_2.fields.stats_births_2', 'group_ce1sz98_ligne_1_colonne', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_2.fields.stats_deaths_2',
				'fosa.form.sections.stats.line_2.fields.stats_deaths_2', 'group_ce1sz98_ligne_1_colonne_1', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_3.fields.stats_year_3', 'fosa.form.sections.stats.line_3.fields.stats_year_3',
				'group_ce1sz98_ligne_2_note', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_3.fields.stats_births_3',
				'fosa.form.sections.stats.line_3.fields.stats_births_3', 'group_ce1sz98_ligne_2_colonne', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_3.fields.stats_deaths_3',
				'fosa.form.sections.stats.line_3.fields.stats_deaths_3', 'group_ce1sz98_ligne_2_colonne_1', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_4.fields.stats_year_4', 'fosa.form.sections.stats.line_4.fields.stats_year_4',
				'group_ce1sz98_ligne_3_note', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_4.fields.stats_births_4',
				'fosa.form.sections.stats.line_4.fields.stats_births_4', 'group_ce1sz98_ligne_3_colonne', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_4.fields.stats_deaths_4',
				'fosa.form.sections.stats.line_4.fields.stats_deaths_4', 'group_ce1sz98_ligne_3_colonne_1', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_5.fields.stats_year_5', 'fosa.form.sections.stats.line_5.fields.stats_year_5',
				'group_ce1sz98_ligne_4_note', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_5.fields.stats_births_5',
				'fosa.form.sections.stats.line_5.fields.stats_births_5', 'group_ce1sz98_ligne_4_colonne', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.stats.line_5.fields.stats_deaths_5',
				'fosa.form.sections.stats.line_5.fields.stats_deaths_5', 'group_ce1sz98_ligne_4_colonne_1', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.fields.toilet_present', 'fosa.form.sections.infra.fields.toilet_present',
				'q6_10_bathroom_or_outhouse', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.fields.eneo_connection', 'fosa.form.sections.infra.fields.eneo_connection',
				'q7_01_facility_conn_power_grid', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.fields.backup_power_available',
				'fosa.form.sections.infra.fields.backup_power_available', 'q7_04_any_source_of_backup', 'data', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.fields.backup_power', 'fosa.form.sections.infra.fields.backup_power',
				'q7_05_sources_of_backup_power', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.fields.has_internet', 'fosa.form.sections.infra.fields.has_internet',
				'q7_08_broadband_conn_available', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.fields.water_source_available',
				'fosa.form.sections.infra.fields.water_source_available', 'q6_09aalimentation_eau', 'data', 'fosa', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.fields.water_sources', 'fosa.form.sections.infra.fields.water_sources',
				'q6_09b_type_eau', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.sections.eq.fields.pc_count', 'fosa.form.sections.infra.sections.eq.fields.pc_count',
				'q9_02_computers', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.sections.eq.fields.printer_count',
				'fosa.form.sections.infra.sections.eq.fields.printer_count', 'q9_03_printers', 'data', 'fosa', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.sections.eq.fields.tablet_count',
				'fosa.form.sections.infra.sections.eq.fields.tablet_count', 'q9_04_tablets', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.sections.eq.fields.car_count',
				'fosa.form.sections.infra.sections.eq.fields.car_count', 'q9_10_car', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.infra.sections.eq.fields.bike_count',
				'fosa.form.sections.infra.sections.eq.fields.bike_count', 'q9_11_mopeds', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.fields.employee_count', 'fosa.form.sections.staff.fields.employee_count',
				'q11_01_employees_at_site', 'data', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.index',
				'fosa.form.sections.staff.sections.employees.fields.index', '_index', 'data_personnel', 'fosa', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.names',
				'fosa.form.sections.staff.sections.employees.fields.names', 'q12_01_name', 'data_personnel', 'fosa',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.age',
				'fosa.form.sections.staff.sections.employees.fields.age', 'age_en_ann_es', 'data_personnel', 'fosa', 'integer',
				DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.computer_level',
				'fosa.form.sections.staff.sections.employees.fields.computer_level', 'niveau_en_informatique', 'data_personnel',
				'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.ed_level',
				'fosa.form.sections.staff.sections.employees.fields.ed_level', 'q12_08_education_level_attaine',
				'data_personnel', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.gender',
				'fosa.form.sections.staff.sections.employees.fields.gender', 'q12_03_gender', 'data_personnel', 'fosa',
				'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.has_cs_training',
				'fosa.form.sections.staff.sections.employees.fields.has_cs_training',
				'avez_vous_re_u_une_f_ion_sur_l_tat_civil_', 'data_personnel', 'fosa', 'integer', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.phone',
				'fosa.form.sections.staff.sections.employees.fields.phone', 't_l_phone', 'data_personnel', 'fosa',
				'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.staff.sections.employees.fields.position',
				'fosa.form.sections.staff.sections.employees.fields.position', 'q12_02_tittle_position', 'data_personnel',
				'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.sections.extras.fields.relevant_info', 'fosa.form.sections.extras.fields.relevant_info',
				'q14_01_relevant_infos', 'data', 'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('fosa.form.fields.validation_code', 'fosa.form.fields.validation_code', 'q14_02_validation_code', 'data',
				'fosa', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings
VALUES ('csc.form.sections.areas.sections.rooms.fields.name', 'csc.form.sections.areas.sections.rooms.fields.name',
				'nomdelapice', 'data_pieces', 'csc', 'character varying', DEFAULT)
ON CONFLICT DO NOTHING;
