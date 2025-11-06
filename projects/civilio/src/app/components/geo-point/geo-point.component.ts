import { BooleanInput } from '@angular/cdk/coercion';
import { DecimalPipe } from '@angular/common';
import { booleanAttribute, Component, computed, effect, ElementRef, input, linkedSignal, model, output, resource, untracked, viewChild } from '@angular/core';
import { sendRpcMessageAsync } from '@app/util';
import { GeoPoint, GeopointSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { control, icon, LatLng, latLng, LeafletMouseEvent, map, Map, marker, Marker, tileLayer } from 'leaflet';
import { createNotifier } from 'ngxtension/create-notifier';
import { injectNetwork } from 'ngxtension/inject-network';

@Component({
	selector: 'cv-geo-point',
	viewProviders: [
		provideIcons({
			lucideCircleAlert
		})
	],
	imports: [
		DecimalPipe,
		TranslatePipe,
		NgIcon
	],
	templateUrl: './geo-point.component.html',
	styleUrl: './geo-point.component.scss'
})
export class GeoPointComponent {
	public readonly value = input<GeoPoint>();
	public readonly touched = output();
	public readonly changed = output<GeoPoint>();
	public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

	private map?: Map;
	private initialized = false;
	private marker?: Marker;
	private eventTriggeredChange = false;
	private onlineNotifier = createNotifier();

	protected readonly network = injectNetwork()
	protected mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
	protected readonly _value = computed(() => GeopointSchema.parse(this.value() ?? {}));
	protected readonly resolvedCoords = linkedSignal(() => latLng(this._value().lat, this._value().long));
	protected readonly markerIconUrl = resource({
		loader: async () => {
			return await sendRpcMessageAsync('resource:read', 'img/marker-icon.png');
		}
	});
	protected readonly markerShadowIconUrl = resource({
		loader: async () => {
			return await sendRpcMessageAsync('resource:read', 'img/marker-shadow.png');
		}
	});

	private onMapClicked({
		latlng
	}: LeafletMouseEvent) {
		this.eventTriggeredChange = true;
		this.moveMarker(latlng);
		this.eventTriggeredChange = false;
		this.touched.emit();
	}

	private moveMarker(coords: LatLng) {
		this.marker?.setLatLng(coords);
	}

	private initMarker() {
		if (!this.map) return;


		this.marker = marker(untracked(this.resolvedCoords), {
			icon: icon({
				shadowUrl: this.markerShadowIconUrl.value() as string,
				iconUrl: this.markerIconUrl.value() as string,
				iconAnchor: [12, 41],
				popupAnchor: [12, 41],
				tooltipAnchor: [12, 44],
				shadowAnchor: [13, 41]
			}),
		}).addTo(this.map)
			.on('move', ({ latlng: { lat, lng } }: any) => {
				if (!this.eventTriggeredChange) return;
				this.changed.emit({ lat, long: lng });
			});
		this.map.setView(untracked(this.resolvedCoords));
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

	constructor() {

		effect(() => {
			const _ = this.value();
			const coords = untracked(this.resolvedCoords);
			this.moveMarker(coords);
			this.map?.setView(coords);
		})

		effect(() => {
			const markerIconUrlStatus = this.markerIconUrl.status();
			const markerShadowIconUrlStatus = this.markerShadowIconUrl.status();
			this.onlineNotifier.listen();

			if (markerIconUrlStatus != 'resolved' || markerShadowIconUrlStatus != 'resolved' || this.initialized) return;
			this.map = map(this.mapContainer().nativeElement,
				{
					center: untracked(this.resolvedCoords),
					zoom: 16
				}).on('click', this.onMapClicked.bind(this));
			this.initTileLayer();
			this.initScale();
			this.initMarker();
			this.initialized = true;
		});

		effect(() => {
			const disabled = this.disabled();
			const online = this.network.online();
			const components = [
				this.map?.dragging,
				this.map?.touchZoom,
				this.map?.doubleClickZoom,
				this.map?.scrollWheelZoom,
				this.map?.boxZoom,
				this.map?.keyboard,
			];
			if (disabled || !online) {
				components.forEach(c => c?.disable());
			} else {
				components.forEach(c => c?.enable());
			}

			if (disabled) {
				components.forEach(c => c?.disable());
			} else {
				components.forEach(c => c?.enable());
			}
		})
	}
}
