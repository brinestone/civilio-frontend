package fr.civipol.civilio;

public final class Constants {
    public static final String ROOT_PREFS_KEY_PATH = System.getProperty("app.id");
    public static final String SETTINGS_PREFS_NODE_PATH = String.format("%s/settings", ROOT_PREFS_KEY_PATH);
    public static final String MINIO_ACCESS_KEY_NAME = "minio.access";
    public static final String MINIO_SECRET_KEY_NAME = "minio.secret";
    public static final String MINIO_ENDPOINT_KEY_NAME = "minio.endpoint";
    public static final String PRINCIPAL_PREFS_KEY_NAME = "principal";
    private static final String WINDOW_POS_X = "WINDOW_POS_X";
    private static final String WINDOW_POS_Y = "WINDOW_POS_Y";
    private static final String WINDOW_HEIGHT = "WINDOW_HEIGHT";
    private static final String WINDOW_WIDTH = "WINDOW_WIDTH";
    private static final String DIVIDER_POSITION = "DIVIDER_POSITION";
    private static final String SELECTED_CATEGORY = "SELECTED_CATEGORY";
}
