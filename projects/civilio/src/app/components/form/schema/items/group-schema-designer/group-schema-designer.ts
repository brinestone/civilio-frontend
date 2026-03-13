import { CdkDragHandle } from "@angular/cdk/drag-drop";
import { AsyncPipe, JsonPipe, NgComponentOutlet, NgTemplateOutlet } from "@angular/common";
import { Component, computed, effect, signal, Type } from "@angular/core";
import { FormField } from "@angular/forms/signals";
import { DebugHeader, DebugPanel } from "@app/components/debug";
import { FieldError } from "@app/components/form/field-error/field-error.component";
import { HINT, PLACEHOLDER } from "@app/pages/forms/schemas/form-designer-config";
import { FormItemGroup } from "@civilio/sdk/models";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEye, lucideGrip, lucideSliders, lucideTags } from "@ng-icons/lucide";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { FormItemActions } from "../../form-item-actions/form-item-actions.component";
import { ConfigTab, FormItemSettingsDesigner } from "../../form-item-settings/form-item-settings";
import { BaseFormItemSchemaDesigner } from "../base-item-schema-designer/base-form-item-schema-designer";
import { HlmSpinner } from "@spartan-ng/helm/spinner";

@Component({
	selector: "cv-group-schema-designer",
	providers: [
		provideIcons({
			lucideSliders,
			lucideEye,
			lucideTags
		})
	],
	viewProviders: [
		provideIcons({
			lucideGrip,
		})
	],
	imports: [
		HlmFieldImports,
		FormItemSettingsDesigner,
		FormItemActions,
		FormField,
		FieldError,
		DebugPanel,
		DebugHeader,
		JsonPipe,
		HlmSpinner,
		CdkDragHandle,
		NgIcon,
		AsyncPipe,
		NgComponentOutlet,
		NgTemplateOutlet
	],
	host: {
		'[class.border-border]': 'editing()'
	},
	templateUrl: "./group-schema-designer.html",
	styleUrl: "./group-schema-designer.scss",
})
export class GroupSchemaDesigner extends BaseFormItemSchemaDesigner<FormItemGroup | FormItemGroup> {
	protected currentTab = signal('meta');
	protected tabContentComponents: Record<string, Promise<Type<any>>> = {
		meta: import('../../meta/form-group-config/form-group-config').then(m => m.FormGroupConfig),
		relevance: import('../../form-item-relevance-config/form-item-relevance-config.component').then(m => m.FormItemRelevanceConfig),
		tags: import('../../form-item-meta-config/form-item-meta-config').then(m => m.FormItemMetaConfig)
	};
	protected configTabs = [
		{ label: 'Group configuration', value: 'meta', icon: 'lucideSliders' },
		{ label: 'Relevance', value: 'relevance', icon: 'lucideEye' },
		{ label: 'Meta', value: 'tags', icon: 'lucideTags' }
	] as ConfigTab[];
	protected readonly titlePlaceholder = computed(() => {
		return this.node().config.title().metadata(PLACEHOLDER)?.();
	});
	protected readonly titleHint = computed(() => {
		this.node().config.title().metadata(HINT)?.();
	});
	protected readonly descriptionPlaceholder = computed(() => {
		return this.node().config.description().metadata(PLACEHOLDER)?.();
	});
	constructor() {
		super();
		effect(() => {
			console.log(this.titleHint());
		})
	}
}
