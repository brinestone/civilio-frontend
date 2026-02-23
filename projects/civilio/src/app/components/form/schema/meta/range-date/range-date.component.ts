import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DatePicker, DateRangePicker } from '@app/components';
import { FieldError } from '@app/components/form';
import { RangeDateFieldMeta } from '@civilio/sdk/models';
import { BaseMetaConfigComponent } from '../base-meta-config/base-meta-config.component';
import { HlmField, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';

@Component({
	selector: 'cv-range-date-meta',
	imports: [
		DatePicker,
		HlmField,
		HlmFieldLabel,
		FieldError,
		DateRangePicker,
		FormField
	],
	hostDirectives: [
		HlmFieldGroup
	],
	templateUrl: './range-date.component.html',
	styleUrl: './range-date.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeDateMetaComponent extends BaseMetaConfigComponent<RangeDateFieldMeta> {

}
