create table if not exists civilio.choices
(
    name     text not null,
    label    text not null,
    parent   text,
    "group"  text not null,
    i18n_key text,
    version  civilio.form_types not null,
    primary key (name, "group", version)
);