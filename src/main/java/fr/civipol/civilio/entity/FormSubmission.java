package fr.civipol.civilio.entity;

import fr.civipol.civilio.domain.filter.FilterField;
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
    private String id;
    @FilterField(dbFieldName ="_validation_status", labelKey = "filters.validation.status")
    private String validationStatus;
    @FilterField(dbFieldName ="q14_02_validation_code", labelKey = "filters.validation.code")
    private String validationCode;
    @FilterField(dbFieldName = "_submitted_by", labelKey = "filters.user.recorded_by.title")
    private String submittedBy;
    @FilterField(dbFieldName = "_submission_time", labelKey = "filters.recorded_on.title")
    private Date submittedOn;
    @FilterField(dbFieldName = "_index", labelKey = "filters.index.title")
    private String index;
    @FilterField(dbFieldName = "q1_12_officename", labelKey = "filters.facility_name.title")
    private String facilityName;
    @Override
    public int compareTo(@NotNull FormSubmission o) {
        return o.getId().compareTo(getId());
    }
}
