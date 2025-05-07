package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.jackson.Jacksonized;
import org.jetbrains.annotations.NotNull;

import java.util.Date;

@Data
@Jacksonized
@Builder
@EqualsAndHashCode(of = {"id"})
public class FormSubmission implements Comparable<FormSubmission> {
    private String id, submittedBy, validationStatus, validationCode;
    private Date submittedAt;

    @Override
    public int compareTo(@NotNull FormSubmission o) {
        return o.getId().compareTo(getId());
    }
}
