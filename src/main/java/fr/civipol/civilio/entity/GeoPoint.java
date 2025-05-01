package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class GeoPoint {
    private Float latitude, longitude, accuracy, altitude;
}
