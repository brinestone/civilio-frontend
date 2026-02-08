import {
	CdkDrag,
	CdkDragDrop,
	CdkDragHandle,
	CdkDragPlaceholder,
	CdkDropList,
	CdkDropListGroup,
	moveItemInArray
} from '@angular/cdk/drag-drop';
import { JsonPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	effect,
	inject,
	input,
	linkedSignal,
	OnDestroy,
	OnInit,
	resource,
	Signal,
	signal,
	TemplateRef,
	untracked,
	viewChild
} from '@angular/core';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DatePicker, DateRangePickerComponent, MultDatePickerComponent } from '@app/components';
import {
	DebugHeaderComponent,
	DebugPanelComponent
} from '@app/components/debug';
import {
	BaseFieldItemMetaSchema,
	FieldItemMetaSchema,
	FieldType,
	FieldTypeSchema,
	FormItemMetaOf,
	SelectFieldItemMetaSchema
} from '@app/model/form';
import { Importer } from '@app/pages/importers';
import { DatasetService } from '@app/services/dataset';
import { FormService2 } from '@app/services/form';
import { DatasetItem, FormItemDefinition } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideChevronDown,
	lucideChevronsUpDown,
	lucideCopy,
	lucideCopyCheck,
	lucideDatabase,
	lucideEdit,
	lucideEye,
	lucideFile,
	lucideFormInput,
	lucideGrip,
	lucideGroup,
	lucideImage,
	lucideInfo,
	lucideLink,
	lucideList,
	lucideLoader,
	lucidePlus,
	lucideSeparatorHorizontal,
	lucideStickyNote,
	lucideTrash2,
	lucideUnlink,
	lucideX
} from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { BrnDialogContent, BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSelect, BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup, HlmButtonGroupImports } from '@spartan-ng/helm/button-group';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
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
			lucideDatabase,
			lucideX,
			lucideFile,
			lucideGrip,
			lucideTrash2,
			lucideLink,
			lucideUnlink
		}),
		DatasetService,
		// { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
	],
	imports: [
		HlmFieldImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmTabsImports,
		HlmDropdownMenuImports,
		HlmButtonGroupImports,
		HlmDialogImports,
		DatePicker,
		DateRangePickerComponent,
		BrnDialogContent,
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
		DebugHeaderComponent,
		BrnSelect,
		RouterOutlet,
		MultDatePickerComponent,
		RouterLink
	],
	templateUrl: './schema-design.page.html',
	styleUrl: './schema-design.page.scss',
	host: {
		'[class.editing]': 'enableEditingControls()',
		'[class.scrollbar-thin]': 'true',
		'[class.scrollbar-thumb-primary/50]': 'true',
		'[class.scrollbar-track-transparent]': 'true',
	},
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchemaDesignPage implements OnInit, OnDestroy {
	readonly slug = input<string>();
	protected readonly booleanTemplate = viewChild.required<TemplateRef<any>>('booleanFieldMetaConfigTemplate');
	protected readonly dateTemplate = viewChild.required<TemplateRef<any>>('dateFieldMetaConfigTemplate');
	protected readonly textTemplate = viewChild.required<TemplateRef<any>>('textFieldMetaConfigTemplate');
	protected readonly selectTemplate = viewChild.required<TemplateRef<any>>('selectFieldMetaConfigTemplate');
	protected readonly numberTemplate = viewChild.required<TemplateRef<any>>('numberFieldMetaConfigTemplate');
	protected readonly geoPointTemplate = viewChild.required<TemplateRef<any>>('geoPointFieldMetaConfigTemplate');
	protected readonly multiDateTemplate = viewChild.required<TemplateRef<any>>('multiDateFieldMetaConfigTemplate');
	protected readonly rangeDateTemplate = viewChild.required<TemplateRef<any>>('rangeDateFieldMetaConfigTemplate');

	// 2. Reference in Map
	protected readonly metaConfigTemplatesMap: Record<FieldType, Signal<TemplateRef<any>>> = {
		'boolean': this.booleanTemplate,
		'date-time': this.dateTemplate,
		'date': this.dateTemplate,
		'date-range': this.rangeDateTemplate,
		'multi-date': this.multiDateTemplate,
		'text': this.textTemplate,
		'multiline': this.textTemplate,
		'single-select': this.selectTemplate,
		'multi-select': this.selectTemplate,
		'float': this.numberTemplate,
		'integer': this.numberTemplate,
		'geo-point': this.geoPointTemplate,
	};
	private readonly navigate = dispatch(Navigate);
	private readonly cdr = inject(ChangeDetectorRef);
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
	});
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
	protected readonly ds = inject(DatasetService);
	protected readonly formItemTypes = formItemTypes;
	protected readonly formItemTypesMap = formItemTypesMap;
	protected readonly lastAddedItemType = signal<FormItemType>('field');
	protected readonly fieldItemTypes = FieldTypeSchema.options;
	protected readonly optionSourceImportSheetState = signal<BrnDialogState>('closed');
	protected readonly activeImportTab = signal('dataset');
	protected readonly importComponents = {
		dataset: () => import('../../importers/dataset/dataset-import.page').then(m => m.DatasetImportPage),
		file: () => import('../../importers/file/file-importer.page').then(m => m.FilePage)
	}
	protected readonly linkedOptionSources = signal<Record<string, DatasetItem[]>>({});
	protected readonly importSources = [
		{ value: 'dataset', icon: 'lucideDatabase', label: 'Dataset' }
	];

	constructor() {
		effect(() => {
			const formData = this.formData();
			const linkedOptionsRegistry = untracked(this.linkedOptionSources);
			for (const i of formData.items) {
				this.walkFormItemTree(i, async item => {
					if (item.type != 'field') return;
					const meta = item.meta as FormItemMetaOf<'field'>;
					if (meta.additionalData.type != 'multi-select' && meta.additionalData.type != 'single-select') return;
					const _meta = meta.additionalData;
					const ref = _meta.optionSourceRef;
					if (!ref || linkedOptionsRegistry[ref]) return;
					this.ds.getDatasetRefItems(ref).then(v => {
						if (!v || v.length == 0) return;
						this.linkedOptionSources.update(reg => produce(reg, draft => {
							draft[ref] = v;
						}))
					})
				})
			}
		})
	}

	private walkFormItemTree(item: Strict<FormItemDefinition>, cb: (item: Strict<FormItemDefinition>) => void) {
		cb(item);
		if (item.children.length > 0) {
			for (const child of item.children) {
				cb(child);
			}
		}
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

	protected asTextFieldMeta(node: any) {
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'multiline' | 'text' }>>
	}

	protected asSelectFieldMeta(node: any) {
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'single-select' | 'multi-select' }>>
	}

	protected asBooleanFieldMeta(node: any) {
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'boolean' }>>;
	}

	protected asNumberFieldMeta(node: any) {
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'integer' | 'float' }>>;
	}

	protected asDateFieldMeta(node: any) {
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], {type: 'date' | 'date-time'}>>;
	}

	protected asRangeDateFieldMeta(node: any) {
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'date-range' }>>;
	}

	protected asMultiDateFieldMeta(node: any) {
		return node as FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'multi-date' }>>;
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

	protected onAddHardOptionButtonClicked(node: FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'single-select' | 'multi-select' }>>) {
		const state = node.hardOptions().controlValue();
		const newOption = SelectFieldItemMetaSchema.shape.hardOptions.unwrap().unwrap().parse({});
		node.hardOptions().setControlValue(produce(state, draft => {
			draft.unshift(newOption as any);
			setTimeout(() => this.cdr.markForCheck(), 0);
		}))
	}

	protected onRemoveHardOptionButtonClicked(node: FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'single-select' | 'multi-select' }>>, index: number) {
		const state = node().controlValue();
		node().setControlValue(produce(state, draft => {
			const defaultValue = current(draft).default;
			const targetOption = current(draft).hardOptions[index];
			const isDefault = defaultValue && defaultValue === targetOption.value;

			if (isDefault) draft.default = null;
			draft.hardOptions.splice(index, 1);
		}));
	}

	protected onHardOptionsReordered(event: CdkDragDrop<any>, node: FieldTree<Extract<Strict<FormItemMetaOf<'field'>>['additionalData'], { type: 'single-select' | 'multi-select' }>>) {
		const state = node().controlValue();
		node().setControlValue(produce(state, draft => {
			moveItemInArray(draft.hardOptions, event.previousIndex, event.currentIndex);
		}))
	}
	protected onOptionSourceImportDialogStateChanged(value: BrnDialogState) {
		this.optionSourceImportSheetState.set(value);
		if (value == 'open')
			this.navigate([{ outlets: { importer: ['import-dataset'] } }]).subscribe();
		else this.navigate([{ outlets: { importer: null } }]).subscribe();
	}
	protected importerOutletRouteActivationCallback?: (i: Importer) => void;
	protected onLinkOptionSourceButtonClicked(meta: ReturnType<typeof this.asSelectFieldMeta>) {
		const linked = !!meta.optionSourceRef().value();
		const state = meta().controlValue();
		if (!linked) {
			this.importerOutletRouteActivationCallback = importer => {
				importer.finished.subscribe(refId => {
					meta().setControlValue(produce(state, draft => {
						draft.optionSourceRef = refId;
						setTimeout(() => this.optionSourceImportSheetState.set('closed'))
					}));
					// this.ds.getDatasetRefItems(refId).then(items => {
					// 	if (!items) {
					// 		meta().setControlValue(produce(state, draft => {
					// 			(draft as any).optionSourceRef = null;
					// 		}))
					// 	} else {
					// 		this.linkedOptionSources.update(reg => produce(reg, draft => {
					// 			draft[refId] = items
					// 		}))
					// 	}
					// });
				})
			};
			this.optionSourceImportSheetState.set('open');
		} else {
			meta().setControlValue(produce(state, draft => {
				(draft as any).optionSourceRef = null;
			}));
		}
	}
}
