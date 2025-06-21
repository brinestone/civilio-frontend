package fr.civipol.civilio.event;

import java.time.LocalDate;

public record SubmissionRef(String id, LocalDate submissionDate, String index, String validationCode, String prev, String next) {
    @Override
    public String toString() {
        return "%s - %s".formatted(index, validationCode);
    }
}
