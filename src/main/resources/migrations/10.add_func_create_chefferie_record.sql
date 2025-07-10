CREATE SEQUENCE civilio.chefferie_id_seq START WITH 457502754;
CREATE SEQUENCE civilio.chefferie_index_seq START WITH 324;
CREATE SEQUENCE civilio.chefferie_personnel_index_seq START WITH 186;

CREATE OR REPLACE FUNCTION civilio.create_chefferie_record() RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index INTEGER;
BEGIN
    INSERT INTO public.data_chefferie (deviceid, q0_02_name, q0_01_position, q1_02_division, q1_03_municipality,
                                       q1_04_quater, q1_12_officename, degre, q1_08_dist_from_health_facil,
                                       est_ce_que_vous_util_formation_sanitaire_,
                                       est_ce_que_vous_util_formation_sanitaire_, toilettes_accessible_usager,
                                       q9_02_computers, q9_03_printers, q9_04_tablets, q9_10_car, q9_11_mopeds,
                                       q4_01_residence, q4_02_broadband_conn_available, q4_03_type_connexion,
                                       q4_03_type_connexion1, q4_03_type_connexion2, q4_03_type_connexion3,
                                       q4_04_electricite, q6_09aalimentation_eau, q4_07_extincteur_fon,
                                       _validation_status,
                                       q5_01_employees_at_site, q14_01_relevant_infos, _id, _uuid, _submission_time,
                                       _status, _version_, _index, q14_02_validation_code,
                                       est_ce_qu_il_y_a_un_le_pour_les_usagers_)
    VALUES ('device_' || EXTRACT(EPOCH FROM NOW())::TEXT, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', '', 'not_approved', 0, '', nextval('civilio.chefferie_id_seq'),
            gen_random_uuid(), CURRENT_DATE, 'submitted_via_civilio', '', nextval('civilio.chefferie_index_seq'), '', 2)
    RETURNING _id INTO new_index;
    RETURN new_index;
END;
$$;

CREATE OR REPLACE FUNCTION civilio.func_create_chefferie_personnel_record(
    IN parent_id INTEGER,
    IN parent_table_name TEXT
)
    RETURNS INTEGER
    LANGUAGE plpgsql AS
$$
DECLARE
    new_index INTEGER := nextval('civilio.chefferie_personnel_index_seq');
BEGIN
    INSERT INTO public.data_chefferie_personnel(q12_02_tittle_position,
                                                q12_03_gender,
                                                t_l_phone, age_en_ann_es, avez_vous_re_u_une_f_ion_sur_l_tat_civil_,
                                                q12_08_education_level_attaine, niveau_en_informatique, _index,
                                                _parent_table_name, _parent_index, _submission_id, _submission_uuid,
                                                _submission_submission_time, _submission_status, _submission_version_,
                                                q1_02_division, q1_03_municipality, degre, q1_13_gps_coordinates,
                                                _q1_13_gps_coordinates_latitude, _q1_13_gps_coordinates_longitude,
                                                _q1_13_gps_coordinates_altitude, _q1_13_gps_coordinates_precision,
                                                est_ce_que_vous_util_formation_sanitaire_)
    VALUES ('', '1', '', 18, 2, 1, 1, new_index, parent_table_name,
            (SELECT _index FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            parent_id,
            (SELECT dc._uuid FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            (SELECT dc._submission_time FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            (SELECT dc._status FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            (SELECT dc._version_ FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            (SELECT dc.q1_02_division FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            (SELECT dc.q1_03_municipality FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            (SELECT dc.degre FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
            COALESCE((SELECT dc.q1_13_gps_coordinates FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1), ''),
            COALESCE(
                    (SELECT dc._q1_13_gps_coordinates_latitude FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
                    ''),
            COALESCE((SELECT dc._q1_13_gps_coordinates_longitude
                      FROM data_chefferie dc
                      WHERE dc._id = parent_id
                      LIMIT 1), ''),
            COALESCE(
                    (SELECT dc._q1_13_gps_coordinates_altitude FROM data_chefferie dc WHERE dc._id = parent_id LIMIT 1),
                    ''),
            COALESCE((SELECT dc._q1_13_gps_coordinates_precision
                      FROM data_chefferie dc
                      WHERE dc._id = parent_id
                      LIMIT 1), ''),
            (SELECT dc.est_ce_que_vous_util_formation_sanitaire_
             FROM data_chefferie dc
             WHERE dc._id = parent_id
             LIMIT 1));
    RETURN new_index;
END;
$$;