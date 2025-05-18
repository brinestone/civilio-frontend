package fr.civipol.civilio.event;

public record ProgressEvent(float currentProgress, String key) implements Event {
}
