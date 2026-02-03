import {
	CdkDrag,
	CdkDragHandle,
	CdkDragPlaceholder,
	CdkDropList,
	CdkDropListGroup
} from '@angular/cdk/drag-drop';
import { JsonPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
	Component,
	computed,
	effect,
	inject,
	input,
	linkedSignal,
	OnDestroy,
	OnInit,
	resource,
	signal
} from '@angular/core';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import {
	DebugHeaderComponent,
	DebugPanelComponent
} from '@app/components/debug';
import {
	BaseFieldItemMetaSchema,
	FieldItemMetaSchema,
	FieldTypeSchema,
	FormItemMetaOf
} from '@app/model/form';
import { FormService2 } from '@app/services/form';
import { FormItemDefinition } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideChevronDown,
	lucideChevronsUpDown,
	lucideCopy,
	lucideCopyCheck,
	lucideEdit,
	lucideEye,
	lucideFormInput,
	lucideGrip,
	lucideGroup,
	lucideImage,
	lucideInfo,
	lucideList,
	lucideLoader,
	lucidePlus,
	lucideSeparatorHorizontal,
	lucideStickyNote,
	lucideTrash2
} from '@ng-icons/lucide';
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher
} from '@spartan-ng/brain/forms';
import { BrnSelect, BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { current, produce, setAutoFreeze } from 'immer';
import { keyBy } from 'lodash';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import {
	defaultFormDefinitionSchemaValue,
	defaultFormItemDefinitionSchemaValue,
	defineFormDefinitionFormSchema,
	domainToStrictFormDefinition,
	FormItemType,
	FormModel
} from './form-schemas';

type FormItemAddTarget = FieldTree<FormModel> | FieldTree<{
	items: FormModel['items']
}>;
const formItemTypes = [
	{
		label: 'Question',
		value: 'field' as FormItemType,
		icon: 'lucideFormInput'
	},
	{ label: 'Group', value: 'group' as FormItemType, icon: 'lucideGroup' },
	{ label: 'Image', value: 'image' as FormItemType, icon: 'lucideImage' },
	{ label: 'List', value: 'list' as FormItemType, icon: 'lucideList' },
	{ label: 'Note', value: 'note' as FormItemType, icon: 'lucideStickyNote' },
	{
		label: 'Separator',
		value: 'separator' as FormItemType,
		icon: 'lucideSeparatorHorizontal'
	},
];
const formItemTypesMap = keyBy(formItemTypes, 'value');

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
			lucideStickyNote,
			lucideChevronsUpDown,
			lucideChevronDown,
			lucideImage,
			lucideList,
			lucideSeparatorHorizontal,
			lucideGrip,
			lucideTrash2
		}),
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
	],
	imports: [
		HlmFieldImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmDropdownMenuImports,
		HlmButtonGroup,
		HlmButton,
		HlmCheckbox,
		HlmSeparator,
		NgIcon,
		NgTemplateOutlet,
		CdkDrag,
		NgStyle,
		CdkDropList,
		HlmInput,
		CdkDragHandle,
		HlmSpinner,
		FormField,
		CdkDragPlaceholder,
		HlmTextarea,
		CdkDropListGroup,
		DebugPanelComponent,
		JsonPipe,
		// ClampPipe,
		DebugHeaderComponent,
		BrnSelect
	],
	templateUrl: './schema-design.page.html',
	styleUrl: './schema-design.page.scss',
	host: {
		'[class.editing]': 'enableEditingControls()',
		'[class.scrollbar-thin]': 'true',
		'[class.scrollbar-thumb-primary/50]': 'true',
		'[class.scrollbar-track-transparent]': 'true',
	}
})
export class SchemaDesignPage implements OnInit, OnDestroy {
	readonly slug = input<string>();
	private readonly formVersionQueryParameter = injectQueryParams<string>('fv', { defaultValue: 'current' })
	private readonly formService = inject(FormService2);
	private readonly formDefinition = resource({
		params: () => ({
			slug: this.slug(),
			version: this.formVersionQueryParameter()
		}),
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
	protected readonly slugCopied = signal(false);
	protected readonly enableEditingControls = linkedSignal(() => !this.slug());
	protected readonly formModel = form(this.formData, defineFormDefinitionFormSchema({
		enableEditing: this.enableEditingControls
	}));
	protected readonly formItemTypes = formItemTypes;
	protected readonly formItemTypesMap = formItemTypesMap;
	protected readonly lastAddedItemType = signal<FormItemType>('field');
	protected readonly fieldItemTypes = FieldTypeSchema.options;

	constructor() {
		effect(() => {
			console.log(this.formData());
		})
	}

	ngOnInit() {
		setAutoFreeze(false);
	}

	ngOnDestroy() {
		setAutoFreeze(true)
	}

	protected toggleEditingButtonClicked() {
		this.enableEditingControls.update(v => !v);
	}

	protected addFormItem(target: FormItemAddTarget, type: FormItemType) {
		const state = target.items().controlValue();
		target.items().setControlValue(produce(state, draft => {
			const item = defaultFormItemDefinitionSchemaValue(current(draft).length, type);
			item.type = type;
			draft.push(item);
		}));
		this.lastAddedItemType.set(type);
	}

	protected removeFormItem(target: FormItemAddTarget, index: number) {
		const state = target.items().controlValue();
		target.items().setControlValue(produce(state, draft => {
			draft.splice(index, 1);
		}));
	}

	protected asFormItem(ctrl: any) {
		return ctrl as FieldTree<Strict<FormItemDefinition>>;
	}

	protected asNoteMeta(node: any) {
		return node as FieldTree<Strict<FormItemMetaOf<'note'>>>;
	}

	protected asGenericControl(node: any) {
		return node as FieldTree<unknown>;
	}

	protected asFieldMeta(node: any) {
		return node as FieldTree<Strict<FormItemMetaOf<'field'>>>;
	}

	protected asTextFieldMeta(node: any){
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'multiline' | 'text' }>>
	}

	protected onFieldTypeChanged(node: FieldTree<Strict<FormItemMetaOf<'field'>>>, newType: any) {
		const state = node.additionalData().controlValue();
		const baseState = BaseFieldItemMetaSchema.parse(state);
		const { default: _, ...baseWithouttDefault } = baseState;
		const newState = FieldItemMetaSchema.parse({ ...baseWithouttDefault, type: newType });
		node.additionalData().setControlValue(newState as any);
	}

	protected onFieldReadonlyStatusChanged(node: FieldTree<Strict<FormItemMetaOf<'field'>>>, newState: any) {
		if (newState === false) return;
		node.additionalData.required().setControlValue(false);
	}
}
