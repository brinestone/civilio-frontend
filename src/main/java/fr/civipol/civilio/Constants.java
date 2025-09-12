package fr.civipol.civilio;

public final class Constants {
    public static final class Patterns {
        public static final String OPTIONAL_PHONE = "^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$";
        public static final String OPTIONAL_EMAIL = "^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})?$";
        public static final String FOSA_VALIDATION_CODE = "^(?:BM|BA|NG|EA|NU|AO|YE|DA|LE|LM|MO|GA|MA|NE)(?:1[05]|2[05]|3[05]|4[05]|5[05]|6[05]|7[05]|80)(?:10|13|16|19|22|25|28|31|34|37|40|43|46|49|52|55|58|61|64|67|70|73|76|79)[FMDL]$";
    }

    public static final String UPLOADS_BUCKET = "uploads";
    public static final String ROOT_PREFS_KEY_PATH = System.getProperty("app.id");
    public static final String SETTINGS_PREFS_NODE_PATH = String.format("%s/settings", ROOT_PREFS_KEY_PATH);
    public static final String FIELD_MAPPER_PREFS_NODE_PATH = "%s/field_mapping".formatted(ROOT_PREFS_KEY_PATH);
    public static final String MINIO_ACCESS_KEY_NAME = "settings.advanced.storage.access_key";
    public static final String MINIO_SECRET_KEY_NAME = "settings.advanced.storage.secret_key";
    public static final String MINIO_ENDPOINT_KEY_NAME = "settings.advanced.storage.endpoint";
    public static final String SYSTEM_LANGUAGE_KEY = "settings.language";
    public static final String PRINCIPAL_PREFS_KEY_NAME = "principal";
    public static final String DB_HOST_KEY = "settings.advanced.db.host";
    public static final String DB_PORT_KEY = "settings.advanced.db.port";
    public static final String DB_NAME_KEY = "settings.advanced.db.name";
    public static final String DB_USER_KEY = "settings.advanced.db.user";
    public static final String DB_USER_PWD_KEY = "settings.advanced.db.pwd";
    public static final String DB_USE_SSL_KEY = "settings.advanced.db.ssl";
}
