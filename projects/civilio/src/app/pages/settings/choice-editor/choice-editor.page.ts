// const GroupLineSchema = z.discriminatedUnion('isNew', [
// 	z.object({
// 		data: FindFormOptionGroupsResponseSchema.shape.groups.unwrap().extend({
// 			options: OptionItemSchema.extend({
// 				isNew: z.literal(true),
// 				trackingKey: z.string(),
// 			}).omit({
// 				id: true,
// 			}).array().default([])
// 		}).omit({
// 			id: true
// 		}),
// 		trackingKey: z.string(),
// 		isNew: z.literal(true).default(true),
// 		expanded: z.boolean().optional().default(false)
// 	}),
// 	z.object({
// 		data: FindFormOptionGroupsResponseSchema.shape.groups.unwrap().extend({
// 			id: z.uuid(),
// 			options: z.discriminatedUnion('isNew', [
// 				OptionItemSchema.extend({
// 					isNew: z.literal(true),
// 					trackingKey: z.string(),
// 				}).omit({
// 					id: true,
// 				}),
// 				OptionItemSchema.extend({
// 					isNew: z.literal(false).default(false),
// 					id: z.uuid(),
// 					trackingKey: z.string(),
// 				})
// 			]).array()
// 		}),
// 		trackingKey: z.string(),
// 		isNew: z.literal(false).default(false),
// 		expanded: z.boolean().optional().default(false)
// 	})
// ]);
// type GroupLine = z.output<typeof GroupLineSchema>;

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, ElementRef, HostListener, inject, signal, viewChildren } from "@angular/core";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { HasPendingChanges } from "@app/model/form";
import { LoadDatasets } from "@app/store/dataset";
import { dataGroups } from "@app/store/selectors";
import { randomString } from "@app/util";
import { DatasetGroup, DatasetItem } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop'
import { lucideChevronDown, lucideChevronsUpDown, lucideChevronUp, lucideCircleAlert, lucideFilter, lucideLoader, lucideMenu, lucidePlus, lucideRefreshCw, lucideSave, lucideSaveAll, lucideSearch, lucideTrash2, lucideX } from "@ng-icons/lucide";
import { dispatch, select } from "@ngxs/store";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { HlmH3 } from "@spartan-ng/helm/typography";
import { toast } from "ngx-sonner";
import { HlmKbdImports } from '@spartan-ng/helm/kbd';
import { map, mergeMap, Observable, toArray } from "rxjs";
import { Platform } from "@angular/cdk/platform";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { NgClass, NgTemplateOutlet } from "@angular/common";
import { HlmLabel } from "@spartan-ng/helm/label";
import { toSignal } from "@angular/core/rxjs-interop";

type ItemForm = FormGroup<{
	isNew: FormControl<boolean>;
	id: FormControl<DatasetGroup['options'][number]['id']>;
	label: FormControl<DatasetGroup['options'][number]['label']>;
	ordinal: FormControl<DatasetGroup['options'][number]['ordinal']>;
	value: FormControl<DatasetGroup['options'][number]['value']>;
	parentValue: FormControl<DatasetGroup['options'][number]['parentValue']>;
	i18nKey: FormControl<DatasetGroup['options'][number]['i18nKey']>;
	trackingKey: FormControl<string>;
}>;

type GroupForm = FormGroup<{
	data: FormGroup<{
		id: FormControl<DatasetGroup['id']>;
		title: FormControl<DatasetGroup['title']>;
		key: FormControl<DatasetGroup['key']>;
		parentId: FormControl<DatasetGroup['parentId']>;
		description: FormControl<DatasetGroup['description']>;
		options: FormArray<ItemForm>;
	}>;
	meta: FormGroup<{
		trackingKey: FormControl<string>;
		isNew: FormControl<boolean>;
		expanded: FormControl<boolean>;
	}>;
}>;

