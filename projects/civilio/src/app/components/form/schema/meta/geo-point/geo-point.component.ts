import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormField } from "@angular/forms/signals";
import { GeoPointPicker } from '@app/components/geo-point-picker/geo-point-picker.component';
import { GeoPointFieldConfig } from '@civilio/sdk/models';
import { HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { BaseFieldConfig } from '../base-meta-config/base-meta-config.component';

@Component({
	selector: 'cv-geo-point-meta',
	imports: [
		GeoPointPicker,
		HlmFieldLabel,
		FormField
	],
	hostDirectives: [
		HlmFieldGroup
	],
	templateUrl: './geo-point.component.html',
	styleUrl: './geo-point.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoPointMetaComponent extends BaseFieldConfig<GeoPointFieldConfig> {

}
