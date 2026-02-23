import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GeoPointFieldMeta } from '@civilio/sdk/models';
import { BaseMetaConfigComponent } from '../base-meta-config/base-meta-config.component';
import { HlmFieldGroup } from '@spartan-ng/helm/field';
import { GeoPointPicker } from '@app/components/geo-point-picker/geo-point-picker.component';
import { FormField } from "@angular/forms/signals";

@Component({
  selector: 'cv-geo-point-meta',
  imports: [
    GeoPointPicker,
    FormField
],
	hostDirectives: [
		HlmFieldGroup
	],
  templateUrl: './geo-point.component.html',
  styleUrl: './geo-point.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoPointMetaComponent extends BaseMetaConfigComponent<GeoPointFieldMeta> {

}
