package fr.civipol.civilio.event;

import java.time.LocalDate;

public record SubmissionRef(Integer id, LocalDate submissionDate, Integer index, String validationCode, Integer prev, Integer next) {
    @Override
    public String toString() {
        return "%s - %s".formatted(index, validationCode);
    }
}
