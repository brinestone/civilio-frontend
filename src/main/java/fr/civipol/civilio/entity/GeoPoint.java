package fr.civipol.civilio.entity;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.Locale;

@Data
@Builder
@Jacksonized
public class GeoPoint {
    @Builder.Default
    private Float latitude = 5.483401f;
    @Builder.Default
    private Float longitude = 47.88104f;
    private Float accuracy, altitude;

    public String toString() {
        return String.format(Locale.ENGLISH, "%f %f %f %f", latitude, longitude, altitude, accuracy);
    }
}
