package fr.civipol.civilio.exception;

public class NotFoundException extends LocalizedException {
    public NotFoundException(String resourceKey) {
        super(resourceKey);
    }
}
