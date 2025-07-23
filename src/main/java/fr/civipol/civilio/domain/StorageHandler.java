package fr.civipol.civilio.domain;

import java.io.File;
import java.util.function.Consumer;

public interface StorageHandler {
    UploadTask upload(File file);

    void delete(String url);
}
