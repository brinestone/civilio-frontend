import { CdkDrag, CdkDragHandle, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, linkedSignal, OnDestroy, OnInit, resource, signal } from '@angular/core';
import { FieldTree, form } from '@angular/forms/signals';
import { FormService2 } from '@app/services/form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideCopy, lucideCopyCheck, lucideEdit, lucideEye, lucideFormInput, lucideGroup, lucideInfo, lucideLoader, lucidePlus } from '@ng-icons/lucide';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { current, produce, setAutoFreeze } from 'immer';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { defaultFormDefinitionSchemaValue, defaultFormItemDefinitionSchemaValue, defineFormDefinitionFormSchema, domainToStrictFormDefinition, FormModel } from './form-schemas';
import { FormItemDefinition } from '@civilio/sdk/models';
import { NgxDotpatternComponent } from '@omnedia/ngx-dotpattern';
// import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';


type FormItemAddTarget = FieldTree<{ items: FormModel['items'] }>;
type FormItemType = NonNullable<FormItemDefinition['type']>;
@Component({
	selector: 'cv-forms',
	viewProviders: [
		provideIcons({
			lucideLoader,
			lucideCopy,
			lucideEye,
			lucideInfo,
			lucideCopyCheck,
			lucideEdit,
			lucideFormInput,
			lucideGroup,
			lucidePlus,
			lucideChevronDown
		}),
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
	],
	imports: [
		HlmFieldImports,
		HlmButtonGroup,
		NgxDotpatternComponent,
		HlmButton,
		NgIcon,
		NgTemplateOutlet,
		CdkDrag,
		CdkDropList,
		CdkDragHandle,
		CdkDropListGroup
	],
	templateUrl: './schema-design.page.html',
	styleUrl: './schema-design.page.scss',
})
export class SchemaDesignPage implements OnInit, OnDestroy {
	readonly slug = input<string>();
	private readonly formVersionQueryParameter = injectQueryParams<string>('fv', { defaultValue: 'current' })
	private readonly formService = inject(FormService2);
	private readonly formDefinition = resource({
		params: () => ({ slug: this.slug(), version: this.formVersionQueryParameter() }),
		loader: async ({ params }) => {
			if (!params.slug) return undefined;
			return await this.formService.findFormDefinition(params.slug, params.version ?? undefined);
		}
	})
	private readonly formData = linkedSignal(() => {
		const v = this.formDefinition.value();
		if (v) return domainToStrictFormDefinition(v);
		return defaultFormDefinitionSchemaValue();
	});
	protected readonly lastAddedItemType = signal<FormItemType>('field');
	protected readonly slugCopied = signal(false);
	protected readonly enableEditingControls = linkedSignal(() => !this.slug());
	protected readonly formModel = form(this.formData, defineFormDefinitionFormSchema({
		enableEditing: this.enableEditingControls
	}));

	ngOnInit() {
		setAutoFreeze(false);
	}

	ngOnDestroy() {
		setAutoFreeze(true)
	}

	protected toggleEditingButtonClicked() {
		this.enableEditingControls.update(v => !v);
	}

	private addFormItem(target: FormItemAddTarget, type: FormItemType) {
		const state = target.items().controlValue();
		target.items().setControlValue(produce(state, draft => {
			const item = defaultFormItemDefinitionSchemaValue(current(draft).length);
			item.type = type;
			draft.push(item);
		}));
		this.lastAddedItemType.set(type);
	}

	protected addField(target: FormItemAddTarget) {
		this.addFormItem(target, 'field');
	}

	protected addNote(target: FormItemAddTarget) {
		this.addFormItem(target, 'note');
	}
}
