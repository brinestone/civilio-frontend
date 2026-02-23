import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DatePicker, MultiDatePicker } from '@app/components';
import { FieldError } from '@app/components/form';
import { MultiDateFieldMeta } from '@civilio/sdk/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmField, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { BaseMetaConfigComponent } from '../base-meta-config/base-meta-config.component';

@Component({
	selector: 'cv-multi-date',
	viewProviders: [
		provideIcons({
			lucideX
		})
	],
	imports: [
		HlmButtonGroup,
		HlmField,
		HlmFieldLabel,
		DatePicker,
		HlmInput,
		FieldError,
		HlmButton,
		NgIcon,
		FormField,
		MultiDatePicker
	],
	hostDirectives: [
		HlmFieldGroup
	],
	templateUrl: './multi-date.component.html',
	styleUrl: './multi-date.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiDateComponent extends BaseMetaConfigComponent<MultiDateFieldMeta> {

}
