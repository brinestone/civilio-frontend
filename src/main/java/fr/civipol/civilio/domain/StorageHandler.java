package fr.civipol.civilio.domain;

import java.io.File;
import java.util.function.Consumer;

public interface StorageHandler {
    void upload(File file, Consumer<UploadTask> callback);
    void delete(String url);
}
