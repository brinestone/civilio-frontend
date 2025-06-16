package fr.civipol.civilio.form.control;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.viewmodel.GeoPointViewModel;
import fr.civipol.civilio.form.field.GeoPointField;
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
public class GeoPointPickerControl extends SimpleControl<GeoPointField> {
    private GeoPointViewModel viewModel;
    private Label lblAltitude, lblLongitude, lblLatitude, lblAccuracy;
    private Spinner<Float> spAltitude, spLongitude, spLatitude, spAccuracy;
    private WebView mapView;
    private StackPane mapContainer;
    private WebEngine webEngine;
    private JsAgent jsAgent;
    private boolean inboundChange;

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
        mapView.setContextMenuEnabled(false);
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
        final var url = GeoPointPickerControl.class.getResource("/html/leaflet.html");
        if (url == null) {
            log.warn("url not found for \"/html/leaflet.html\" resource");
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

    private void setupDynamicChangeListeners() {
        viewModel.latitudeProperty().addListener((ob, ov, nv) -> {
            if (inboundChange) return;

            if (webEngine.getLoadWorker().isRunning()) {
                webEngine.getLoadWorker().stateProperty().addListener((oob, oov, nnv) -> {
                    if (nnv != Worker.State.SUCCEEDED) return;
                    webEngine.executeScript("moveMarker(%f, %f, true)".formatted(nv.doubleValue(), viewModel.getLongitude()));
                });
            } else
                webEngine.executeScript("moveMarker(%f, %f, true)".formatted(nv.doubleValue(), viewModel.getLongitude()));
        });

        viewModel.longitudeProperty().addListener((ob, ov, nv) -> {
            if (inboundChange) return;

            if (webEngine.getLoadWorker().isRunning()) {
                webEngine.getLoadWorker().stateProperty().addListener((oob, oov, nnv) -> {
                    if (nnv != Worker.State.SUCCEEDED) return;
                    webEngine.executeScript("moveMarker(%f, %f, true)".formatted(viewModel.getLatitude(), nv.doubleValue()));
                });
            } else
                webEngine.executeScript("moveMarker(%f, %f, true)".formatted(viewModel.getLatitude(), nv.doubleValue()));
        });
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
        jsAgent.registerGeoPointChangeNotifier(this::onGeoPointChanged);
        field.valueProperty().addListener((ob, ov, nv) -> {
            if (nv == null) {
                unbindDynamicBindings();
                this.viewModel = null;
                System.gc();
            } else {
                this.viewModel = new GeoPointViewModel(nv);
                setupDynamicBindings();
                setupDynamicChangeListeners();
            }
        });

        webEngine.getLoadWorker().stateProperty().addListener((ob, ov, nv) -> {
            try {
                if (nv != Worker.State.SUCCEEDED) return;
                final var window = (JSObject) webEngine.executeScript("window");

                window.setMember("agent", jsAgent);
                webEngine.executeScript("onReady()");
                webEngine.executeScript("initJava()");
            } catch (Throwable ex) {
                log.error("error during load working", ex);
            }
        });
        setupDynamicChangeListeners();
    }

    private void onGeoPointChanged() {
        inboundChange = true;
        final var lat = (Double) webEngine.executeScript("currentLat");
        final var lon = (Double) webEngine.executeScript("currentLon");

        viewModel.setLatitude(lat.floatValue());
        viewModel.setLongitude(lon.floatValue());
        inboundChange = false;
    }

    @Override
    public void setupEventHandlers() {
        super.setupEventHandlers();
        webEngine.setOnError(ev -> {
            final var ex = ev.getException();
            log.error("web engine error", ex);
        });
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
        viewModel = new GeoPointViewModel(field.getValue());
        jsAgent = new JsAgent();
    }
}
