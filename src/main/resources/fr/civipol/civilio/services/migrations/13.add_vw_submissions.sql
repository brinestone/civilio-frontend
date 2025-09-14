CREATE OR REPLACE VIEW civilio.vw_submissions AS
SELECT result.*,
       LOWER(COALESCE(result._validation_status, '')) = 'validation_status_approved' AS is_valid
FROM (SELECT (df._id::FLOAT)::INTEGER,
             df._index::INTEGER,
             df._validation_status::TEXT,
             df.code_de_validation::TEXT               AS validation_code,
             df.q2_4_officename::TEXT                  AS facility_name,
             df._submission_time::DATE,
             (SELECT 'csc'::civilio.form_types)        AS form,
             LEAD(df._index) OVER (ORDER BY df._index) AS next,
             LAG(df._index) OVER (ORDER BY df._index)  AS prev
      FROM csc.data df
      UNION
      SELECT (df._id::FLOAT)::INTEGER,
             df._index::INTEGER,
             df._validation_status::TEXT,
             df.q14_02_validation_code::TEXT           AS validation_code,
             df.q1_12_officename::TEXT                 AS facility_name,
             df._submission_time::DATE,
             (SELECT 'fosa'::civilio.form_types)       AS form,
             LEAD(df._index) OVER (ORDER BY df._index) AS next,
             LAG(df._index) OVER (ORDER BY df._index)  AS prev
      FROM fosa.data df
      UNION
      SELECT (df._id::FLOAT)::INTEGER,
             df._index::INTEGER,
             df._validation_status::TEXT,
             df.q14_02_validation_code::TEXT           AS validation_code,
             df.q1_12_officename::TEXT                 AS facility_name,
             df._submission_time::DATE,
             (SELECT 'chefferie'::civilio.form_types)  AS form,
             LEAD(df._index) OVER (ORDER BY df._index) AS next,
             LAG(df._index) OVER (ORDER BY df._index)  AS prev
      FROM chefferie.data df) as result
ORDER BY result._submission_time DESC;