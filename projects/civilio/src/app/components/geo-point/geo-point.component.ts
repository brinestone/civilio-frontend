import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, forwardRef, linkedSignal, model, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GeoPoint, GeopointSchema } from '@civilio/shared';
import { control, icon, LatLng, latLng, LeafletMouseEvent, map, Map, marker, Marker, tileLayer } from 'leaflet';


@Component({
  selector: 'cv-geo-point',
  providers: [
    { multi: true, provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GeoPointComponent) }
  ],
  imports: [
    DecimalPipe
  ],
  templateUrl: './geo-point.component.html',
  styleUrl: './geo-point.component.scss'
})
export class GeoPointComponent implements ControlValueAccessor, AfterViewInit {
  private map?: Map;
  private marker?: Marker;
  private touchedCallback?: any;
  private changeCallback?: any;

  protected mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  protected readonly disabled = signal(false);
  protected readonly _value = model<GeoPoint>();
  protected readonly resolvedCoords = linkedSignal(() => [this._value()?.lat ?? 5.5366959, this._value()?.long ?? 9.9126102] as [number, number]);
  ngAfterViewInit(): void {
    this.map = map(this.mapContainer().nativeElement, {
      center: this.resolvedCoords(),
      zoom: 13
    });
    this.map.on('click', this.onMapClicked.bind(this))
    this.initTileLayer();
    this.initScale();
    this.initMarker();
  }

  private onMapClicked({
    latlng
  }: LeafletMouseEvent) {
    this.moveMarker(latlng);
    this.touchedCallback?.();
  }

  private moveMarker(coords: LatLng) {
    this.marker?.setLatLng(coords);
  }

  private initMarker() {
    if (!this.map) return;

    const coords = latLng(this.resolvedCoords());
    this.marker = marker(coords, {
      icon: icon({
        shadowUrl: '/marker-shadow.png',
        iconUrl: '/marker-icon.png',
        iconAnchor: [12, 41],
        popupAnchor: [12, 41],
        tooltipAnchor: [12, 44],
        shadowAnchor: [13, 41]
      }),
    });
    this.marker.addTo(this.map);
    this.map.setView(coords);

    this.marker?.on('move', ({ latlng: { lat, lng } }: any) => {
      this.changeCallback?.({ lat, long: lng });
      this._value.set({ lat, long: lng });
    })
  }

  private initScale() {
    if (!this.map) return;
    control.scale().addTo(this.map);
  }

  private initTileLayer() {
    if (!this.map) return;

    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20
    }).addTo(this.map);
  }

  writeValue(obj: any): void {
    this._value.set(GeopointSchema.optional().parse(obj));
  }
  registerOnChange(fn: any): void {
    this.changeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.touchedCallback = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
