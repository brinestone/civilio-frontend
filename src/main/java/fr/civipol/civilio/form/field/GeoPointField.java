package fr.civipol.civilio.form.field;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.entity.GeoPoint;
import fr.civipol.civilio.form.control.GeoPointPickerControl;
import fr.civipol.civilio.util.NotifyCallback;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

public class GeoPointField extends DataField<ObjectProperty<GeoPoint>, GeoPoint, GeoPointField> {
    private static final String LAT_LABEL = "controls.gps.lat";
    private static final String LON_LABEL = "controls.gps.lon";
    private static final String ACC_LABEL = "controls.gps.acc";
    private static final String ALTITUDE_LABEL = "controls.gps.alt";
    private final StringProperty latitudeLabel, longitudeLabel, accuracyLabel, altitude;

    /**
     * Internal constructor for the {@code DataField} class. To create new
     * elements, see the static factory methods in {@code Field}.
     *
     * @param valueProperty           The property that is used to store the current valid value
     *                                of the field.
     * @param persistentValueProperty The property that is used to store the latest persisted
     *                                value of the field.
     * @see Field::ofStringType
     * @see Field::ofIntegerType
     * @see Field::ofDoubleType
     * @see Field::ofBooleanType
     */
    protected GeoPointField(ObjectProperty<GeoPoint> valueProperty, ObjectProperty<GeoPoint> persistentValueProperty) {
        super(valueProperty, persistentValueProperty);
        latitudeLabel = new SimpleStringProperty(this, "latLabel", LAT_LABEL);
        longitudeLabel = new SimpleStringProperty(this, "lonLabel", LON_LABEL);
        accuracyLabel = new SimpleStringProperty(this, "accLabel", ACC_LABEL);
        altitude = new SimpleStringProperty(this, "altLabel", ALTITUDE_LABEL);
    }


    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        latitudeLabel.set(service.translate(LAT_LABEL));
        longitudeLabel.set(service.translate(LON_LABEL));
        accuracyLabel.set(service.translate(ACC_LABEL));
        altitude.set(service.translate(ALTITUDE_LABEL));
    }

    public StringProperty latitudeLabelProperty() {
        return latitudeLabel;
    }

    public StringProperty longitudeLabelProperty() {
        return longitudeLabel;
    }

    public StringProperty accuracyLabelProperty() {
        return accuracyLabel;
    }

    public StringProperty altitudeProperty() {
        return altitude;
    }

    public static Field<GeoPointField> gpsField(ObjectProperty<GeoPoint> binding, NotifyCallback callback) {
        final var prop = new SimpleObjectProperty<>(binding.getValue());
        binding.addListener((ob, ov, nv) -> prop.setValue(nv));

        return new GeoPointField(prop, binding)
                .render(new GeoPointPickerControl(callback));
    }
}
