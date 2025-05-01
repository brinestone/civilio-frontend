package fr.civipol.civilio.event;

import java.util.ResourceBundle;

public interface UIEvent extends Event{
    default String getLabel() {
        final var rb = ResourceBundle.getBundle("messages");
        return rb.getString(getLocalizationKey());
    }

    /**
     * Returns an i18n key for this event's label.
     * @return the i18n key.
     */
    String getLocalizationKey();
}
