package fr.civipol.civilio.domain;

import fr.civipol.civilio.entity.GeoPoint;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import lombok.Getter;

import java.util.Optional;

public class GeoPointViewModel {
    @Getter
    private final GeoPoint location;
    private final ObjectProperty<Float> latitude, longitude, accuracy, altitude;

    public GeoPointViewModel(GeoPoint location) {
        this.location = location;
        latitude = new SimpleObjectProperty<>(location, "latitude",
                Optional.ofNullable(location)
                        .map(GeoPoint::getLatitude)
                        .orElse(0.0f));
        longitude = new SimpleObjectProperty<>(location, "longitude", Optional.ofNullable(location)
                .map(GeoPoint::getLongitude)
                .orElse(0.0f));
        accuracy = new SimpleObjectProperty<>(location, "accuracy", Optional.ofNullable(location)
                .map(GeoPoint::getAccuracy)
                .orElse(0.0f));
        altitude = new SimpleObjectProperty<>(location, "altitude", Optional.ofNullable(location)
                .map(GeoPoint::getAltitude)
                .orElse(0.0f));

        latitude.addListener((ob, ov, nv) -> Optional.ofNullable(location).ifPresent(l -> l.setLatitude(nv)));
        longitude.addListener((ob, ov, nv) -> Optional.ofNullable(location).ifPresent(l -> l.setLongitude(nv)));
        accuracy.addListener((ob, ov, nv) -> Optional.ofNullable(location).ifPresent(l -> l.setAccuracy(nv)));
        altitude.addListener((ob, ov, nv) -> Optional.ofNullable(location).ifPresent(l -> l.setAltitude(nv)));
    }

    public Float getAltitude() {
        return altitude.get();
    }

    public Float getLongitude() {
        return longitude.get();
    }

    public Float getLatitude() {
        return latitude.get();
    }

    public void setLongitude(float lon) {
        longitude.set(lon);
    }

    public void setLatitude(float lat) {
        latitude.set(lat);
    }

    public ObjectProperty<Float> altitudeProperty() {
        return altitude;
    }

    public ObjectProperty<Float> longitudeProperty() {
        return longitude;
    }

    public ObjectProperty<Float> accuracyProperty() {
        return accuracy;
    }

    public ObjectProperty<Float> latitudeProperty() {
        return latitude;
    }
}
