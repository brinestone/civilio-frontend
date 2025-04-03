package fr.civipol.civilio;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Objects;

public final class Util {
    public static String digest(String string) {
        final var nonNullValue = Objects.requireNonNull(string);
        final var HEX_ARRAY = "0123456789abcdef".toCharArray();
        try {
            final var digest = MessageDigest.getInstance("sha-256");
            final var buf = digest.digest(string.getBytes(StandardCharsets.UTF_8));

            final var numBytes = buf.length;
            var hexChars = new char[numBytes * 2];
            for (var i = 0; i < numBytes; i++) {
                var v = buf[i] & 0xff;
                hexChars[i * 2] = HEX_ARRAY[v >>> 4];
                hexChars[(i * 2) + 1] = HEX_ARRAY[v & 0x0f];
            }
            return new String(hexChars);
        } catch (NoSuchAlgorithmException ex) {
            throw new RuntimeException(ex);
        }
    }
}
