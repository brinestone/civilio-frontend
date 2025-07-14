create table if not exists civilio.form_field_mappings
(
    field          text               not null,
    i18n_key       text,
    db_column      text               not null,
    db_table       text               not null,
    form           civilio.form_types not null,
    db_column_type text               not null,
    ordinal        smallint default 0,
    constraint field_db_column_db_table_form_pk
        primary key (field, form)
);