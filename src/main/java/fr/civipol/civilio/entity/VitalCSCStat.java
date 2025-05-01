package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class VitalCSCStat {
    private Integer year, registeredBirths, registeredDeaths;
    private String observations;
}
