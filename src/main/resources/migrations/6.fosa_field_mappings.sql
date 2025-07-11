--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: form_field_mappings; Type: TABLE DATA; Schema: civilio; Owner: postgres
--

INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.phone.title', 'fosa.form.fields.phone.title', 'q0_03_phone', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.position.title', 'fosa.form.fields.position.title', 'q0_01_position', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.email.title', 'fosa.form.fields.email.title', 'q0_04_mail', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.communes.title', 'fosa.form.fields.communes.title', 'q1_03_municipality', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.creation_date.description', 'fosa.form.fields.creation_date.description', 'q0_06_date_creation', 'data_fosa', 'fosa', 'date') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.department.description', 'fosa.form.fields.department.description', 'q1_02_division', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.quarter.title', 'fosa.form.fields.quarter.title', 'q1_04_quater', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.locality.title', 'fosa.form.fields.locality.title', 'q1_05_locality', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.fosa_name.title', 'fosa.form.fields.fosa_name.title', 'q1_12_officename', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.district.title', 'fosa.form.fields.district.title', 'ds_rattachement', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.health_area.title', 'fosa.form.fields.health_area.title', 'as_rattachement', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.fosa_type.title', 'fosa.form.fields.fosa_type.title', 'q1_07_type_healt_facility', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.environment.title', 'fosa.form.fields.environment.title', 'milieu', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.fosa_status.title', 'fosa.form.fields.fosa_status.title', 'statut_de_la_fosa', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.has_maternity.title', 'fosa.form.fields.has_maternity.title', 'existence_d_une_maternit_dans_la_fosa', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.distance_csc.title', 'fosa.form.fields.distance_csc.title', 'q1_08_dist_from_health_facil', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.csc_reg.title', 'fosa.form.fields.csc_reg.title', 'cec_rattachement', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.sections.geo_point.title', 'fosa.form.sections.geo_point.title', 'q1_13_gps_coordinates', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.printer_count.title', 'fosa.form.fields.printer_count.title', 'q9_03_printers', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.uses_bunec_birth_form.title', 'fosa.form.fields.uses_bunec_birth_form.title', 'est_ce_que_la_fosa_e_fourni_par_le_bunec', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.birth_declaration_transmission_to_csc.title', 'fosa.form.fields.birth_declaration_transmission_to_csc.title', 'transmettez_vous_les_u_centre_d_tat_civil', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.csc_event_reg_type.title', 'fosa.form.fields.csc_event_reg_type.title', 'sous_quelles_formes_s_faits_d_tat_civil_', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.has_eneo_connection.title', 'fosa.form.fields.has_eneo_connection.title', 'q7_01_facility_conn_power_grid', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.deaths.2', 'fosa.columns.deaths.2', 'group_ce1sz98_ligne_1_colonne_1', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.alternative_power.title', 'fosa.form.fields.alternative_power.title', 'q7_05_sources_of_backup_power', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.internet_conn.title', 'fosa.form.fields.internet_conn.title', 'q7_08_broadband_conn_available', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.has_water_source.title', 'fosa.form.fields.has_water_source.title', 'q6_09aalimentation_eau', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.pc_count.title', 'fosa.form.fields.pc_count.title', 'q9_02_computers', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.water_source.title', 'fosa.form.fields.water_source.title', 'q6_09b_type_eau', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.uses_dhis2_form.title', 'fosa.form.fields.uses_dhis2_form.title', 'une_formation_a_t_el_e_normalis_du_dhis2', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.bike_count.title', 'fosa.form.fields.bike_count.title', 'q9_11_mopeds', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.role.title', 'data_personnel.columns.role.title', 'q12_02_tittle_position', 'data_personnel', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.car_count.title', 'fosa.form.fields.car_count.title', 'q9_10_car', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.key_personnel_count.title', 'fosa.form.fields.key_personnel_count.title', 'q11_01_employees_at_site', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.name.title', 'data_personnel.columns.name.title', 'q12_01_name', 'data_personnel', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.gender.title', 'data_personnel.columns.gender.title', 'q12_03_gender', 'data_personnel', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.has_cs_training.title', 'data_personnel.columns.has_cs_training.title', 'avez_vous_re_u_une_f_ion_sur_l_tat_civil_', 'data_personnel', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.education_level.title', 'data_personnel.columns.education_level.title', 'q12_08_education_level_attaine', 'data_personnel', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.pc_knowledge.title', 'data_personnel.columns.pc_knowledge.title', 'niveau_en_informatique', 'data_personnel', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.births.1', 'fosa.columns.births.1', 'group_ce1sz98_ligne_colonne', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.deaths.1', 'fosa.columns.deaths.1', 'group_ce1sz98_ligne_colonne_1', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.has_power_source.title', 'fosa.form.fields.has_power_source.title', 'q7_04_any_source_of_backup', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.year.3', 'fosa.columns.year.3', 'group_ce1sz98_ligne_2_note', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.deaths.5', 'fosa.columns.deaths.5', 'group_ce1sz98_ligne_4_colonne_1', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.tablet_count.title', 'fosa.form.fields.tablet_count.title', 'q9_04_tablets', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.index', 'fosa.form.fields.index', '_index', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.names.title', 'fosa.form.fields.names.title', 'q0_02_name', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.validation_code', 'fosa.form.fields.validation_code', 'q14_02_validation_code', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.responding_device.title', 'fosa.form.fields.responding_device.title', 'a_partir_de_quel_app_us_le_questionnaire_', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.dhis2_usage.title', 'fosa.form.fields.dhis2_usage.title', 'est_ce_que_vous_util_formation_sanitaire_', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.form.fields.toilet_present.title', 'fosa.form.fields.toilet_present.title', 'q6_10_bathroom_or_outhouse', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.index', 'chefferie.form.fields.index', '_index', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.phone.title', 'data_personnel.columns.phone.title', 't_l_phone', 'data_personnel', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_personnel.columns.age.title', 'data_personnel.columns.age.title', 'age_en_ann_es', 'data_personnel', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.year.1', 'fosa.columns.year.1', 'group_ce1sz98_ligne_note', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.year.2', 'fosa.columns.year.2', 'group_ce1sz98_ligne_1_note', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.equipment_quantity.cars', 'chefferie.form.fields.equipment_quantity.cars', 'q9_10_car', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.births.3', 'fosa.columns.births.3', 'group_ce1sz98_ligne_2_colonne', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.year.4', 'fosa.columns.year.4', 'group_ce1sz98_ligne_3_note', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.deaths.3', 'fosa.columns.deaths.3', 'group_ce1sz98_ligne_2_colonne_1', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.births.4', 'fosa.columns.births.4', 'group_ce1sz98_ligne_3_colonne', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.year.5', 'fosa.columns.year.5', 'group_ce1sz98_ligne_4_note', 'data_fosa', 'fosa', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.waterAcces.title', 'chefferie.form.fields.waterAcces.title', 'q6_09aalimentation_eau', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.births.5', 'fosa.columns.births.5', 'group_ce1sz98_ligne_4_colonne', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.phone.title', 'data_chefferie_personnel.columns.phone.title', 't_l_phone', 'data_chefferie_personnel', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.names.title', 'chefferie.form.fields.names.title', 'q0_02_name', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.phone.title', 'chefferie.form.fields.phone.title', 'q0_03_phone', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.email.title', 'chefferie.form.fields.email.title', 'q0_04_mail', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.department.title', 'chefferie.form.fields.department.title', 'q1_02_division', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.communes.title', 'chefferie.form.fields.communes.title', 'q1_03_municipality', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.quarter.title', 'chefferie.form.fields.quarter.title', 'q1_04_quater', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.distance.title', 'chefferie.form.fields.distance.title', 'q1_08_dist_from_health_facil', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.facility_name.title', 'chefferie.form.fields.facility_name.title', 'q1_12_officename', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.classification.title', 'chefferie.form.fields.classification.title', 'degre', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.cs_actor_is_chief.title', 'chefferie.form.fields.cs_actor_is_chief.title', 'est_ce_que_vous_util_formation_sanitaire_', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.cs_reg_location.title', 'chefferie.form.fields.cs_reg_location.title', 'une_formation_a_t_el_e_normalis_du_dhis2', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.sections.geo_point.title', 'chefferie.form.sections.geo_point.title', 'q1_13_gps_coordinates', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.waiting_room.title', 'chefferie.form.fields.waiting_room.title', 'est_ce_qu_il_y_a_un_le_pour_les_usagers_', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.other_cs_reg_location.title', 'chefferie.form.fields.other_cs_reg_location.title', 'autre_lieu_conservation', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.waterType.title', 'chefferie.form.fields.waterType.title', 'q6_09b_type_eau', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.oath.title', 'chefferie.form.fields.oath.title', 'serment', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.other_water_source.title', 'chefferie.form.fields.other_water_source.title', 'autre_source_d_alime_u_potable_disponible', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.training.title', 'chefferie.form.fields.training.title', 'transmettez_vous_les_u_centre_d_tat_civil', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.toilets_accessible.title', 'chefferie.form.fields.toilets_accessible.title', 'toilettes_accessible_usager', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.equipment_quantity.printers', 'chefferie.form.fields.equipment_quantity.printers', 'q9_03_printers', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.births.2', 'fosa.columns.births.2', 'group_ce1sz98_ligne_1_colonne', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.equipment_quantity.tablets', 'chefferie.form.fields.equipment_quantity.tablets', 'q9_04_tablets', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.equipment_quantity.motorcycles', 'chefferie.form.fields.equipment_quantity.motorcycles', 'q9_11_mopeds', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.connexion.title', 'chefferie.form.fields.connexion.title', 'q4_02_broadband_conn_available', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.eneoConnexion.title', 'chefferie.form.fields.eneoConnexion.title', 'q4_04_electricite', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.structure.title', 'chefferie.form.fields.structure.title', 'q4_01_residence', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('fosa.columns.deaths.4', 'fosa.columns.deaths.4', 'group_ce1sz98_ligne_3_colonne_1', 'data_fosa', 'fosa', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.extinguisher.title', 'chefferie.form.fields.extinguisher.title', 'q4_07_extincteur_fon', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.extra_info.title', 'chefferie.form.fields.extra_info.title', 'q14_01_relevant_infos', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.employer.title', 'chefferie.form.fields.employer.title', 'q5_01_employees_at_site', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.role.title', 'data_chefferie_personnel.columns.role.title', 'q12_02_tittle_position', 'data_chefferie_personnel', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.gender.title', 'data_chefferie_personnel.columns.gender.title', 'q12_03_gender', 'data_chefferie_personnel', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.education_level.title', 'data_chefferie_personnel.columns.education_level.title', 'q12_08_education_level_attaine', 'data_chefferie_personnel', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.name.title', 'data_chefferie_personnel.columns.name.title', 'q12_01_name', 'data_chefferie_personnel', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.validation_code', 'chefferie.form.fields.validation_code', 'q14_02_validation_code', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.age.title', 'data_chefferie_personnel.columns.age.title', 'age_en_ann_es', 'data_chefferie_personnel', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.typeConnexion.title', 'chefferie.form.fields.typeConnexion.title', 'q4_03_type_connexion', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.has_cs_training.title', 'data_chefferie_personnel.columns.has_cs_training.title', 'avez_vous_re_u_une_f_ion_sur_l_tat_civil_', 'data_chefferie_personnel', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('data_chefferie_personnel.columns.pc_knowledge.title', 'data_chefferie_personnel.columns.pc_knowledge.title', 'niveau_en_informatique', 'data_chefferie_personnel', 'chefferie', 'integer') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.position.title', 'chefferie.form.fields.position.title', 'q0_01_position', 'data_chefferie', 'chefferie', 'character varying') ON CONFLICT DO NOTHING;
INSERT INTO civilio.form_field_mappings VALUES ('chefferie.form.fields.equipment_quantity.computers', 'chefferie.form.fields.equipment_quantity.computers', 'q9_02_computers', 'data_chefferie', 'chefferie', 'integer') ON CONFLICT DO NOTHING;


--
-- PostgreSQL database dump complete
--