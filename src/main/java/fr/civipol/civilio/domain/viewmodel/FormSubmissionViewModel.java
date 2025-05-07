package fr.civipol.civilio.domain.viewmodel;

import fr.civipol.civilio.entity.FormSubmission;
import javafx.beans.property.*;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;

import java.util.Comparator;
import java.util.Date;
import java.util.Optional;

public class FormSubmissionViewModel implements Comparable<FormSubmissionViewModel> {
    @Getter
    private final FormSubmission submission;
    private final ObjectProperty<Date> submittedAt;
    private final StringProperty submittedBy, validationCode;
    private final BooleanProperty selected, validated;

    public FormSubmissionViewModel(FormSubmission submission) {
        this.submission = submission;
        validated = new SimpleBooleanProperty(submission, "validated", Optional.ofNullable(submission)
                .stream()
                .allMatch(fs -> Optional.ofNullable(fs.getValidationCode())
                        .stream().allMatch(StringUtils::isNotBlank) &&
                        Optional.ofNullable(fs.getValidationStatus())
                                .stream().allMatch(s -> s.equalsIgnoreCase("validation_status_passed"))));
        selected = new SimpleBooleanProperty(this, "selected", false);
        validationCode = new SimpleStringProperty(submission, "validationCode", Optional.ofNullable(submission)
                .map(FormSubmission::getValidationCode)
                .orElse(null));
        submittedBy = new SimpleStringProperty(submission, "submittedBy", Optional.ofNullable(submission)
                .map(FormSubmission::getSubmittedBy)
                .orElse(null));
        submittedAt = new SimpleObjectProperty<>(submission, "submittedAt", Optional.ofNullable(submission)
                .map(FormSubmission::getSubmittedAt)
                .orElse(null));

        submittedBy.addListener((ob, ov, nv) -> Optional.ofNullable(getSubmission()).ifPresent(fs -> fs.setSubmittedBy(nv)));
        validated.addListener((ob, ov, nv) -> Optional.ofNullable(getSubmission()).ifPresent(fs -> {
            fs.setValidationStatus(nv ? "validation_status_passed" : "validation_status_on_hold");
        }));
    }

    public void setSelected(boolean val) {
        selected.set(val);
    }

    public StringProperty submittedByProperty() {
        return submittedBy;
    }

    public ObjectProperty<Date> submittedAtProperty() {
        return submittedAt;
    }

    public StringProperty validationCodeProperty() {
        return validationCode;
    }

    public BooleanProperty validatedProperty() {
        return validated;
    }

    public BooleanProperty selectedProperty() {
        return selected;
    }

    @Override
    public int compareTo(@NotNull FormSubmissionViewModel o) {
        return submission.compareTo(o.getSubmission());
    }

    @Override
    public boolean equals(Object obj) {
        return obj != null && obj.getClass().equals(getClass()) && getSubmission().equals(((FormSubmissionViewModel) obj).getSubmission());
    }

    @Override
    public int hashCode() {
        return getSubmission().hashCode();
    }
}
