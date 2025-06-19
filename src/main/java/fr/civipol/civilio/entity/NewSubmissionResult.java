package fr.civipol.civilio.entity;

import java.util.Collection;

public record NewSubmissionResult(Collection<DataUpdate> droppedUpdates, String id) {
}
