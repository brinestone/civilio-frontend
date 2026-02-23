import {
	CdkDrag,
	CdkDragDrop,
	CdkDragHandle,
	CdkDragPlaceholder,
	CdkDropList,
	CdkDropListGroup,
	moveItemInArray
} from '@angular/cdk/drag-drop';
import { AsyncPipe, JsonPipe, NgComponentOutlet, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	inject,
	Injector,
	input,
	isDevMode,
	linkedSignal,
	OnDestroy,
	OnInit,
	resource,
	Signal,
	signal,
	TemplateRef,
	Type,
	untracked,
	viewChild
} from '@angular/core';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DatePicker, DateRangePicker, GeoPointPickerComponent, ImageFormItem, MultDatePickerComponent, NumberRangeInputComponent } from '@app/components';
import {
	DebugHeaderComponent,
	DebugPanelComponent
} from '@app/components/debug';
import { Resizable } from '@app/directives';
import {
	BaseFieldItemMetaSchema,
	FieldItemMetaSchema,
	FieldType,
	FieldTypeSchema,
	isGroupItem,
	SelectFieldItemMetaSchema
} from '@app/model/form';
import { Importer } from '@app/pages/importers';
import { DatasetService } from '@app/services/dataset';
import { FormService2 } from '@app/services/form';
import { UploadService } from '@app/services/upload';
import { BooleanFieldMeta, DatasetItem, FieldItemMeta, FormItemDefinition, FormItemField, FormItemGroup, FormItemImage, FormItemNote, GeoPointFieldMeta, ImageItemMeta_filter, MultiDateFieldMeta, NumberFieldMeta, RangeDateFieldMeta, RelevanceCondition, SelectFieldMeta, SimpleDateFieldMeta, TextFieldMeta } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideAtSign,
	lucideCalendar,
	lucideCalendarCheck,
	lucideCalendarRange,
	lucideCheck,
	lucideCheckSquare,
	lucideChevronDown,
	lucideChevronsUpDown,
	lucideClock,
	lucideCopy,
	lucideCopyCheck,
	lucideDatabase,
	lucideEdit,
	lucideEllipsis,
	lucideEye,
	lucideFile,
	lucideFolderPlus,
	lucideFormInput,
	lucideGrip,
	lucideGroup,
	lucideHash,
	lucideImage,
	lucideInfo,
	lucideLink,
	lucideList,
	lucideListChecks,
	lucideLoader,
	lucideMapPin,
	lucidePhone,
	lucidePlus,
	lucideSeparatorHorizontal,
	lucideSettings,
	lucideStickyNote,
	lucideText,
	lucideTextCursorInput,
	lucideTrash2,
	lucideUnlink,
	lucideX
} from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { BrnDialogContent, BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSelect, BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup, HlmButtonGroupImports } from '@spartan-ng/helm/button-group';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmToggle } from '@spartan-ng/helm/toggle';
import { HlmToggleGroup, HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { current, produce, setAutoFreeze } from 'immer';
import { get, keyBy } from 'lodash';
import { toast } from 'ngx-sonner';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import z from 'zod';
import {
	defaultFormDefinitionSchemaValue,
	defaultFormItemDefinitionSchemaValue,
	defaultRelevanceExpression,
	defaultRelevanceLogic,
	defineFormDefinitionFormSchema,
	domainToStrictFormDefinition,
	fieldTypeExpressionOperatorsMap,
	FormItemType,
	FormModel,
	operatorsMap,
	pathSeparator
} from './form-schemas';
import { FormItemContext, FormItemContextToken } from '@app/components/form/schema/items';

type DesignerState = { expanded: boolean; previewing: boolean; activeConfigSection: string; };

const isFieldTree = (v: FieldTree<Strict<FormItemDefinition>>): v is FieldTree<Strict<FormItemField>> => v.type().value() === 'field';
type FormItemAddTarget = FieldTree<FormModel> | FieldTree<FormItemGroup>;
const formItemTypes = [
	{
		label: 'Question',
		value: 'field' as FormItemType,
		icon: 'lucideFormInput'
	},
	{ label: 'Group', value: 'group' as FormItemType, icon: 'lucideGroup' },
	{ label: 'Image', value: 'image' as FormItemType, icon: 'lucideImage' },
	// { label: 'List', value: 'list' as FormItemType, icon: 'lucideList' },
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
			lucideAtSign,
			lucidePhone,
			lucideLoader,
			lucideSettings,
			lucideCopy,
			lucideEye,
			lucideInfo,
			lucideCopyCheck,
			lucideEdit,
			lucideFormInput,
			lucideGroup,
			lucidePlus,
			lucideStickyNote,
			lucideTextCursorInput,
			lucideChevronsUpDown,
			lucideChevronDown,
			lucideImage,
			lucideEllipsis,
			lucideList,
			lucideSeparatorHorizontal,
			lucideDatabase,
			lucideX,
			lucideFile,
			lucideFolderPlus,
			lucideGrip,
			lucideTrash2,
			lucideLink,
			lucideUnlink,
			lucideCheckSquare,
			lucideCalendar,
			lucideCheck,
			lucideListChecks,
			lucideText,
			lucideClock,
			lucideHash,
			lucideCalendarCheck,
			lucideCalendarRange,
			lucideMapPin
		}),
	],
	imports: [
		HlmFieldImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmTabsImports,
		HlmInputGroupImports,
		HlmDropdownMenuImports,
		HlmButtonGroupImports,
		HlmAlertImports,
		HlmDialogImports,
		HlmToggleGroupImports,
		HlmTabsImports,
		DatePicker,
		NumberRangeInputComponent,
		DateRangePicker,
		BrnDialogContent,
		HlmButtonGroup,
		HlmIcon,
		HlmLabel,
		HlmButton,
		HlmToggle,
		HlmCheckbox,
		HlmSeparator,
		NgIcon,
		NgTemplateOutlet,
		CdkDrag,
		NgStyle,
		CdkDropList,
		ImageFormItem,
		Resizable,
		HlmInput,
		GeoPointPickerComponent,
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
		AsyncPipe,
		RouterLink,
		NgComponentOutlet
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
	private readonly uploadService = inject(UploadService);

	protected readonly formItemComponents = {
		'field': import('../../../components/form/schema/items/field-schema-designer/field-schema-designer').then(m => m.FieldSchemaDesigner)
	} as Record<string, Promise<Type<any>>>;

	protected readonly relevanceConfigTemplate = viewChild.required<TemplateRef<any>>('relevanceConfigTemplate');

	protected readonly booleanTemplate = viewChild.required<TemplateRef<any>>('booleanFieldMetaConfigTemplate');
	protected readonly dateTemplate = viewChild.required<TemplateRef<any>>('dateFieldMetaConfigTemplate');
	protected readonly textTemplate = viewChild.required<TemplateRef<any>>('textFieldMetaConfigTemplate');
	protected readonly selectTemplate = viewChild.required<TemplateRef<any>>('selectFieldMetaConfigTemplate');
	protected readonly numberTemplate = viewChild.required<TemplateRef<any>>('numberFieldMetaConfigTemplate');
	protected readonly geoPointTemplate = viewChild.required<TemplateRef<any>>('geoPointFieldMetaConfigTemplate');
	protected readonly multiDateTemplate = viewChild.required<TemplateRef<any>>('multiDateFieldMetaConfigTemplate');
	protected readonly rangeDateTemplate = viewChild.required<TemplateRef<any>>('rangeDateFieldMetaConfigTemplate');

	protected readonly noteItemTemplate = viewChild.required<TemplateRef<any>>('noteItemTemplate');
	protected readonly fieldItemTemplate = viewChild.required<TemplateRef<any>>('fieldItemTemplate');
	protected readonly separatorItemTemplate = viewChild.required<TemplateRef<any>>('separatorItemTemplate');
	protected readonly imageItemTemplate = viewChild.required<TemplateRef<any>>('imageItemTemplate');

	protected readonly textExpressionValueTemplate = viewChild.required<TemplateRef<any>>('textExpressionValueTemplate');
	protected readonly numberExpressionValueTemplate = viewChild.required<TemplateRef<any>>('numberExpressionValueTemplate');
	protected readonly selectExpressionValueTemplate = viewChild.required<TemplateRef<any>>('selectExpressionValueTemplate');
	protected readonly dateExpressionValueTemplate = viewChild.required<TemplateRef<any>>('dateExpressionValueTemplate');
	protected readonly multiDateExpressionValueTemplate = viewChild.required<TemplateRef<any>>('multiDateExpressionValueTemplate');
	protected readonly rangeDateExpressionValueTemplate = viewChild.required<TemplateRef<any>>('rangeDateExpressionValueTemplate');

	protected readonly fieldItemMetaTemplate = viewChild.required<TemplateRef<any>>('fieldItemMetaTemplate');

	protected readonly fieldTypeExpressionValueTemplatesMap = {
		'date-range': this.rangeDateExpressionValueTemplate,
		'multi-date': this.multiDateExpressionValueTemplate,
		'date-time': this.dateExpressionValueTemplate,
		'date': this.dateExpressionValueTemplate,
		'single-select': this.selectExpressionValueTemplate,
		'multi-select': this.selectExpressionValueTemplate,
		'float': this.numberExpressionValueTemplate,
		'integer': this.numberExpressionValueTemplate,
		'text': this.textExpressionValueTemplate,
		'multiline': this.textExpressionValueTemplate,
	} as Record<string, Signal<TemplateRef<any>>>;

	protected readonly itemTemplatesMap: Record<string, Signal<TemplateRef<any>>> = {
		'field': this.fieldItemTemplate,
		'note': this.noteItemTemplate,
		'separator': this.separatorItemTemplate,
		'image': this.imageItemTemplate,
	};
	protected readonly itemMetaTemplatesMap: Record<string, { meta: Signal<TemplateRef<any>>, relevance: Signal<TemplateRef<any>> }> = {
		'field': { meta: this.fieldItemMetaTemplate, relevance: this.relevanceConfigTemplate }
	}
	protected readonly operatorsMap = operatorsMap;
	protected readonly fieldTypeExpressionOperatorsMap = fieldTypeExpressionOperatorsMap;

	// 2. Reference in Map
	protected readonly fieldMetaConfigTemplatesMap: Record<FieldType, Signal<TemplateRef<any>>> = {
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
	protected readonly formItemMetaConfigSections = {
		field: [
			{ label: 'Question configuration', value: 'meta' },
			{ label: 'Relevance configuration', value: 'relevance' }
		]
	} as Record<string, { label: string, value: string }[]>;
	protected readonly enableEditingControls = linkedSignal(() => !this.slug());
	protected readonly formModel = form(this.formData, defineFormDefinitionFormSchema());
	protected readonly ds = inject(DatasetService);
	protected readonly formItemTypes = formItemTypes;
	protected readonly formItemTypesMap = formItemTypesMap;
	protected readonly lastAddedItemType = signal<FormItemType>('field');
	protected readonly fieldItemTypes = FieldTypeSchema.options;
	protected readonly fieldItemTypesMap = {
		'boolean': { label: 'True/False', icon: 'lucideCheckSquare' },
		'date': { label: 'Date', icon: 'lucideCalendar' },
		"single-select": { label: 'Single select', icon: 'lucideCheck' },
		"multi-select": { label: 'Multi-select', icon: 'lucideListChecks' },
		'date-time': { label: 'Date-time', icon: 'lucideClock' },
		'text': { label: 'Single-line Text', icon: 'lucideTextCursorInput' },
		'multiline': { label: 'Multi-line Text', icon: 'lucideText' },
		'float': { label: 'Decimal', icon: 'lucideHash' },
		'integer': { label: 'Integer', icon: 'lucideHash' },
		'geo-point': { label: 'GPS Location', icon: 'lucideMapPin' },
		'multi-date': { label: 'Multi-date', icon: 'lucideCalendarCheck' },
		'date-range': { label: 'Date range', icon: 'lucideCalendarRange' },
	} as Record<z.infer<typeof FieldTypeSchema>, { label: string, icon: string }>;
	protected readonly optionSourceImportSheetState = signal<BrnDialogState>('closed');
	protected readonly activeImportTab = signal('dataset');
	protected readonly linkedOptionSources = signal<Record<string, DatasetItem[]>>({});
	protected readonly importSources = [
		{ value: 'dataset', icon: 'lucideDatabase', label: 'Dataset' }
	];
	protected readonly patternPresets = [
		{ name: 'email', label: 'Email', icon: 'lucideAtSign', regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
		{ name: 'phone', label: 'Phone', icon: 'lucidePhone', regex: /^(\+?237|\(\+?237\))?6([5679]|[2])\d{7}$/ }
	]
	protected readonly viableRelevanceDependencies = computed(() => {
		const formData = this.formData();
		const reg: Record<string, string[]> = {};
		for (const item of formData.items) {
			reg[item.path] = formData.items.filter(i => i.path != item.path && i.type == 'field').map(i => i.path);
		}
		return reg;
	});
	protected readonly fieldItems = computed(() => {
		const { items } = this.formData();
		const reg = {} as Record<string, FieldTree<Strict<FormItemField>>>;
		for (const i of items) {
			this.walkFormItemTree(i, item => {
				const tree = get(this.formModel.items, item.path.split(pathSeparator)) as FieldTree<Strict<FormItemDefinition>>;
				if (isFieldTree(tree) && tree().valid()) {
					reg[item.path] = tree;
				}
			})
		}
		return reg;
	});
	protected readonly imageFilters = [
		{ label: 'Shadow', value: 'shadow', },
		{ label: 'None', value: 'none' }
	] as { label: string, value: ImageItemMeta_filter }[];
	protected readonly itemDesignerStates = signal<Record<string, DesignerState>>({});
	protected readonly itemComponentInjector: Injector;
	constructor(injector: Injector) {
		this.itemComponentInjector = Injector.create({
			providers: [
				{
					provide: FormItemContextToken, useValue: {
						itemDeleteHandler: this.onRemoveFormItem.bind(this)
					} as FormItemContext
				}
			]
		})
		effect(() => {
			const { items } = this.formData();
			for (const item of items) {
				this.itemDesignerStates.update(v => produce(v, draft => {
					draft[item.path] = current(draft)[item.path] ?? { expanded: isDevMode(), previewing: false, activeConfigSection: 'meta' };
				}))
			}
			console.log(untracked(this.itemDesignerStates));
		})
		effect(() => {
			const formData = this.formData();
			const linkedOptionsRegistry = untracked(this.linkedOptionSources);
			for (const i of formData.items) {
				this.walkFormItemTree(i, async item => {
					if (item.type != 'field') return;
					const meta = item.meta as FieldItemMeta;
					if (meta.type != 'multi-select' && meta.type != 'single-select') return;
					const ref = meta.itemSourceRef;
					if (!ref || linkedOptionsRegistry[ref]) return;
					this.ds.getDatasetRefItems(ref).then(v => {
						if (!v || v.length == 0) return;
						this.linkedOptionSources.update(reg => produce(reg, draft => {
							draft[ref] = v;
						}))
					})
				})
			}
		});

	}

	private walkFormItemTree(item: Strict<FormItemDefinition>, cb: (item: Strict<FormItemDefinition>) => void) {
		cb(item);
		if (isGroupItem(item) && item.children.length > 0) {
			for (const child of item.children) {
				cb(child);
				this.walkFormItemTree(child, cb);
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
		const isGroup = (t: FormItemAddTarget): t is FieldTree<Strict<FormItemGroup>> => 'children' in t().value();
		const isRoot = (t: FormItemAddTarget): t is FieldTree<FormModel> => 'items' in t().value();
		if (isGroup(target)) {
			target().value.update(state => produce(state, draft => {
				const path = `${current(draft).path}${pathSeparator}${current(draft).children.length}`;
				const item = defaultFormItemDefinitionSchemaValue(path, type);
				draft.children.push(item);
			}));
		} else if (isRoot(target)) {
			target().value.update(state => produce(state, draft => {
				const path = `${current(draft).items.length}`;
				const item = defaultFormItemDefinitionSchemaValue(path, type);
				draft.items.push(item);
			}))
		}
		this.lastAddedItemType.set(type);
	}

	protected onRemoveFormItem(path: string, index: number) {
		const segments = path.split(pathSeparator);
		const target = (segments.length == 1 ? this.formModel.items : get(this.formModel.items, segments.slice(0, -1))) as FieldTree<unknown[]>;
		if (!target) return;
		target().value.update(state => produce(state, draft => {
			draft.splice(index, 1);
		}))
	}

	protected onRemoveFormItemButtonClicked(target: FormItemAddTarget, index: number) {
		const isGroup = (t: FormItemAddTarget): t is FieldTree<Strict<FormItemGroup>> => 'children' in t().value();
		const isRoot = (t: FormItemAddTarget): t is FieldTree<FormModel> => 'items' in t().value();
		if (isGroup(target)) {
			target().value.update(state => produce(state, draft => {
				draft.children.splice(index, 1);
			}));
		} else if (isRoot(target)) {
			target().value.update(state => produce(state, draft => {
				draft.items.splice(index, 1);
			}))
		}
	}

	protected asImageItem(node: any) {
		return node as FieldTree<Strict<FormItemImage>>;
	}

	protected isArray(v: any): v is unknown[] {
		return Array.isArray(v);
	}

	protected asFormItem(ctrl: any) {
		return ctrl as FieldTree<Strict<FormItemDefinition>>;
	}

	protected asFieldItem(ctrl: any) {
		return ctrl as FieldTree<Strict<FormItemField>>;
	}

	protected asNoteItem(node: any) {
		return node as FieldTree<Strict<FormItemNote>>;
	}

	protected asGenericControl(node: any) {
		return node as FieldTree<unknown>;
	}

	protected asFieldMeta(node: any) {
		return node as FieldTree<Strict<FormItemField>['meta']>;
	}

	protected asTextFieldMeta(node: any) {
		return node as FieldTree<Strict<TextFieldMeta>>;
	}

	protected asSelectFieldMeta(node: any) {
		return node as FieldTree<Strict<SelectFieldMeta>>
	}

	protected asBooleanFieldMeta(node: any) {
		return node as FieldTree<Strict<BooleanFieldMeta>>;
	}

	protected asNumberFieldMeta(node: any) {
		return node as FieldTree<Strict<NumberFieldMeta>>;
	}

	protected asDateFieldMeta(node: any) {
		return node as FieldTree<Strict<SimpleDateFieldMeta>>;
	}

	protected asRangeDateFieldMeta(node: any) {
		return node as FieldTree<Strict<RangeDateFieldMeta>>;
	}

	protected asMultiDateFieldMeta(node: any) {
		return node as FieldTree<Strict<MultiDateFieldMeta>>;
	}
	protected asGeoPointFieldMeta(node: any) {
		return node as FieldTree<Strict<GeoPointFieldMeta>>;
	}

	protected asRelevanceCondition(node: any) {
		return node as FieldTree<Strict<RelevanceCondition>>;
	}
	protected asOperatorKey(v: any) {
		return v as keyof typeof operatorsMap;
	}

	protected onFieldTypeChanged(node: FieldTree<Strict<FieldItemMeta>>, newType: any) {
		const baseState = BaseFieldItemMetaSchema.parse(node().value());
		const { defaultValue: _, ...baseWithoutDefault } = baseState;
		const newState = FieldItemMetaSchema.parse({ ...baseWithoutDefault, type: newType });
		node().setControlValue(newState as any);
	}

	protected onFieldReadonlyStatusChanged(node: FieldTree<Strict<FieldItemMeta>>, newState: any) {
		if (newState === false) return;
		node.required().setControlValue(false);
	}

	protected onAddHardOptionButtonClicked(node: FieldTree<Strict<SelectFieldMeta>>) {
		const state = node.hardItems().controlValue();
		const newOption = SelectFieldItemMetaSchema.shape.hardItems.unwrap().unwrap().parse({});
		node.hardItems().setControlValue(produce(state, draft => {
			draft.unshift(newOption as any);
			setTimeout(() => this.cdr.markForCheck(), 0);
		}))
	}

	protected onRemoveHardOptionButtonClicked(node: FieldTree<SelectFieldMeta>, index: number) {
		const state = node().controlValue();
		node().setControlValue(produce(state, draft => {
			const defaultValue = current(draft).defaultValue;
			const targetOption = current(draft).hardItems?.[index];
			const isDefault = defaultValue && defaultValue === targetOption?.value;

			if (isDefault) draft.defaultValue = null;
			draft.hardItems?.splice(index, 1);
		}));
	}

	protected onhardItemsReordered(event: CdkDragDrop<any>, node: FieldTree<Strict<SelectFieldMeta>>) {
		const state = node().controlValue();
		node().setControlValue(produce(state, draft => {
			moveItemInArray(draft.hardItems, event.previousIndex, event.currentIndex);
		}))
	}
	protected onOptionSourceImportDialogStateChanged(value: BrnDialogState) {
		this.optionSourceImportSheetState.set(value);
		if (value == 'open')
			this.navigate([{ outlets: { importer: ['import-dataset'] } }]).subscribe();
		else this.navigate([{ outlets: { importer: null } }]).subscribe();
	}
	protected importerOutletRouteActivationCallback?: (i: Importer<string>) => void;
	protected onLinkOptionSourceButtonClicked(meta: ReturnType<typeof this.asSelectFieldMeta>) {
		const linked = !!meta.itemSourceRef().value();
		const state = meta().controlValue();
		if (!linked) {
			this.importerOutletRouteActivationCallback = importer => {
				importer.finished.subscribe((refId) => {
					meta().setControlValue(produce(state, draft => {
						draft.itemSourceRef = refId;
						setTimeout(() => this.optionSourceImportSheetState.set('closed'))
					}));
				})
			};
			this.optionSourceImportSheetState.set('open');
		} else {
			meta().setControlValue(produce(state, draft => {
				(draft as any).itemSourceRef = null;
			}));
		}
	}
	protected onAddConditionButtonClicked(item: FieldTree<Strict<FormItemDefinition>>) {
		item.relevance.logic().value.update(v => produce(v, draft => {
			draft.unshift(defaultRelevanceLogic('or'));
		}));
	}
	protected onAddExpressionButtonClicked(item: FieldTree<Strict<FormItemDefinition>>, conditionIndex?: number) {
		item.relevance.logic().value.update(v => produce(v, draft => {
			if (conditionIndex !== undefined)
				draft[conditionIndex].expressions.unshift(defaultRelevanceExpression() as Strict<ReturnType<typeof defaultRelevanceExpression>>);
		}));
	}
	protected onRemoveExpressionButtonClicked(conditionIndex: number, index: number, item: FieldTree<Strict<FormItemDefinition>>) {
		item.relevance.logic[conditionIndex]().value.update(v => produce(v, draft => {
			draft.expressions.splice(index, 1);
		}))
	}
	protected onExpressionOperatorChanged(expression: FieldTree<Strict<FormItemDefinition>['relevance']['logic'][number]['expressions'][number]>, operator?: keyof typeof operatorsMap | (keyof typeof operatorsMap)[]) {
		expression().value.update(v => produce(v, draft => {
			// const op = this.operatorsMap[operator as keyof typeof operatorsMap];
			// if (!op || op.operandCount > 0) return;
			draft.value = null as any;
		}));
	}
	protected onRemoveConditionButtonClicked(item: FieldTree<Strict<FormItemDefinition>>, conditionIndex: number) {
		item().value.update(v => produce(v, draft => {
			draft.relevance.logic.splice(conditionIndex, 1);
		}));
	}
	protected onTextFieldPatternInputValueChanged(metaControl: FieldTree<Strict<TextFieldMeta>>, preseter?: HlmToggleGroup) {
		metaControl().value.update(v => produce(v, draft => {
			const pattern = current(draft).pattern;
			const required = current
			if (!pattern) {
				draft.pattern = null as any;
				return;
			}
		}));
	}
	protected onTextFieldPatternPresetChanged(metaControl: FieldTree<Strict<TextFieldMeta>>, preset: string) {
		metaControl().value.update(v => produce(v, draft => {
			draft.pattern = preset;
		}));
	}
	protected async onImagePickerImagePicked(node: FieldTree<Strict<FormItemImage>>, files: FileList) {
		try {
			const result = await this.uploadService.uploadFiles(files);
			if (result) {
				node().value.update(v => produce(v, draft => {
					draft.url = result[0].urlPath;
				}));
			}
		} catch (e) {
			console.error(e);
			toast.error('Upload failed', { description: (e as Error).message });
		}
	}
	protected onImagePickerResized(node: FieldTree<Strict<FormItemImage>>, event: { width: number, height: number }) {
		node().value.update(v => produce(v, draft => {
			draft.meta.width = event.width;
			draft.meta.height = event.height;
		}))
	}
	protected onItemDesignerSettingsButtonClicked(item: FieldTree<Strict<FormItemDefinition>>) {
		const path = item.path().value();
		this.itemDesignerStates.update(v => produce(v, draft => {
			draft[path].expanded = !current(draft)[path].expanded;
		}))
	}
	protected onItemDesignerPreviewButtonClicked(item: FieldTree<Strict<FormItemDefinition>>) {
		const path = item.path().value();
		this.itemDesignerStates.update(v => produce(v, draft => {
			draft[path].previewing = !current(draft)[path].previewing;
		}))
	}
	protected itemConfigTabChanged(item: FieldTree<Strict<FormItemDefinition>>, tab: string) {
		const path = item.path().value();
		this.itemDesignerStates.update(v => produce(v, draft => {
			draft[path].activeConfigSection = tab;
		}))
	}
}
