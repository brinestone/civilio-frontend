package fr.civipol.civilio.tool;

import org.mindrot.jbcrypt.BCrypt;

public class BCryptPasswordEncoder {
    private static final int STRENGTH = 15;

    public static boolean verify(String password, String hashed) {
        return BCrypt.checkpw(password, hashed);
    }

    public static String encode(String plainText) {
        return BCrypt.hashpw(plainText, BCrypt.gensalt(STRENGTH));
    }
}
