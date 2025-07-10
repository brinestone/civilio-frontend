package fr.civipol.civilio.event;

import org.controlsfx.control.action.Action;

public record ToastEvent(String message, Action... actions) implements Event {
}
