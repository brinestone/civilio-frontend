package fr.civipol.civilio.entity;

import fr.civipol.civilio.domain.FieldId;
import fr.civipol.civilio.form.FieldKeys;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class FosaStat {
    @FieldId(FieldKeys.Fosa.STATS_YEAR_1)
    private Integer year;
    @FieldId(FieldKeys.Fosa.STATS_BIRTH_COUNT_1)
    private Integer registeredBirths;
    @FieldId(FieldKeys.Fosa.STATS_DEATH_COUNT_1)
    private Integer registeredDeaths;
    @FieldId(FieldKeys.Fosa.STATS_OBSERVATIONS_1)
    private String observations;
    private String submissionId;
}
