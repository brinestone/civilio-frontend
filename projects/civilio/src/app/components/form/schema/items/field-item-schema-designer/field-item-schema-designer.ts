import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { AsyncPipe, JsonPipe, NgClass, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, effect, input, signal, Type, untracked } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DebugHeader, DebugPanel } from '@app/components/debug';
import { FormItemField, NewFormItemField } from '@civilio/sdk/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideGrip, lucideSliders, lucideTags } from '@ng-icons/lucide';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import z from 'zod';
import { FormItemActions } from '../../form-item-actions/form-item-actions.component';
import { ConfigTab, FormItemSettingsDesigner } from '../../form-item-settings/form-item-settings';
import { BaseFormItemSchemaDesigner } from '../base-item-schema-designer/base-form-item-schema-designer';
import { BooleanInput } from '@angular/cdk/coercion';


const slugifier = z.string().trim().slugify().nullish().default('');
@Component({
	selector: 'cv-form-field-designer',
	providers: [
		provideIcons({
			lucideSliders,
			lucideTags,
			lucideEye,
		}),
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
		NgClass,
		DebugPanel,
		FormItemActions,
		DebugHeader,
		JsonPipe
	],// block bg-(--card) rounded rounded-tl-none focus-within:border-(--primary)'
	host: {
		'[class.border-border]': 'editing() && !noWrapper()',
		'[class.border]': '!noWrapper()',
		'[class.bg-card]': '!noWrapper()',
		'[class.rounded]': '!noWrapper()',
		'[class.rounded-tl-none]': '!noWrapper()',
		'[class.focus-within:border-primary]': '!noWrapper()',
	},
	templateUrl: './field-item-schema-designer.html',
	styleUrl: './field-item-schema-designer.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldItemSchemaDesigner extends BaseFormItemSchemaDesigner<FormItemField | NewFormItemField> {
	readonly noWrapper = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
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
