DROP VIEW "civilio"."vw_submissions";
--> statement-breakpoint
CREATE VIEW "civilio"."vw_submissions" AS
(
SELECT _id,
			 _index,
			 _validation_status,
			 validation_code,
			 facility_name,
			 _submission_time,
			 form,
			 next,
			 prev,
			 lower(COALESCE(_validation_status, ''::text)) =
			 'validation_status_approved'::text AS is_valid,
			 current_version,
			 last_modified_at,
			 last_modified_by
FROM ((SELECT df._id::double precision::integer                       AS _id,
							df._index,
							df._validation_status::text                             AS _validation_status,
							df.code_de_validation::text                             AS validation_code,
							df.q2_4_officename::text                                AS facility_name,
							df._submission_time::date                               AS _submission_time,
							(SELECT 'csc'::civilio.form_types AS form_types)        AS form,
							lead(df._index) OVER (ORDER BY df._index)               AS next,
							lag(df._index) OVER (ORDER BY df._index)                AS prev,
							COALESCE(rd.hash, df._version_)                         AS current_version,
							COALESCE(rd.changed_at,
											 df._submission_time::TIMESTAMP WITH TIME ZONE) AS last_modified_at,
							COALESCE(rd.changed_by, df._submitted_by)               AS last_modified_by
			 FROM csc.data df
							LEFT JOIN revisions.deltas rd ON rd.hash = df._version_
				 AND rd.form = 'csc'::civilio.form_types
				 AND rd.submission_index = df._index
				 AND rd.table_name = 'data')
			UNION
			(SELECT df._id::double precision::integer                       AS _id,
							df._index,
							df._validation_status::text                             AS _validation_status,
							df.q14_02_validation_code::text                         AS validation_code,
							df.q1_12_officename::text                               AS facility_name,
							df._submission_time,
							(SELECT 'fosa'::civilio.form_types AS form_types)       AS form,
							lead(df._index) OVER (ORDER BY df._index)               AS next,
							lag(df._index) OVER (ORDER BY df._index)                AS prev,
							COALESCE(rd.hash, df._version_)                         AS current_version,
							COALESCE(rd.changed_at,
											 df._submission_time::TIMESTAMP WITH TIME ZONE) AS last_modified_at,
							COALESCE(rd.changed_by, df._submitted_by)               AS last_modified_by
			 FROM fosa.data df
							LEFT JOIN revisions.deltas rd ON rd.hash = df._version_
				 AND rd.form = 'fosa'::civilio.form_types
				 AND rd.submission_index = df._index
				 AND rd.table_name = 'data')
			UNION
			SELECT df._id::double precision::integer                       AS _id,
						 df._index,
						 df._validation_status::text                             AS _validation_status,
						 df.q14_02_validation_code::text                         AS validation_code,
						 df.q1_12_officename::text                               AS facility_name,
						 df._submission_time,
						 (SELECT 'chefferie'::civilio.form_types AS form_types)  AS form,
						 lead(df._index) OVER (ORDER BY df._index)               AS next,
						 lag(df._index) OVER (ORDER BY df._index)                AS prev,
						 COALESCE(rd.hash, df._version_)                         AS current_version,
						 COALESCE(rd.changed_at,
											df._submission_time::TIMESTAMP WITH TIME ZONE) AS last_modified_at,
						 COALESCE(rd.changed_by, df._submitted_by)               AS last_modified_by
			FROM chefferie.data df
						 LEFT JOIN revisions.deltas rd ON rd.hash = df._version_
				AND rd.form = 'chefferie'::civilio.form_types
				AND rd.submission_index = df._index
				AND rd.table_name = 'data') result
ORDER BY _submission_time DESC);
