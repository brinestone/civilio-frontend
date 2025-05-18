package fr.civipol.civilio;

public final class Constants {
    public static final String ROOT_PREFS_KEY_PATH = System.getProperty("app.id");
    public static final String SETTINGS_PREFS_NODE_PATH = String.format("%s/settings", ROOT_PREFS_KEY_PATH);
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
}
