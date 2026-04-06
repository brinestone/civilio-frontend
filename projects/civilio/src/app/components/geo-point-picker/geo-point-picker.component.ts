import { BooleanInput } from '@angular/cdk/coercion';
import { DecimalPipe, NgClass } from '@angular/common';
import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, ElementRef, inject, input, linkedSignal, model, Renderer2, untracked, viewChild, ViewContainerRef } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { GeoPoint } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { control, icon, LatLng, latLng, LeafletMouseEvent, map, Map, marker, Marker, tileLayer } from 'leaflet';
import { injectNetwork } from 'ngxtension/inject-network';

@Component({
	selector: 'cv-geo-point-picker',
	imports: [
		DecimalPipe,
		NgClass,
		HlmButton,
		NgIcon
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './geo-point-picker.component.html',
	styleUrl: './geo-point-picker.component.scss',
	viewProviders: [
		provideIcons({
			lucideAlertTriangle,
			lucideX
		})
	],
	host: {
		'[class.ng-invalid]': 'invalid()',
		'[class.ng-valid]': 'valid()',
		'[class.ng-touched]': 'touched()',
		'[class.ng-untouched]': '!touched()',
		'[class.ng-dirty]': 'dirty()',
		'[class.ng-pristine]': '!dirty()',
		'[class.ng-pending]': 'pending()',
		'[attr.aria-invalid]': 'invalid()',
		'[attr.aria-valid]': 'valid()',
		'[attr.aria-touched]': 'touched()',
		'[attr.aria-untouched]': '!touched()',
		'[attr.aria-dirty]': 'dirty()',
		'[attr.aria-pristine]': '!dirty()',
		'[attr.aria-pending]': 'pending()',
		class: 'group/geo-point-picker',
	}
})
export class GeoPointPicker implements AfterViewInit, FormValueControl<GeoPoint | null | undefined> {
	public readonly value = model<GeoPoint | null | undefined>();
	public readonly dirty = input<boolean, unknown>(false, { transform: booleanAttribute })
	public readonly pending = input<boolean, unknown>(false, { transform: booleanAttribute })
	public readonly invalid = input<boolean, unknown>(false, { transform: booleanAttribute })
	public readonly touched = model<boolean>(false);
	public readonly valid = computed(() => !this.invalid());
	public readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
	public readonly clearable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly elementId = input<string>(undefined, { alias: 'id' });

	protected readonly lat = linkedSignal(() => this.value()?.lat ?? 3.8614800698189145);
	protected readonly long = linkedSignal(() => this.value()?.long ?? 11.520851415955367);
	protected readonly resolvedCoords = computed(() => latLng(this.lat(), this.long()));

	private map?: Map;
	private marker?: Marker;
	private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
	private readonly cdr = inject(ChangeDetectorRef);
	protected readonly network = injectNetwork();

	constructor(renderer: Renderer2, container: ViewContainerRef) {
		effect(() => {
			const marker = this.marker;
			const value = this.value();
			if (!marker) return;
			if (!value) {
				marker.removeFrom(this.map!);
			} else {
				marker.addTo(this.map!);
				marker.setLatLng(untracked(this.resolvedCoords));
				this.map?.setView(untracked(this.resolvedCoords));
			}
		});
		effect(() => {
			const id = this.elementId();
			if (id) {
				renderer.setAttribute(container.element.nativeElement, 'id', id);
			} else {
				renderer.removeAttribute(container.element.nativeElement, 'id');
			}
		})
	}

	ngAfterViewInit() {
		const m = map(this.mapContainer().nativeElement, {
			center: this.resolvedCoords(),
			zoom: 13
		}).on('click', event => {
			if (this.disabled()) return;
			this.onMapClicked(event);
		});
		const anchor = document.querySelector<HTMLAnchorElement>('a[href="https://leafletjs.com"]');
		if (anchor) {
			anchor.target = '_blank';
		}
		this.map = m;
		this.initTileLayer(m);
		this.initScale(m);
		this.initMarker(m);
		m.setView(this.resolvedCoords());
		this.cdr.markForCheck();
	}

	private initScale(map: Map) {
		control.scale().addTo(map);
	}

	private initTileLayer(map: Map) {
		tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 20
		}).addTo(map);
	}

	private initMarker(map: Map) {
		this.marker = marker(this.resolvedCoords(), {
			icon: icon({
				shadowUrl: shadowURL,
				iconUrl: markerURL,
				iconAnchor: [12, 41],
				popupAnchor: [12, 41],
				tooltipAnchor: [12, 41],
				shadowAnchor: [13, 41]
			})
		});
		if (this.value()) {
			this.marker.addTo(map);
		}
	}

	protected onMapClicked(event: LeafletMouseEvent & { latlng: LatLng }) {
		this.value.set({
			lat: event.latlng.lat,
			long: event.latlng.lng
		});
		this.marker?.setLatLng(event.latlng);
		this.touched.set(true);
	}
}



const shadowURL = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC`;
const markerURL = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=`;
