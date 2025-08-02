package fr.civipol.civilio.form.field.gps;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.viewmodel.GeoPointViewModel;
import fr.civipol.civilio.form.control.JsAgent;
import fr.civipol.civilio.util.NotifyCallback;
import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import javafx.concurrent.Worker;
import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.control.Label;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import lombok.extern.slf4j.Slf4j;
import netscape.javascript.JSObject;

import java.util.Optional;
import java.util.stream.Stream;

@Slf4j
public class GeoPointPickerControl extends SimpleControl<GeoPointField> {
    private final ObjectProperty<GeoPointViewModel> viewModel = new SimpleObjectProperty<>();
    private final FloatProperty lat = new SimpleFloatProperty(), lon = new SimpleFloatProperty();
    private Label controlLabel, latLabel, lonLabel, connectivityNoticeLabel;
    private WebView mapView;
    private StackPane mapContainer;
    private WebEngine webEngine;
    private JsAgent jsAgent;
    private boolean inboundChange;
    private final NotifyCallback updateTrigger;
    private StackPane connectivityNotice;

    public GeoPointPickerControl(NotifyCallback updateTrigger) {
        this.updateTrigger = updateTrigger;
    }

    @Override
    public void initializeParts() {
        super.initializeParts();
        mapView.setContextMenuEnabled(false);
        if (field.getValue() != null)
            viewModel.setValue(new GeoPointViewModel(field.getValue()));
        mapContainer.setStyle("""
                -fx-border-width: 1px;
                -fx-border-style: solid;
                -fx-border-color: gray;
                """);
        connectivityNoticeLabel.setStyle("""
                -fx-font-size: 14px;
                -fx-font-weight: bold;
                """);
        connectivityNotice.setStyle("""
                -fx-background-color: white;
                """);
        connectivityNoticeLabel.setWrapText(true);
    }

    @Override
    public void layoutParts() {
        super.layoutParts();
        final var columns = field.getSpan();
        final var labelContainer = new VBox();
        final var coordinateContainer = new HBox(latLabel, lonLabel);
        connectivityNotice.getChildren().add(connectivityNoticeLabel);
        coordinateContainer.setSpacing(2.0);
        labelContainer.setSpacing(2.0);
        labelContainer.getChildren().addAll(controlLabel, coordinateContainer);
        mapContainer.getChildren().setAll(mapView, connectivityNotice);
        add(labelContainer, 0, 0, 3, REMAINING);
        add(mapContainer, 4, 0, columns - 3, REMAINING);
        setVgap(5.0);
        mapView.setPrefHeight(180);
        connectivityNoticeLabel.setMaxWidth(150);
        GridPane.setValignment(labelContainer, VPos.CENTER);
        GridPane.setHalignment(mapContainer, HPos.LEFT);
        loadMapView();
    }

    private void loadMapView() {
        final var url = GeoPointPickerControl.class.getResource("/html/leaflet.html");
        if (url == null) {
            log.warn("url not found for \"/html/leaflet.html\" resource");
            return;
        }

        final var urlString = url + "?at=" + lat.get() + "," + lon.get();
        webEngine.load(urlString);
    }

    @Override
    public void setupBindings() {
        super.setupBindings();
        connectivityNoticeLabel.textProperty().bind(field.connectivityNoticeTextProperty());
        controlLabel.textProperty().bind(field.labelProperty());
        mapView.prefWidthProperty().bind(mapContainer.widthProperty());
        connectivityNotice.visibleProperty().bind(field.connectionAvailableProperty().not());
        viewModel.bind(Bindings.createObjectBinding(() -> {
            if (field.getValue() == null) return null;
            return new GeoPointViewModel(field.getValue());
        }, field.valueProperty()));
        viewModel.addListener((ob, ov, nv) -> {
            if (nv == null) {
                if (lat.isBound()) {
                    lat.unbind();
                    lat.setValue(5.4811225f);
                }
                if (lon.isBound()) {
                    lon.unbind();
                    lon.setValue(10.4087592f);
                }
            } else {
                lat.bind(nv.latitudeProperty());
                lon.bind(nv.longitudeProperty());
            }
        });
        latLabel.textProperty().bind(Bindings.format("lat=%.2f", lat));
        lon.bind(Bindings.select(viewModel, "longitude"));
        lonLabel.textProperty().bind(Bindings.format("lon=%.2f", lon));
    }

    @Override
    public void setupValueChangedListeners() {
        super.setupValueChangedListeners();
        jsAgent.registerGeoPointChangeNotifier(this::onGeoPointChanged);

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

        lat.addListener((ob, ov, nv) -> {
            if (inboundChange) return;

            if (webEngine.getLoadWorker().isRunning()) {
                webEngine.getLoadWorker().stateProperty().addListener((oob, oov, nnv) -> {
                    if (nnv != Worker.State.SUCCEEDED) return;
                    webEngine.executeScript("moveMarker(%f, %f, true)".formatted(nv.doubleValue(), lon.getValue()));
                });
            } else {
                webEngine.executeScript("moveMarker(%f, %f, true)".formatted(nv.doubleValue(), lon.getValue()));
            }
        });

        lon.addListener((ob, ov, nv) -> {
            if (inboundChange) return;

            if (webEngine.getLoadWorker().isRunning()) {
                webEngine.getLoadWorker().stateProperty().addListener((oob, oov, nnv) -> {
                    if (nnv != Worker.State.SUCCEEDED) return;
                    webEngine.executeScript("moveMarker(%f, %f, true)".formatted(lat.getValue(), nv.doubleValue()));
                });
            } else
                webEngine.executeScript("moveMarker(%f, %f, true)".formatted(lat.getValue(), nv.doubleValue()));
        });

        lat.addListener((ob, ov, nv) -> updateTrigger.call());
        lon.addListener((ob, ov, nv) -> updateTrigger.call());

        field.connectionAvailableProperty().addListener((ob, ov, nv) -> {
            if (nv && !ov) webEngine.reload();
        });
    }

    private void onGeoPointChanged() {
        inboundChange = true;
        final var lat = (Double) webEngine.executeScript("currentLat");
        final var lon = (Double) webEngine.executeScript("currentLon");

        Optional.ofNullable(viewModel.getValue())
                .ifPresent(vm -> vm.setLatitude(lat.floatValue()));
        Optional.ofNullable(viewModel.getValue())
                .ifPresent(vm -> vm.setLongitude(lon.floatValue()));
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
        controlLabel = new Label();
        mapView = new WebView();
        webEngine = mapView.getEngine();
        latLabel = new Label();
        lonLabel = new Label();
        mapContainer = new StackPane();
        jsAgent = new JsAgent();
        connectivityNotice = new StackPane();
        connectivityNoticeLabel = new Label();
    }
}
