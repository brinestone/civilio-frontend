package fr.civipol.civilio.event;

public interface UIEvent extends Event{
    String getLabel();

    /**
     * Returns an i18n key for this event's label.
     * @return the i18n key.
     */
    String getLocalizationKey();
}