@Component({
	selector: 'cv-choice-editor',
	viewProviders: [
		provideIcons({
			lucideRefreshCw,
			lucidePlus,
			lucideSaveAll,
			lucideX,
			lucideSave,
			lucideChevronDown,
			lucideChevronUp,
			lucideMenu,
			lucideLoader,
			lucideFilter,
			lucideSearch,
			lucideCircleAlert,
			lucideTrash2,
			lucideChevronsUpDown
		})
	],
	imports: [
		HlmFieldImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmKbdImports,
		CdkDrag,
		CdkDragHandle,
		CdkDragPlaceholder,
		CdkDropList,
		NgIcon,
		HlmH3,
		NgTemplateOutlet,
		HlmButton,
		HlmInput,
		HlmLabel,
		HlmTextarea,
		ReactiveFormsModule,
		NgClass,
	],
	templateUrl: './choice-editor.page.html',
	styleUrl: './choice-editor.page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceEditorPage implements AfterViewInit, HasPendingChanges {
	private expansionPanels = viewChildren<ElementRef<HTMLDivElement>>('expansionPanel');
	protected readonly isMac: boolean;
	private readonly cdr = inject(ChangeDetectorRef);
	protected readonly form = new FormGroup({
		groups: new FormArray<GroupForm>([])
	});

	private loadGroups = dispatch(LoadDatasets);

	protected groups = select(dataGroups);
	protected readonly hasExistingGroups = computed(() => {
		return this.groups().length > 0;
	});
	protected readonly availableParents = computed(() => {
		const groups = this.groups();
		return groups.map((_, i) => {
			return groups.filter((gg, ii) => ii != i)
		});
	});
	protected readonly parents = computed(() => {
		const groups = this.groups();
		return groups.map(g => !!g.parentId ? (groups.find(gg => gg.id == g.parentId) ?? null) : null);
	});
	protected savingChanges = signal(false);
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}
	protected readonly itemsSequential = toSignal(this.form.valueChanges.pipe(
		mergeMap(data => data.groups ?? []),
		map(group => {
			const items = group.data?.options ?? [];
			const values = items.map(i => Number(i.value));
			if (values.some(v => isNaN(v))) return false;
			const min = Math.min(...values);
			const max = Math.max(...values);

			const isSpreadValid = (max - min) === (values.length - 1);
			const hasNoDuplicates = new Set(values).size === items.length;
			return isSpreadValid && hasNoDuplicates;
		}),
		toArray()
	), { initialValue: [] });

	protected readonly newOptions = toSignal(this.form.valueChanges.pipe(
		map(data => {
			return data.groups?.map(g => {
				if (g.meta?.isNew) return g.data?.options ?? [];
				return g.data?.options?.filter(i => i.isNew) ?? [];
			}) ?? []
		})
	), { initialValue: [] });
	protected readonly newItemsIndexOffset = toSignal(this.form.valueChanges.pipe(
		map(data => {
			if (!data.groups) return [];
			return data.groups.map(g => g.meta?.isNew ? 0 : (g.data!.options!.findIndex(i => i.isNew) ?? -1) < 0 ? g.data!.options!.length : g.data!.options!.findIndex(i => i.isNew));
		})
	), {
		initialValue: []
	});

	protected onNewItemReordered(event: CdkDragDrop<GroupForm['controls']['data']['controls']['options']['controls'][number]>, lineIndex: number) {
		const g = this.form.controls.groups.at(lineIndex).controls.data.controls.options;
		const offset = Math.max(0, this.newItemsIndexOffset()[lineIndex]);
		const prev = event.previousIndex - offset;
		const next = event.currentIndex - offset;
		moveItemInArray(g.controls, prev, next);
		this.cdr.markForCheck();
	}

	protected onItemReordered(event: CdkDragDrop<GroupForm['controls']['data']['controls']['options']['controls'][number]>, lineIndex: number) {
		const g = this.form.controls.groups.at(lineIndex).controls.data.controls.options;
		moveItemInArray(g.controls, event.previousIndex, event.currentIndex);
		this.cdr.markForCheck();
	}

	constructor() {
		this.isMac = window.electron.platform == 'darwin';
		effect(() => {
			const groups = this.groups();

			this.form.controls.groups.clear({ emitEvent: false });
			for (const group of groups) {
				this.form.controls.groups.push(this.createGroupForm(group));
			}
			this.cdr.markForCheck();
		})
	}

	@HostListener('window:keydown', ['$event'])
	onCtrPlusPlus(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
			event.preventDefault();
			this.doAddEmptyGroup();
		}
	}

	protected createItemForm(item?: DatasetItem) {
		return new FormGroup({
			i18nKey: new FormControl(item?.i18nKey),
			id: new FormControl(item?.id),
			isNew: new FormControl(!item),
			label: new FormControl(item?.label),
			ordinal: new FormControl(item?.ordinal),
			parentValue: new FormControl(item?.parentValue),
			value: new FormControl(item?.value),
			trackingKey: new FormControl(item?.id || randomString())
		}) as ItemForm;
	}

	protected generateGroupKeyAt(index: number) {
		const str = randomString(6);
		this.form.controls.groups.at(index).controls.data.controls.key.setValue(str);
	}

	protected createGroupForm(group?: DatasetGroup) {
		return new FormGroup({
			data: new FormGroup({
				id: new FormControl(group?.id),
				key: new FormControl(group?.key || ''),
				parentId: new FormControl(group?.parentId),
				title: new FormControl(group?.title || ''),
				description: new FormControl(group?.description),
				options: new FormArray<ItemForm>(group?.options.map(i => this.createItemForm(i)) ?? [])
			}),
			meta: new FormGroup({
				trackingKey: new FormControl(group?.id || randomString()),
				expanded: new FormControl(!group),
				isNew: new FormControl(!group)
			})
		}) as GroupForm;
	}

	ngAfterViewInit() {
		this.loadGroups().subscribe({
			error: (e: Error) => {
				toast.error('Could not load datasets', { description: e.message });
			}
		});
	}

	protected async onFormSubmit() {
		console.log(this.form.value);
	}

	protected onAddGroupButtonClicked() {
		this.doAddEmptyGroup();
	}

	private doAddEmptyGroup() {
		this.form.controls.groups.insert(0, this.createGroupForm());
		this.cdr.markForCheck();
	}

	protected onSetParentId(id: string | null | undefined, lineIndex: number) {
		this.form.controls.groups.at(lineIndex).controls.data.controls.parentId.setValue(id);
		this.cdr.markForCheck();
	}

	protected onToggleExpanded({ currentTarget, target, type }: Event, lineIndex: number) {
		const fg = this.form.controls.groups.at(lineIndex);
		if (
			(type == 'click' && target instanceof HTMLButtonElement) ||
			(type == 'dblclick' && currentTarget === target && currentTarget === this.expansionPanels()[lineIndex].nativeElement)
		) {
			const expansion = fg.controls.meta.controls.expanded;
			expansion.setValue(!expansion.value);
		}
	}

	protected onAddOptionButtonClicked(lineIndex: number) {
		this.doAddGroupItem(lineIndex);
	}

	private doAddGroupItem(lineIndex: number) {
		const group = this.form.controls.groups.at(lineIndex);
		group.controls.data.controls.options.insert(0, this.createItemForm());
	}

	protected onDeleteGroupOptionButtonClicked(lineIndex: number, itemIndex: number) {

	}
}


















