package fr.civipol.civilio.exception;

import java.util.ResourceBundle;

public abstract class LocalizedException extends Exception {
    public LocalizedException(String messageKey) {
        super(messageKey);
    }

    @Override
    public String getLocalizedMessage() {
        final var rbs = ResourceBundle.getBundle("messages");
        return rbs.getString(getMessage());
    }
}
