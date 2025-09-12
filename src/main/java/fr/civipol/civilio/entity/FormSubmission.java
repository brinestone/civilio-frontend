package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDate;

@Data
@Jacksonized
@Builder
@EqualsAndHashCode(of = {"index"})
public class FormSubmission implements Comparable<FormSubmission> {
    private Integer id;
    private String validationStatus;
    private String validationCode;
    private LocalDate submittedOn;
    private Integer index;
    private String facilityName;
    private boolean valid;

    @Override
    public int compareTo(FormSubmission o) {
        return Integer.compare(o.getIndex(), getIndex());
    }
}