// 	protected pendingChangesActionCallback?: (options: { type: 'close' | 'save' | 'discard', close: () => Promise<void>; }) => void;
// 	private expansionPanels = viewChildren<ElementRef<HTMLDivElement>>('expansionPanel');
// 	private globalErrorsContainer = viewChild<ElementRef<HTMLDivElement>>('globalErrorsContainer');
// 	private formService = inject(FORM_SERVICE);
// 	protected pendingChangesDialogState = signal<BrnDialogState>('closed');
// 	protected savingChanges = signal(false);
// 	protected readonly options = resource({
// 		defaultValue: { groups: [] },
// 		loader: async () => {
// 			const { groups } = await this.formService.loadUngroupedFormOptions();
// 			return { groups: GroupLineSchema.array().parse(groups.map(g => ({ data: { ...g, options: g.options.map(o => ({ ...o, isNew: false, trackingKey: o.id || randomString() })) }, isNew: false, trackingKey: g.id || randomString() }))) };
// 		}
// 	});
// 	protected readonly availableParents = computed(() => {
// 		const { groups } = this.formData();
// 		return groups.map((_, i) => {
// 			return groups.filter((gg, ii) => ii != i && !gg.isNew) as Extract<typeof _, { isNew: false }>[];
// 		});
// 	});
// 	protected readonly hasExistingGroups = computed(() => {
// 		const existingGroups = this.formData().groups.filter(g => !g.isNew);
// 		return existingGroups.length > 0;
// 	});
// 	protected readonly optionsSequential = computed(() => {
// 		return this.formData().groups.map(g => {
// 			const items = g.data.options;
// 			const values = items.map(i => Number(i.value));
// 			if (values.some(v => isNaN(v))) return false;
// 			const min = Math.min(...values);
// 			const max = Math.max(...values);

