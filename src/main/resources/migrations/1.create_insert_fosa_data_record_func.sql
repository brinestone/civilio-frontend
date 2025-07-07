CREATE OR REPLACE FUNCTION civilio.create_fosa_record()
    RETURNS INTEGER AS
$$
DECLARE
    new_index INTEGER;
BEGIN
    INSERT INTO public.data_fosa (start, "end", today, deviceid, a_partir_de_quel_app_us_le_questionnaire_,
                                  q0_02_name, q0_01_position, q0_05_know_date_creation,
                                  q1_02_division, q1_03_municipality, q1_04_quater, q1_05_locality,
                                  q1_12_officename, ds_rattachement, q1_07_type_healt_facility,
                                  statut_de_la_fosa, existence_d_une_maternit_dans_la_fosa,
                                  cec_rattachement, q1_08_dist_from_health_facil, q1_9a_possibilite_localisation,
                                  est_ce_que_vous_util_formation_sanitaire_, une_formation_a_t_el_e_normalis_du_dhis2,
                                  transmettez_vous_les_u_centre_d_tat_civil, sous_quelles_formes_s_faits_d_tat_civil_,
                                  sous_quelles_formes_s_faits_d_tat_civil_1, sous_quelles_formes_s_faits_d_tat_civil_2,
                                  sous_quelles_formes_s_faits_d_tat_civil_3, q9_02_computers, q9_03_printers,
                                  q9_04_tablets, q9_10_car, q9_11_mopeds, q6_10_bathroom_or_outhouse,
                                  q7_01_facility_conn_power_grid, q7_04_any_source_of_backup,
                                  q7_08_broadband_conn_available, q6_09aalimentation_eau,
                                  q14_01_relevant_infos, q14_02_validation_code, _uuid, _submission_time,
                                  _status, _version_, _index, _id)
    VALUES (CURRENT_DATE, CURRENT_DATE, CURRENT_DATE,
            'device_' || EXTRACT(EPOCH FROM NOW())::TEXT, 0,
            '', '', 0, 0, 0, '', '', '', 0, 0, 0, 0, '', 0, 0, 0, 0, 0, '', 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', gen_random_uuid()::TEXT, CURRENT_DATE,
            'not_approved', '1', nextval('civilio.fosa_index_seq')::integer, nextval('civilio.fosa_id_seq')::integer)
    RETURNING _id INTO new_index;

    RETURN new_index;
END;
$$ LANGUAGE plpgsql;

create function func_create_personnel_record(parent_id integer, parent_table_name text) returns integer
    language plpgsql
as
$$
DECLARE
    new_index INTEGER := nextval('civilio.personnel_index_seq');
BEGIN
    INSERT INTO public.data_personnel(q12_01_name, q12_02_tittle_position, q12_03_gender, age_en_ann_es,
                                      avez_vous_re_u_une_f_ion_sur_l_tat_civil_, q12_08_education_level_attaine,
                                      niveau_en_informatique, _index, _parent_table_name, _parent_index, _submission_id,
                                      _submission_uuid, _submission_submission_time, _submission_validation_status,
                                      _submission_notes, _submission_status, _submission_submitted_by,
                                      _submission_version_, _submission_tags, q1_02_division, q1_03_municipality,
                                      ds_rattachement, as_rattachement, milieu, q1_07_type_healt_facility,
                                      statut_de_la_fosa, existence_d_une_maternit_dans_la_fosa)
    VALUES ('', '', 1, 0, 2, 1, 1,
            new_index,
            COALESCE(parent_table_name, 'FOSA OUEST'),
            (SELECT df._index FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            parent_id,
            COALESCE((SELECT df._uuid FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1)::VARCHAR(36), ''),
            COALESCE((SELECT df._submission_time FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1)::DATE,
                     CURRENT_DATE),
            COALESCE((SELECT df._validation_status
                      FROM public.data_fosa df
                      WHERE df._id = parent_id
                      LIMIT 1)::VARCHAR(26), ''),
            COALESCE((SELECT df._notes FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1)::VARCHAR(30), ''),
            COALESCE((SELECT df._validation_status FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
                     CAST('' AS varchar(17))),
            SUBSTRING((SELECT df._submitted_by FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1)::TEXT
                      FROM 1 FOR 9),
            (SELECT df._version_ FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df._tags FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.q1_02_division FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.q1_03_municipality FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.ds_rattachement FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.as_rattachement FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.milieu FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.q1_07_type_healt_facility FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.statut_de_la_fosa FROM public.data_fosa df WHERE df._id = parent_id LIMIT 1),
            (SELECT df.existence_d_une_maternit_dans_la_fosa
             FROM public.data_fosa df
             WHERE df._id = parent_id
             LIMIT 1));
    RETURN new_index;
END;
$$;