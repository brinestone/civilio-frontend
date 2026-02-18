import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { FormItemField } from '@civilio/sdk/models';
import { provideIcons } from '@ng-icons/core';
import { BaseFormItemSchemaDesigner } from '../base-item/form-item-schema-item';
import { FieldTree } from '@angular/forms/signals';
import { Strict } from '@civilio/shared';

@Component({
	selector: 'cv-form-field',
	viewProviders: [
		provideIcons({

		})
	],
	imports: [],
	templateUrl: './form-field.component.html',
	styleUrl: './form-field.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent extends BaseFormItemSchemaDesigner<FormItemField> {
	readonly node = input.required<FieldTree<Strict<FormItemField>>>();

}