// 			const isSpreadValid = (max - min) === (items.length - 1);
// 			const hasNoDuplicates = new Set(values).size === items.length;
// 			return isSpreadValid && hasNoDuplicates;
// 		})
// 	});
// 	protected readonly newOptions = computed(() => {
// 		const data = this.formData();
// 		return data.groups.map(g => {
// 			if (g.isNew) return g.data.options;
// 			return g.data.options.filter(i => i.isNew);
// 		});
// 	});
// 	protected readonly newItemsIndexOffset = computed(() => {
// 		return this.formData().groups.map(g => g.isNew ? 0 : g.data.options.findIndex(i => i.isNew) < 0 ? g.data.options.length : g.data.options.findIndex(i => i.isNew));
// 	})
// 	protected readonly formData = linkedSignal(() => this.options.value())
// 	private readonly groupLineSchema = schema<GroupLine>(paths => {
// 		applyEach(paths.data.options, itemPath => {
// 			required(itemPath.label, { message: 'This field is required' });
// 			required(itemPath.value, { message: 'This field is required' });
// 			if (itemPath.parentValue) {
// 				required(itemPath.parentValue, { message: 'This field is required', when: ({ valueOf }) => !!valueOf(paths.data.parentId) });
// 			}
// 		});

// 		debounce(paths.data.title, 200);
// 		required(paths.data.title, { message: 'This field is required' });
// 		debounce(paths.data.key, 200);
// 		required(paths.data.key, { message: 'This field is required' });

// 		validate(paths.data.options, ({ value }) => {
// 			const values = value().map(i => i.value.trim());
// 			const hasDuplicates = new Set(values).size != values.length;
// 			return hasDuplicates ? { kind: 'uniqueValue', message: 'Values must be unique' } : null;
// 		});
// 		validate(paths.data.options, ({ value }) => {
// 			const values = value().map(i => i.label.trim());
// 			const hasDuplicates = new Set(values).size != values.length;
// 			return hasDuplicates ? { kind: 'uniqueLabel', message: 'Labels must be unique' } : null;
// 		});
// 		validate(paths.data.options, ({ value, valueOf }) => {
// 			if (!valueOf(paths.data.parentId)) return null;
// 			const parent = untracked(this.parents).find(g => g?.key == valueOf(paths.data.key))
// 			if (!parent?.options) return null;
// 			const parentOptionValues = parent.options.map(o => o.value);
// 			for (const option of value()) {
// 				if (option.parentValue && !parentOptionValues.includes(option.parentValue)) {
// 					// debugger;
// 					return {
// 						message: 'Value is out of range',
// 						kind: 'valueOutOfRange',
// 					};
// 				}
// 			}
// 			return null;
// 		});
// 	})
// 	// });
// 	protected readonly formModel = form(this.formData, (paths) => {
// 		applyEach(paths.groups, this.groupLineSchema);
// 	});
// 	protected readonly parents = computed(() => {
// 		const { groups } = this.formData();
// 		return groups.map(g => !!g.data.parentId ? (groups.find(gg => !gg.isNew && gg.data.id == g.data.parentId) ?? null) : null)
// 			.map(g => g ? ({
// 				key: g.data.key as string,
// 				title: g.data.title,
// 				options: g.data.options
// 			}) : null);
// 	})

