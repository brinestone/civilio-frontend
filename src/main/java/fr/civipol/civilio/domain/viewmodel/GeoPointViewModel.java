package fr.civipol.civilio.domain.viewmodel;

import fr.civipol.civilio.entity.GeoPoint;
import javafx.beans.property.FloatProperty;
import javafx.beans.property.SimpleFloatProperty;
import lombok.Getter;

import java.util.Optional;

public class GeoPointViewModel {
    @Getter
    private final GeoPoint location;
    private final FloatProperty latitude, longitude;

    public GeoPointViewModel(GeoPoint location) {
        this.location = location;
        latitude = new SimpleFloatProperty(location, "latitude",
                Optional.ofNullable(location)
                        .map(GeoPoint::getLatitude)
                        .orElse(5.4811225f));
        longitude = new SimpleFloatProperty(location, "longitude", Optional.ofNullable(location)
                .map(GeoPoint::getLongitude)
                .orElse(10.4087592f));

        latitude.addListener((ob, ov, nv) -> Optional.ofNullable(location).ifPresent(l -> l.setLatitude(nv.floatValue())));
        longitude.addListener((ob, ov, nv) -> Optional.ofNullable(location).ifPresent(l -> l.setLongitude(nv.floatValue())));
    }

    public Float getLongitude() {
        return longitude.get();
    }

    public Float getLatitude() {
        return latitude.get();
    }

    public void setLatitude(float v) {
        latitude.set(v);
    }

    public void setLongitude(float v) {
        longitude.set(v);
    }

    public FloatProperty latitudeProperty() {
        return latitude;
    }

    public FloatProperty longitudeProperty() {
        return longitude;
    }
}
