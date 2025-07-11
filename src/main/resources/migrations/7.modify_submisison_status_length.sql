alter table public.data_personnel
    alter column _submission_status type varchar(26) using _submission_status::varchar(26);