import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DebugHeaderComponent, DebugPanelComponent } from '@app/components/debug';
import { FormItemField } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideEye, lucideGrip, lucideSliders } from '@ng-icons/lucide';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { FormFieldMetaConfigComponent } from '../../meta/form-field-meta-config/form-field-meta-config';
import { FormItemActionsComponent } from '../../form-item-actions/form-item-actions.component';
import { FormItemRelevanceConfigComponent } from '../../form-item-relevance-config/form-item-relevance-config.component';
import { ConfigTab, FormItemSettingsDesigner } from '../../form-item-settings/form-item-settings';
import { FormItemValidationConfigComponent } from '../../form-item-validation-config/form-item-validation-config.component';
import { BaseFormItemSchemaDesigner } from '../base-item/base-form-item-schema-designer';

@Component({
	selector: 'cv-form-field-designer',
	providers: [
		provideIcons({
			lucideSliders,
			lucideEye,
			lucideCheck
		})
	],
	viewProviders: [
		provideIcons({
			lucideGrip
		})
	],
	imports: [
		HlmFieldImports,
		FormItemSettingsDesigner,
		CdkDragHandle,
		HlmInput,
		FormField,
		NgIcon,
		HlmSpinner,
		NgTemplateOutlet,
		FormFieldMetaConfigComponent,
		FormItemRelevanceConfigComponent,
		FormItemValidationConfigComponent,
		DebugPanelComponent,
		FormItemActionsComponent,
		DebugHeaderComponent,
		JsonPipe
	],
	host: {
		'[class.border-border]': 'editing()'
	},
	templateUrl: './field-schema-designer.html',
	styleUrl: './field-schema-designer.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldSchemaDesigner extends BaseFormItemSchemaDesigner<FormItemField> {
	readonly node = input.required<FieldTree<Strict<FormItemField>>>();
	protected readonly currentConfigTab = signal('meta');
	protected configTabs = [
		{ label: 'Question configuration', value: 'meta', icon: 'lucideSliders' },
		{ label: 'Relevance', value: 'relevance', icon: 'lucideEye' },
		{ label: 'Validation', value: 'validation', icon: 'lucideCheck' }
	] as ConfigTab[];

	protected asGenericControl(node: any) {
		return node as FieldTree<unknown>;
	}
}
