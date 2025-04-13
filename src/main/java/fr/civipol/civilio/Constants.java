package fr.civipol.civilio;

public final class Constants {
    public static final String ROOT_PREFS_KEY_PATH = System.getProperty("app.id");
    public static final String SETTINGS_PREFS_NODE_PATH = String.format("%s/settings", ROOT_PREFS_KEY_PATH);
    public static final String MINIO_ACCESS_KEY_NAME = "settings.advanced.storage.access_key";
    public static final String MINIO_SECRET_KEY_NAME = "settings.advanced.storage.secret_key";
    public static final String MINIO_ENDPOINT_KEY_NAME = "settings.advanced.storage.endpoint";
    public static final String PRINCIPAL_PREFS_KEY_NAME = "principal";
    public static final String API_ORIGIN_KEY = "settings.advanced.api.origin";
}
