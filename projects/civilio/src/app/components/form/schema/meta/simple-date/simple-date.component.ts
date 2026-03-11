import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DatePicker } from '@app/components/date-picker/date-picker';
import { FieldError } from '@app/components/form';
import { SimpleDateFieldConfig } from '@civilio/sdk/models';
import { HlmField, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { BaseFieldConfig } from '../base-meta-config/base-meta-config.component';

@Component({
	selector: 'cv-simple-date',
	imports: [
		DatePicker,
		HlmFieldLabel,
		FormField,
		HlmField,
		FieldError
	],
	hostDirectives: [HlmFieldGroup],
	templateUrl: './simple-date.component.html',
	styleUrl: './simple-date.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleDateComponent extends BaseFieldConfig<SimpleDateFieldConfig> {

}
