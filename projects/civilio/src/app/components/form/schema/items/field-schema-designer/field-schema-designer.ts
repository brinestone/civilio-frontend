import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { AsyncPipe, JsonPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, forwardRef, signal, Type, untracked } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DebugHeaderComponent, DebugPanelComponent } from '@app/components/debug';
import { FormItemField, NewFormItemField } from '@civilio/sdk/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideGrip, lucideSliders, lucideTags } from '@ng-icons/lucide';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import z from 'zod';
import { FormItemActionsComponent } from '../../form-item-actions/form-item-actions.component';
import { ConfigTab, FormItemSettingsDesigner } from '../../form-item-settings/form-item-settings';
import { BaseFormItemSchemaDesigner } from '../base-item/base-form-item-schema-designer';


const slugifier = z.string().trim().slugify().nullish().default('');
@Component({
	selector: 'cv-form-field-designer',
	providers: [
		provideIcons({
			lucideSliders,
			lucideTags,
			lucideEye,
			// lucideCheck
		}),
		{ provide: BaseFormItemSchemaDesigner, useExisting: forwardRef(() => FieldSchemaDesigner) }
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
		AsyncPipe,
		NgTemplateOutlet,
		NgComponentOutlet,
		DebugPanelComponent,
		FormItemActionsComponent,
		DebugHeaderComponent,
		HlmCheckbox,
		JsonPipe
	],
	host: {
		'[class.border-border]': 'editing()'
	},
	templateUrl: './field-schema-designer.html',
	styleUrl: './field-schema-designer.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldSchemaDesigner extends BaseFormItemSchemaDesigner<FormItemField | NewFormItemField> {
	protected readonly currentConfigTab = signal('meta');
	protected tabContentComponents: Record<string, Promise<Type<any>>> = {
		meta: import('../../meta/form-field-config/form-field-config').then(m => m.FormFieldConfig),
		relevance: import('../../form-item-relevance-config/form-item-relevance-config.component').then(m => m.FormItemRelevanceConfig),
		tags: import('../../form-item-meta-config/form-item-meta-config').then(m => m.FormItemMetaConfig)
	};
	protected configTabs = [
		{
			label: 'Question configuration', value: 'meta', icon: 'lucideSliders'
		},
		{
			label: 'Relevance', value: 'relevance', icon: 'lucideEye'
		},
		{ label: 'Meta', value: 'tags', icon: 'lucideTags' }
	] as ConfigTab[];

	protected asGenericControl(node: any) {
		return node as FieldTree<unknown>;
	}
	constructor() {
		super();
		effect(() => {
			const path = untracked(this.node).path;
			const meta = untracked(this.node).config;
			const title = meta.title().value();
			const slug = title ? slugifier.parse(path().value() + ' ' + title)! : '';
			meta.dataKey().value.set(slug.slice(0, 20) || null as any);
		});
	}
}
