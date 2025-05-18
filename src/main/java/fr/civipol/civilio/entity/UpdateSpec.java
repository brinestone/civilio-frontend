package fr.civipol.civilio.entity;

public record UpdateSpec(String field, Object newValue, Object oldValue) {
}
