import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SimpleDateFieldMeta } from '@civilio/sdk/models';
import { BaseMetaConfigComponent } from '../base-meta-config/base-meta-config.component';
import { HlmFieldGroup, HlmField, HlmFieldLabel } from '@spartan-ng/helm/field';
import { DatePicker } from '@app/components/date-picker/date-picker';
import { FormField } from '@angular/forms/signals';
import { FieldError } from '@app/components/form';

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
export class SimpleDateComponent extends BaseMetaConfigComponent<SimpleDateFieldMeta> {

}
