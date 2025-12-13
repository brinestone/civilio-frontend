import {
	AfterViewInit,
	Component, computed, effect,
	ElementRef,
	inject,
	input, resource, untracked
} from '@angular/core';
import { GeoPoint, GeoPointInputSchema } from '@civilio/shared';
import { control, icon, map, Map, marker, Marker, tileLayer } from 'leaflet';
import { injectNetwork } from 'ngxtension/inject-network';
import { sendRpcMessageAsync } from '@app/util';


@Component({
	selector: 'cv-map',
	imports: [],
	template: '',
	styleUrl: './map.component.scss',
})
export class MapComponent {
	readonly coords = input<GeoPoint, string | null>({} as any, {
		transform: s => GeoPointInputSchema.parse(s ?? {})
	});

	private ref = inject(ElementRef);
	private map?: Map;
	private initialized = false;
	private marker?: Marker;

	protected readonly network = injectNetwork();
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

	constructor() {
		effect(() => {
			const { lat, long } = this.coords();
			const coords = { lat, lng: long };
			this.marker?.setLatLng(coords);
			this.map?.setView(coords);
		});

		effect(() => {
			const markerIconUrlStatus = this.markerIconUrl.status();
			const markerShadowIconUrlStatus = this.markerShadowIconUrl.status();
			if (markerIconUrlStatus != 'resolved' || markerShadowIconUrlStatus != 'resolved' || this.initialized) return;
			const { lat, long } = untracked(this.coords);
			const coords = { lat, lng: long };
			this.map = map(this.ref.nativeElement, { center: coords, zoom: 15 });
			this.initTileLayer(this.map);
			this.initMarker(this.map);
			this.initialized = true;
		})
	}

	private initScale() {
		if (!this.map) return;
		control.scale().addTo(this.map);
	}

	private initTileLayer(map: Map) {
		tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 20
		}).addTo(map);
	}

	private initMarker(map: Map) {
		const { lat, long } = untracked(this.coords);
		const coords = { lat, lng: long };
		this.marker = marker(coords, {
			icon: icon({
				shadowUrl: untracked(this.markerShadowIconUrl.value) as string,
				iconUrl: untracked(this.markerIconUrl.value) as string,
				iconAnchor: [12, 41],
				popupAnchor: [12, 41],
				tooltipAnchor: [12, 44],
				shadowAnchor: [13, 41]
			}),
		}).addTo(map);
	}
}
