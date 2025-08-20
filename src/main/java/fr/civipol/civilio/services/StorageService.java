package fr.civipol.civilio.services;

import fr.civipol.civilio.Constants;
import fr.civipol.civilio.domain.ProgressInputStream;
import io.minio.*;
import io.minio.errors.*;
import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.ResourceBundle;

@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class StorageService implements AppService {
    private final MinioClient storageClient;
    private final ConfigService configService;

    public void delete(String objectName) throws Exception {
        storageClient.removeObject(RemoveObjectArgs.builder()
                .bucket(Constants.UPLOADS_BUCKET)
                .object(objectName)
                .build()
        );
    }

    private static final Map<String, String> DEFAULT_TAGS = Map.of(
            "uploaded-by", System.getProperty("app.name", "civilio")
    );

    public String upload(File file, String objectName, ProgressInputStream.ProgressListener listener) throws Exception {
        return upload(file, objectName, listener, DEFAULT_TAGS);
    }

    public String upload(File file, String objectName, ProgressInputStream.ProgressListener listener, Map<String, String> tags) throws Exception {
        tags = new HashMap<>(tags);
        tags.putAll(DEFAULT_TAGS);
        try {
            String bucketName = Constants.UPLOADS_BUCKET;
            final var endpointWrapper = configService.loadObject(Constants.MINIO_ENDPOINT_KEY_NAME, String.class);
            if (endpointWrapper.isEmpty()) {
                throw new IllegalStateException("Storage configuration is bad - %s must be configured to point to a MinIO API endpoint".formatted(ResourceBundle.getBundle("messages").getString(Constants.MINIO_ENDPOINT_KEY_NAME)));
            }
            log.debug("Checking for existence of bucket: \"{}\"", bucketName);
            final var bucketExists = storageClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!bucketExists) {
                log.debug("Bucket: \"{}\" does not exist. Creating it", bucketName);
                storageClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            try (
                    final var is = Files.newInputStream(file.toPath());
                    final var ps = new ProgressInputStream(is, is.available(), listener)
            ) {
                final var response = storageClient.putObject(
                        PutObjectArgs.builder()
                                .tags(tags)
                                .stream(ps, is.available(), -1)
                                .contentType(Files.probeContentType(file.toPath()))
                                .bucket(bucketName)
                                .object(objectName)
                                .build()
                );
                return "%s/%s".formatted(endpointWrapper.get(), String.join("/", bucketName, objectName));
            }
        } catch (ErrorResponseException | InsufficientDataException | XmlParserException | ServerException |
                 NoSuchAlgorithmException | IOException | InvalidResponseException | InvalidKeyException |
                 InternalException e) {
            log.error("Could not communicate with S3 storage", e);
            throw e;
        }
    }

    @Override
    public boolean isConfigured(ConfigService cm) {
        return true;
//        try {
//            final var bucketName = Constants.UPLOADS_BUCKET;
//            if (!storageClient.bucketExists(BucketExistsArgs.builder()
//                    .bucket(bucketName)
//                    .build())) {
//                storageClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
//            }
//            return true;
//        } catch (Exception ex) {
//            log.error("Could not communicate with S3 storage", ex);
//            return false;
//        }
    }
}
