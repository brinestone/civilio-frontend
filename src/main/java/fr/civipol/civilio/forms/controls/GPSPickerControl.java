package fr.civipol.civilio.forms.controls;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.GeoPointViewModel;
import fr.civipol.civilio.forms.field.GPSField;
import javafx.concurrent.Worker;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.control.Spinner;
import javafx.scene.control.SpinnerValueFactory;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import lombok.extern.slf4j.Slf4j;
import netscape.javascript.JSObject;

import java.util.Optional;

class ConfigurableSpinnerValueFactory extends SpinnerValueFactory<Float> {
    private final float min;
    private final float max;

    public ConfigurableSpinnerValueFactory(float min, float max) {
        this(min, max, 0f);
    }

    public ConfigurableSpinnerValueFactory(float min, float max, float initialValue) {
        super();
        this.min = min;
        this.max = max;
        setValue(initialValue);
    }

    @Override
    public void decrement(int steps) {
        setValue(Math.max(min, getValue() - steps));
    }

    @Override
    public void increment(int steps) {
        setValue(Math.min(max, getValue() + steps));
    }
}

@Slf4j
public class GPSPickerControl extends SimpleControl<GPSField> {
    private GeoPointViewModel viewModel;
    private Label lblAltitude, lblLongitude, lblLatitude, lblAccuracy;
    private Spinner<Float> spAltitude, spLongitude, spLatitude, spAccuracy;
    private WebView mapView;
    private StackPane mapContainer;
    private WebEngine webEngine;

    private Node wrapSpinner(Spinner<Float> spinner, Label label) {
        final var box = new VBox();
        box.setSpacing(2.0);
        box.getChildren().addAll(label, spinner);
        return box;
    }

    @Override
    public void initializeParts() {
        super.initializeParts();
        spAltitude.setEditable(true);
        spLatitude.setEditable(true);
        spLongitude.setEditable(true);
        spAccuracy.setEditable(true);
    }

    @Override
    public void layoutParts() {
        super.layoutParts();

        mapContainer.getChildren().setAll(mapView);
        add(wrapSpinner(spLatitude, lblLatitude), 0, 0, 3, 1);
        add(wrapSpinner(spLongitude, lblLongitude), 0, 1, 3, 1);
        add(wrapSpinner(spAltitude, lblAltitude), 0, 2, 3, 1);
        add(wrapSpinner(spAccuracy, lblAccuracy), 0, 3, 3, 1);
        add(mapContainer, 2, 0, 9, 4);
        setVgap(5.0);
        mapView.setPrefHeight(380);
        loadMapView();
    }

    private void loadMapView() {
        final var url = GPSPickerControl.class.getResource("/views/forms/leaflet.html");
        if (url == null) {
            log.warn("url not found for \"/views/forms/leaflet.html\" resource");
            return;
        }

        final var lat = Optional.ofNullable(viewModel)
                .map(GeoPointViewModel::getLatitude)
                .orElse(5.4811225f);
        final var lon = Optional.ofNullable(viewModel)
                .map(GeoPointViewModel::getLongitude)
                .orElse(10.4087592f);
        final var alt = Optional.ofNullable(viewModel)
                .map(GeoPointViewModel::getAltitude)
                .orElse(0f);
        final var urlString = url + "?at=" + lat + "," + lon + "," + alt;
        webEngine.load(urlString);
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        lblAltitude.textProperty().bind(field.altitudeProperty());
        lblLongitude.textProperty().bind(field.longitudeLabelProperty());
        lblLatitude.textProperty().bind(field.latitudeLabelProperty());
        lblAccuracy.textProperty().bind(field.accuracyLabelProperty());
        setupDynamicBindings();
    }

    private void setupDynamicBindings() {
        spAltitude.getValueFactory().valueProperty().bindBidirectional(viewModel.altitudeProperty());
        spLongitude.getValueFactory().valueProperty().bindBidirectional(viewModel.longitudeProperty());
        spLatitude.getValueFactory().valueProperty().bindBidirectional(viewModel.latitudeProperty());
        spAccuracy.getValueFactory().valueProperty().bindBidirectional(viewModel.accuracyProperty());
    }

    private void unbindDynamicBindings() {
        spAltitude.getValueFactory().valueProperty().unbind();
        spLongitude.getValueFactory().valueProperty().unbind();
        spLatitude.getValueFactory().valueProperty().unbind();
        spAccuracy.getValueFactory().valueProperty().unbind();
    }

    @Override
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        field.valueProperty().addListener((ob, ov, nv) -> {
            if (nv == null) {
                unbindDynamicBindings();
                this.viewModel = null;
                System.gc();
            } else {
                this.viewModel = new GeoPointViewModel(nv);
                setupDynamicBindings();
            }
        });

        webEngine.getLoadWorker().stateProperty().addListener((ob, ov, nv) -> {
            if (nv != Worker.State.SUCCEEDED) return;
            final var window = (JSObject) webEngine.executeScript("window");
            final var agent = new JsAgent();
            agent.registerPointConsumer(this::onGeoPointChanged);

            window.setMember("agent", agent);
            webEngine.executeScript("initTileLayer()");
            webEngine.executeScript("initMarker()");
        });
    }

    private void onGeoPointChanged(Float lat, Float lon) {
        viewModel.setLatitude(lat);
        viewModel.setLongitude(lon);
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        webEngine.setOnError(System.err::println);
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        lblAltitude = new Label();
        lblLongitude = new Label();
        lblLatitude = new Label();
        lblAccuracy = new Label();
        mapView = new WebView();
        webEngine = mapView.getEngine();
        mapContainer = new StackPane();
        spAccuracy = new Spinner<>(new ConfigurableSpinnerValueFactory(0.0f, Float.MAX_VALUE, 100f));
        spLongitude = new Spinner<>(new ConfigurableSpinnerValueFactory(-180f, 180f));
        spAltitude = new Spinner<>(new ConfigurableSpinnerValueFactory(0f, 8_848f));
        spLatitude = new Spinner<>(new ConfigurableSpinnerValueFactory(-90.0f, 90.0f));
        this.viewModel = new GeoPointViewModel(field.getValue());
    }
}
