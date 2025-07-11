package fr.civipol.civilio.entity;

import fr.civipol.civilio.domain.FieldChange;

import java.util.Collection;

public record NewSubmissionResult(Collection<FieldChange> droppedUpdates, String id) {
}