// 	protected onToggleExpanded({ currentTarget, target, type }: MouseEvent, lineIndex: number) {
// 		if (
// 			(type == 'click' && target instanceof HTMLButtonElement) ||
// 			(type == 'dblclick' && currentTarget === target && currentTarget === this.expansionPanels()[lineIndex].nativeElement)
// 		) {
// 			this.formModel.groups[lineIndex].expanded().value.update(v => !v);
// 		}
// 	}

// 	protected onSetParentId(id: string, lineIndex: number) {
// 		this.formData.update(data => {
// 			return produce({ ...data }, draft => {
// 				draft.groups[lineIndex].data.parentId = id;
// 			})
// 		})
// 	}

// 	private nextValueInSequence(items: GroupLine['data']['options']) {
// 		const values = items.map(i => Number(i.value));
// 		if (values.some(v => isNaN(v))) {
// 			return String(0);
// 		}

// 		const max = Math.max(...values);
// 		return String(max + 1);
// 	}

// 	protected onAddOptionButtonClicked(lineIndex: number) {
// 		this.formData.update(data => {
// 			const isSequential = untracked(this.optionsSequential)[lineIndex];
// 			return produce(data, draft => {
// 				draft.groups[lineIndex].data.options.push({
// 					isNew: true,
// 					trackingKey: randomString(),
// 					label: isSequential ? this.nextValueInSequence(current(draft.groups[lineIndex].data.options)) : '',
// 					value: isSequential ? this.nextValueInSequence(current(draft.groups[lineIndex].data.options)) : '',
// 					i18nKey: null,
// 					parentValue: null,
// 					ordinal: size(current(draft.groups)[lineIndex].data.options) + 1
// 				})
// 			})
// 		})
// 	}

// 	protected onItemReordered(event: CdkDragDrop<GroupLine['data']['options']>, lineIndex: number) {
// 		this.formData.update(data => {
// 			const g = data.groups[lineIndex].data.options;
// 			const copy = [...g];
// 			moveItemInArray(copy, event.previousIndex, event.currentIndex);
// 			return produce({ ...data }, draft => {
// 				draft.groups[lineIndex].data.options = copy;
// 			});
// 		});
// 		let i = 0;
// 		for (const option of this.formModel.groups[lineIndex].data.options) {
// 			option.ordinal().setControlValue(++i);
// 		}
// 	}

// 	protected onNewItemReOrdered(event: CdkDragDrop<GroupLine['data']['options']>, lineIndex: number) {
// 		this.formData.update(data => {
// 			const g = data.groups[lineIndex].data.options;
// 			const copy = [...g];
// 			const offset = Math.max(0, this.newItemsIndexOffset()[lineIndex]);
// 			const prev = event.previousIndex - offset;
// 			const curr = event.currentIndex - offset;
// 			moveItemInArray(copy, prev, curr);
// 			return produce({ ...data }, draft => {
// 				draft.groups[lineIndex].data.options = copy;
// 			})
// 		});
// 		let i = 0;
// 		for (const option of this.formModel.groups[lineIndex].data.options) {
// 			option.ordinal().setControlValue(++i);
// 		}
// 	}

// 	protected onAddGroupButtonClicked() {
// 		this.formData.update(data => {
// 			return produce(data, draft => {
// 				draft.groups.unshift({
// 					isNew: true,
// 					trackingKey: randomString(),
// 					expanded: true,
// 					data: {
// 						description: null,
// 						key: null,
// 						options: [],
// 						parent: null,
// 						parentId: null,
// 						title: ''
// 					}
// 				});
// 			});
// 		})
// 	}

// 	ngOnInit() {
// 		setAutoFreeze(false);
// 	}

// 	ngOnDestroy(): void {
// 		setAutoFreeze(true);
// 	}

// 	protected onDeleteLineButtonClicked(lineIndex: number) {
// 		this.formData.update(data => {
// 			return produce(data, (draft) => {
// 				const deleted = draft.groups.splice(lineIndex, 1).filter(v => !v.isNew);
// 				if (deleted.length == 0) return;
// 				// setTimeout(() => {
// 				const group = current(draft).groups[lineIndex];
// 				if (!group.isNew)
// 					this.onExistingGroupDeleted(group.data.id);
// 				// }, 0);
// 			});
// 		});
// 	}

