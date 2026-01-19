import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgClass, NgTemplateOutlet } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, inject, signal, untracked, viewChildren } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { HasPendingChanges } from "@app/model/form";
import { ValuesPipe } from '@app/pipes';
import { DeleteDataset, LoadDatasets, SaveDatasets } from "@app/store/dataset";
import { dataGroups } from "@app/store/selectors";
import { randomString } from "@app/util";
import { DatasetGroup, DatasetItem, UpdateFormOptionsDataSetRequestSchema } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideChevronsUpDown, lucideChevronUp, lucideCircleAlert, lucideFilter, lucideLoader, lucideMenu, lucidePlus, lucideRefreshCw, lucideSave, lucideSaveAll, lucideSearch, lucideTrash2, lucideX } from "@ng-icons/lucide";
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Actions, dispatch, ofActionSuccessful, select } from "@ngxs/store";
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmKbdImports } from '@spartan-ng/helm/kbd';
import { HlmLabel } from "@spartan-ng/helm/label";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { HlmH3 } from "@spartan-ng/helm/typography";
import { toast } from "ngx-sonner";
import { from, map, mergeMap, Observable, scan, switchMap, take } from "rxjs";

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

const requiredValidator = (control: AbstractControl) => {
	if (control.value) return null;
	return {
		required: {
			message: 'settings.dataset.validation.required'
		}
	};
}

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
		}),
	],
	imports: [
		HlmFieldImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmKbdImports,
		BrnAlertDialogImports,
		HlmAlertDialogImports,
		CdkDrag,
		HlmSeparator,
		CdkDragHandle,
		CdkDragPlaceholder,
		CdkDropList,
		NgIcon,
		HlmH3,
		NgTemplateOutlet,
		HlmButton,
		HlmInput,
		HlmLabel,
		TranslatePipe,
		HlmTextarea,
		ReactiveFormsModule,
		ValuesPipe,
		NgClass,
	],
	templateUrl: './choice-editor.page.html',
	styleUrl: './choice-editor.page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceEditorPage implements AfterViewInit, HasPendingChanges {
	private expansionPanels = viewChildren<ElementRef<HTMLDivElement>>('expansionPanel');
	private readonly actions$ = inject(Actions);
	protected readonly isMac: boolean;
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly ts = inject(TranslateService);
	protected readonly form = new FormGroup({
		groups: new FormArray<GroupForm>([])
	});
	protected readonly lineDeletionDialogState = signal<BrnDialogState>('closed');
	protected readonly pendingChangesDialogState = signal<BrnDialogState>('closed');

	private loadGroups = dispatch(LoadDatasets);
	private deleteDataset = dispatch(DeleteDataset);
	private saveDatasets = dispatch(SaveDatasets);

	protected groups = select(dataGroups);
	protected readonly hasExistingGroups = toSignal(this.form.controls.groups.valueChanges.pipe(
		map(gs => gs.some(g => g.meta?.isNew === false && g.data?.id))
	), { initialValue: true });
	protected readonly availableParents = toSignal(this.form.controls.groups.valueChanges.pipe(
		map(groups => groups.map(gg => groups.filter(g => g.meta?.isNew !== true && gg.data?.id != g.data?.id))),
	), { initialValue: [] });
	protected readonly parents = toSignal(this.form.controls.groups.valueChanges.pipe(
		map(groups => groups.map(g => !!g.data?.parentId ? (groups.find(gg => gg.data?.id == g.data?.parentId) ?? null) : null))
	), { initialValue: [] });
	protected savingChanges = signal(false);
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		if (this.form.pristine) return false;
		this.pendingChangesDialogState.set('open');
		return new Observable<boolean>(subscriber => {
			this.pendingChangesCallback = ({ action, callback }) => {
				subscriber.add(() => {
					callback();
					this.pendingChangesDialogState.set('closed');
					this.pendingChangesCallback = undefined;
				});
				if (action == 'close') {
					subscriber.next(true);
					subscriber.complete();
				} else if (action == 'leave') {
					subscriber.next(false);
					subscriber.complete();
				} else {
					this.savingChanges.set(true);
					from(this.doSubmitChanges()).subscribe({
						error: (e: Error) => {
							this.savingChanges.set(false);
							toast.error(this.ts.instant('msg.error.title'), { description: e.message });
							subscriber.next(true);
							subscriber.complete();
						},
						complete: () => {
							this.savingChanges.set(false);
							toast.success(this.ts.instant('msg.changes_saved.title'));
							subscriber.next(false);
							subscriber.complete();
						}
					})
				}
			}
		})
	}
	protected readonly itemsSequential = toSignal(this.form.valueChanges.pipe(
		mergeMap(data => from(data.groups ?? []).pipe(
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
			scan((acc, curr) => [...acc, curr], Array<boolean>())
		)),
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

	protected lineDeletionConfirmationCallback?: (cb: () => void) => Promise<void>;
	protected pendingChangesCallback?: (arg: { callback: () => void, action: 'save' | 'leave' | 'close' }) => void;

	protected onNewItemReordered(event: CdkDragDrop<GroupForm['controls']['data']['controls']['options']['controls'][number]>, lineIndex: number) {
		const g = this.form.controls.groups.at(lineIndex).controls.data.controls.options;
		const offset = Math.max(0, this.newItemsIndexOffset()[lineIndex]);
		const prev = event.previousIndex - offset;
		const next = event.currentIndex - offset;
		moveItemInArray(g.controls, prev, next);
		g.controls.forEach((c, i) => {
			c.controls.ordinal.setValue(i + 1);
			c.controls.ordinal.markAsDirty();
		});
		this.cdr.markForCheck();
	}

	protected onItemReordered(event: CdkDragDrop<GroupForm['controls']['data']['controls']['options']['controls'][number]>, lineIndex: number) {
		const g = this.form.controls.groups.at(lineIndex).controls.data.controls.options;
		moveItemInArray(g.controls, event.previousIndex, event.currentIndex);
		g.controls.forEach((c, i) => {
			c.controls.ordinal.setValue(i + 1, { emitEvent: true });
			c.controls.ordinal.markAsDirty();
		});
		this.cdr.markForCheck();
	}

	constructor() {
		this.isMac = window.electron.platform == 'darwin';
	}

	protected onDeleteLineButtonClicked(lineIndex: number) {
		const currentGroupValue = this.form.controls.groups.at(lineIndex).value;

		// 1. Handle dependents (Dialog logic)
		if (this.groupHasDependentGroups(lineIndex)) {
			this.lineDeletionConfirmationCallback = async (cb) => {
				try {
					this.form.controls.groups.removeAt(lineIndex); // Removed once
					await this.doDeleteExistingLine(currentGroupValue.data?.id as string);
				} catch (e) {
					this.restoreDatasetGroupControl(lineIndex, currentGroupValue);
				} finally {
					cb();
					this.lineDeletionDialogState.set('closed');
					// this.form.controls.groups.markAsDirty();
				}
			};
			this.lineDeletionDialogState.set('open');
			return;
		}

		// 2. Immediate UI Removal
		this.form.controls.groups.removeAt(lineIndex);
		// this.form.controls.groups.markAsDirty();

		// 3. Handle API persistence for existing items
		if (currentGroupValue.meta?.isNew !== true) {
			const toastId = toast.warning(this.ts.instant('misc.toasts.item_deleted', { item: currentGroupValue.data?.title }), {
				cancel: {
					label: 'Undo',
					onClick: () => {
						console.log(toast.dismiss(toastId));
						this.restoreDatasetGroupControl(lineIndex, currentGroupValue);
					}
				},
				onAutoClose: async () => {
					try {
						await this.doDeleteExistingLine(currentGroupValue.data?.id as string);
					} catch (e) {
						toast.error(this.ts.instant('misc.toasts.delete_failed', { domain: currentGroupValue.data?.title }), { description: (e as Error).message });
						this.restoreDatasetGroupControl(lineIndex, currentGroupValue);
					}
				}
			});
		}
	}

	private restoreDatasetGroupControl(index: number, value: any) {
		const control = this.createGroupForm();
		control.patchValue(value);
		this.form.controls.groups.insert(index, control, { emitEvent: false });
		control.markAsUntouched();
		control.markAsPristine();
		for (const item of value.data.options) {
			const itemControl = this.createItemForm();
			itemControl.setValue(item, { emitEvent: false });
			itemControl.markAsUntouched();
			itemControl.markAsPristine();
			control.controls.data.controls.options.push(itemControl, { emitEvent: false });
		}
		this.cdr.markForCheck();
	}

	private async doDeleteExistingLine(id: string) {
		return new Promise<void>((resolve, reject) => {
			this.deleteDataset(id).subscribe({
				error: reject,
				complete: resolve
			});
		})
	}

	private groupHasDependentGroups(lineIndex: number) {
		const formGroup = this.form.controls.groups.at(lineIndex);
		if (formGroup.value.meta?.isNew === true) return false;

		const id = formGroup.value.data?.id as string;
		return this.form.value.groups?.some(g => g.data?.parentId == id) ?? false;
	}

	private doResetForm() {
		const groups = untracked(this.groups);

		this.form.controls.groups.clear({ emitEvent: false });
		for (const group of groups) {
			this.form.controls.groups.push(this.createGroupForm(group));
		}
		this.form.markAsUntouched();
		this.form.markAsPristine();
		this.cdr.markForCheck();
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
			label: new FormControl(item?.label, requiredValidator),
			ordinal: new FormControl(item?.ordinal),
			parentValue: new FormControl(item?.parentValue),
			value: new FormControl(item?.value, requiredValidator),
			trackingKey: new FormControl(item?.id || randomString())
		}) as ItemForm;
	}

	protected generateGroupKeyAt(index: number) {
		const str = randomString(6);
		this.form.controls.groups.at(index).controls.data.controls.key.setValue(str);
	}

	protected createGroupForm(group?: DatasetGroup) {
		const uniqueLabelsValidator = (control: AbstractControl<ItemForm['value'][]>) => {
			const items = control.value;
			if (items.length == 0) return null;
			const labels = items.map(v => v.label?.trim()).filter(l => !!l) as string[];
			const containsDuplicateLabels = new Set(labels).size !== labels.length;
			if (!containsDuplicateLabels) return null;
			return { duplicateLabels: { message: 'settings.dataset.validation.unique_labels' } };
		}

		const uniqueValuesValidator = (control: AbstractControl<ItemForm['value'][]>) => {
			const items = control.value;
			const values = items.map(v => v.value?.trim()).filter(v => !!v) as string[];
			const containsDuplicateValues = new Set(values).size !== values.length;
			if (!containsDuplicateValues) return null;
			return { duplicateValues: { message: 'settings.dataset.validation.unique_values' } };
		}

		return new FormGroup({
			data: new FormGroup({
				id: new FormControl(group?.id),
				key: new FormControl(group?.key || '', [requiredValidator]),
				parentId: new FormControl(group?.parentId),
				title: new FormControl(group?.title || '', { validators: [requiredValidator], updateOn: 'change' }),
				description: new FormControl(group?.description),
				options: new FormArray<ItemForm>(group?.options.map(i => this.createItemForm(i)) ?? [], [
					uniqueLabelsValidator,
					uniqueValuesValidator
				])
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
				toast.error(this.ts.instant('settings.dataset.toasts.unloadable'), { description: e.message });
			},
			complete: () => {
				this.doResetForm();
			}
		});
	}

	protected async onFormSubmit() {
		await this.doSubmitChanges();
	}

	private async doSubmitChanges() {
		const modifiedGroups = this.form.controls.groups.controls.filter(g => g.dirty).map(g => g.value);
		const payload = UpdateFormOptionsDataSetRequestSchema.parse({ groups: modifiedGroups });
		this.saveDatasets(payload).pipe(
			switchMap(() => this.actions$.pipe(ofActionSuccessful(LoadDatasets), take(1)))
		).subscribe({
			error: (e: Error) => {
				toast.error(this.ts.instant('settings.dataset.toasts.unsavable'), { description: e.message });
			},
			complete: () => {
				this.onFormReset();
			}
		});
	}

	protected onFormReset(event?: Event) {
		event?.preventDefault();
		this.doResetForm();
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
		const item = this.createItemForm();
		item.patchValue({ ordinal: group.controls.data.controls.options.length + 1 });
		group.controls.data.controls.options.insert(this.newItemsIndexOffset()[lineIndex], item);
		this.cdr.markForCheck();
	}

	protected onDeleteGroupOptionButtonClicked(lineIndex: number, itemIndex: number) {
		const group = this.form.controls.groups.at(lineIndex);
		group.controls.data.controls.options.removeAt(itemIndex);
		group.controls.data.controls.options.markAsDirty();
		this.cdr.markForCheck();
	}
}
