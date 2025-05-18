package fr.civipol.civilio.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.civipol.civilio.Constants;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Optional;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;

@Slf4j
@Singleton
public class ConfigManager {
    private static final String ALG = "AES";
    private static final String AES_KEY = "b7OAdC1xaoxiyumkbqY6cSr2rVS14rsaTLTT1Uqe9e4OYKVa5WK6YMDbziwIBr3RKJjMjWOjCoEcucQzdKkkzvFya3bp9k3bxuC6hofWQXFsdLvWYmmkWBiqqF8ScD9F";
    private static SecretKeySpec keyRef;
    private final Preferences settings = Preferences.userRoot().node(Constants.SETTINGS_PREFS_NODE_PATH);
    private final ObjectMapper mapper = new ObjectMapper();

    @Inject
    public ConfigManager() {
    }

    public void clear() throws BackingStoreException {
        settings.clear();
    }

    public void saveObject(String key, Object value) {
        settings.put(key, serialize(value));
    }

    private <T> Optional<T> deserialize(Class<T> type, String serialized) {
        return Optional.ofNullable(serialized)
                .map(s -> {
                    try {
                        final var cipher = Cipher.getInstance(ALG);
                        final var key = getKey();
                        cipher.init(Cipher.DECRYPT_MODE, key);

                        final var decoded = Base64.getDecoder().decode(serialized);
                        final var decryptedBytes = cipher.doFinal(decoded);

                        final var json = new String(decryptedBytes, StandardCharsets.UTF_8);
                        return mapper.readValue(json, type);
                    } catch (Exception e) {
                        log.error("error while deserializing value from settings: %s".formatted(serialized), e);
                        throw new RuntimeException(e);
                    }
                });
    }

    public Optional<Object> loadObject(String key) {
        final var serialized = settings.get(key, null);
        return deserialize(Object.class, serialized);
    }

    public <T> Optional<T> loadObject(String key, Class<T> type) {
        final var serialized = settings.get(key, null);
        return deserialize(type, serialized);
    }

    private static SecretKeySpec getKey() throws NoSuchAlgorithmException, InvalidKeySpecException {
        if (keyRef != null) return keyRef;
        final var factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        final var spec = new PBEKeySpec(AES_KEY.toCharArray(), System.getProperty("app.build").getBytes(), 65536, 256);
        keyRef = new SecretKeySpec(factory.generateSecret(spec).getEncoded(), ALG);
        return keyRef;
    }

    private String serialize(Object obj) {
        try {
            final var json = mapper.writeValueAsString(obj);
            final var key = getKey();

            final var cipher = Cipher.getInstance(ALG);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            final var cipherBytes = cipher.doFinal(json.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(cipherBytes);
        } catch (Exception ex) {
            log.error("Error while serializing object", ex);
            throw new RuntimeException(ex);
        }
    }
}