// 	protected async onDeleteGroupOptionButtonClicked(lineIndex: number, optionIndex: number) {
// 		const group = this.formData().groups[lineIndex];
// 		const option = this.formData().groups[lineIndex].data.options[optionIndex];
// 		this.formData.update(data => produce(data, draft => {
// 			draft.groups[lineIndex].data.options.splice(optionIndex, 1);
// 		}));
// 		if (group.isNew || option.isNew) return;
// 		toast.warning(`"${option.label.trim()}" removed`, {
// 			classes: {
// 				title: 'line-clamp-1 text-ellipsis'
// 			},
// 			cancel: {
// 				label: 'Undo',
// 				onClick: () => {
// 					this.formData.update(data => produce(data, draft => {
// 						// const update =
// 						draft.groups[lineIndex].data.options.splice(optionIndex, 0, { ...option });
// 					}));
// 				}
// 			},
// 			onAutoClose: async () => {
// 				try {
// 					await this.formService.deleteOptionGroupItemById({
// 						groupId: group.data.id,
// 						optionId: option.id
// 					});
// 				} catch (e) {
// 					const err = e as Error
// 					toast.error('An error occurred', { description: err.message });
// 					this.formData.update(data => produce(data, draft => {
// 						draft.groups[lineIndex].data.options.splice(optionIndex, 0, { ...option });
// 					}));
// 				}
// 			}
// 		})
// 	}

// 	private async onExistingGroupDeleted(...key: string[]) {

// 	}

// 	private resetForm() {
// 		this.formData.set({ groups: [] });
// 		this.options.reload();
// 	}

// 	private async doFormSubmit<T = { groups: GroupLine[] }>(tree: FieldTree<T>): Promise<TreeValidationResult> {
// 		try {
// 			const formValue = tree().value();
// 			const data = UpdateFormOptionsDataSetRequestSchema.parse(formValue);
// 			await this.formService.saveOptionGroups(data);
// 		} catch (e) {
// 			if (e instanceof ZodError) {
// 				return e.issues.map(issue => ({ kind: issue.code, fieldTree: get(tree, issue.path), message: issue.message }));
// 			}
// 			return [
// 				{ kind: 'server', message: (e as Error).message }
// 			];
// 		}
// 		return undefined;
// 	}

// 	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
// 		if (!this.formModel().dirty()) return false;
// 		this.pendingChangesDialogState.set('open');
// 		return new Observable<boolean>(observer => {
// 			this.pendingChangesActionCallback = async ({ type, close }) => {
// 				observer.add(() => {
// 					close();
// 					this.pendingChangesActionCallback = undefined;
// 					this.pendingChangesDialogState.set('closed');
// 				});
// 				if (type == 'close') {
// 					observer.next(true);
// 					observer.complete();
// 				} else if (type == 'discard') {
// 					observer.next(false);
// 					observer.complete();
// 				} else {
// 					this.savingChanges.set(true);
// 					try {
// 						await this.formService.saveOptionGroups({
// 							groups: this.formData().groups as any
// 						});
// 						observer.next(false);
// 					} catch (e) {
// 						toast.error('Error', { description: (e as Error).message });
// 						observer.next(true);
// 					} finally {
// 						this.savingChanges.set(false);
// 						observer.complete();
// 					}
// 				}
// 			}
// 		})
// 	}

// 	protected generateGroupKeyAt(lineIndex: number) {
// 		const str = randomString(6);
// 		this.formModel.groups[lineIndex].data.key().setControlValue(str);
// 	}

// 	protected onParentIdChanged(line: number, value: string) {
// 		this.formModel.groups[line].data.parentId().setControlValue(value == '' ? null : value);
// 	}

// 	protected onGroupIdChanged(lineIndex: number) {
// 		if (this.formData().groups[lineIndex].data.parentId != null) return;
// 		const { options } = this.formData().groups[lineIndex].data;
// 		for (let i = 0; i < options.length; i++) {
// 			const option = this.formModel.groups[lineIndex].data.options[i];
// 			option.parentValue?.().setControlValue(null);
// 		}
// 	}
// }
