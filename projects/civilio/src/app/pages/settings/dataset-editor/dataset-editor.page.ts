import {
	CdkDrag,
	CdkDragDrop,
	CdkDragHandle,
	CdkDragPlaceholder,
	CdkDropList,
	moveItemInArray,
} from "@angular/cdk/drag-drop";
import { NgClass, NgTemplateOutlet } from "@angular/common";
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	effect,
	ElementRef,
	HostListener,
	inject,
	signal,
	untracked,
	viewChildren,
} from "@angular/core";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import {
	AbstractControl,
	FormArray,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
} from "@angular/forms";
import { HasPendingChanges } from "@app/model/form";
import { ValuesPipe } from "@app/pipes";
import { debouncedAsyncValidator, randomString } from "@app/util";
import { DatasetItem, DatasetLookup } from "@civilio/sdk/models";
import { DatasetsService } from "@civilio/sdk/services/datasets/datasets.service";
import { UpdateFormOptionsDataSetRequestSchema } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideChevronDown,
	lucideChevronsUpDown,
	lucideChevronUp,
	lucideCircleAlert,
	lucideFilter,
	lucideLoader,
	lucideMenu,
	lucidePlus,
	lucideRefreshCw,
	lucideSave,
	lucideSaveAll,
	lucideSearch,
	lucideTrash2,
	lucideX,
} from "@ng-icons/lucide";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { BrnAlertDialogImports } from "@spartan-ng/brain/alert-dialog";
import { BrnDialogState } from "@spartan-ng/brain/dialog";
import {} from "@spartan-ng/brain/select";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmKbdImports } from "@spartan-ng/helm/kbd";
import { HlmLabel } from "@spartan-ng/helm/label";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSeparator } from "@spartan-ng/helm/separator";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { HlmH3 } from "@spartan-ng/helm/typography";
import { toast } from "@spartan-ng/brain/sonner";
import { catchError, from, map, mergeMap, Observable, of, scan } from "rxjs";

type ItemForm = FormGroup<{
	isNew: FormControl<boolean>;
	id: FormControl<Required<NonNullable<DatasetItem["id"]>>>;
	label: FormControl<Required<NonNullable<DatasetItem["label"]>>>;
	ordinal: FormControl<Required<NonNullable<DatasetItem["ordinal"]>>>;
	value: FormControl<Required<NonNullable<DatasetItem["value"]>>>;
	parentValue: FormControl<Required<NonNullable<DatasetItem["parentValue"]>>>;
	trackingKey: FormControl<string>;
}>;

type DatasetForm = FormGroup<{
	data: FormGroup<{
		id: FormControl<DatasetLookup["id"]>;
		title: FormControl<DatasetLookup["title"]>;
		key: FormControl<DatasetLookup["key"]>;
		parentId: FormControl<DatasetLookup["parentId"]>;
		description: FormControl<DatasetLookup["description"]>;
		items: FormArray<ItemForm>;
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
			message: "settings.dataset.validation.required",
		},
	};
};

@Component({
	selector: "cv-choice-editor",
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
			lucideChevronsUpDown,
		}),
	],
	imports: [
		HlmFieldImports,
		HlmSelectImports,

		HlmKbdImports,
		BrnAlertDialogImports,
		HlmAlertDialogImports,
		HlmSpinner,
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
	templateUrl: "./dataset-editor.page.html",
	styleUrl: "./dataset-editor.page.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetEditorPage implements HasPendingChanges {
	private expansionPanels =
		viewChildren<ElementRef<HTMLDivElement>>("expansionPanel");
	private readonly datasetService = inject(DatasetsService);
	protected readonly isMac: boolean;
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly ts = inject(TranslateService);
	protected readonly form = new FormGroup({
		datasets: new FormArray<DatasetForm>([]),
	});
	protected readonly lineDeletionDialogState = signal<BrnDialogState>("closed");
	protected readonly pendingChangesDialogState =
		signal<BrnDialogState>("closed");

	protected datasets = rxResource({
		stream: () => {
			return this.datasetService.lookupDatasets();
		},
		defaultValue: { totalRecords: 0, data: [] },
	});
	private readonly loadedDatasetItems = new Set<string>();
	protected readonly hasExistingGroups = toSignal(
		this.form.controls.datasets.valueChanges.pipe(
			map((gs) => gs.some((g) => g.meta?.isNew === false && g.data?.id)),
		),
		{ initialValue: true },
	);
	protected readonly availableParents = toSignal(
		this.form.controls.datasets.valueChanges.pipe(
			map((groups) =>
				groups.map((gg) =>
					groups.filter(
						(g) => g.meta?.isNew !== true && gg.data?.id != g.data?.id,
					),
				),
			),
		),
		{ initialValue: [] },
	);
	protected readonly parents = toSignal(
		this.form.controls.datasets.valueChanges.pipe(
			map((groups) =>
				groups.map((g) =>
					!!g.data?.parentId
						? (groups.find((gg) => gg.data?.id == g.data?.parentId) ?? null)
						: null,
				),
			),
		),
		{ initialValue: [] },
	);
	protected savingChanges = signal(false);

	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		if (this.form.pristine) return false;
		this.pendingChangesDialogState.set("open");
		return new Observable<boolean>((subscriber) => {
			this.pendingChangesCallback = ({ action, callback }) => {
				subscriber.add(() => {
					callback();
					this.pendingChangesDialogState.set("closed");
					this.pendingChangesCallback = undefined;
				});
				if (action == "close") {
					subscriber.next(true);
					subscriber.complete();
				} else if (action == "leave") {
					subscriber.next(false);
					subscriber.complete();
				} else {
					this.savingChanges.set(true);
					this.doSubmitChanges().subscribe({
						error: (e: Error) => {
							this.savingChanges.set(false);
							toast.error(
								this.ts.instant("settings.dataset.toasts.unsavable"),
								{ description: e.message },
							);
							subscriber.next(true);
							subscriber.complete();
						},
						complete: () => {
							this.savingChanges.set(false);
							toast.success(this.ts.instant("msg.changes_saved.title"));
							subscriber.next(false);
							subscriber.complete();
						},
					});
				}
			};
		});
	}

	protected readonly itemsSequential = toSignal(
		this.form.valueChanges.pipe(
			mergeMap((data) =>
				from(data.datasets ?? []).pipe(
					map((group) => {
						const items = group.data?.items ?? [];
						const values = items.map((i) => Number(i.value));
						if (values.some((v) => isNaN(v))) return false;
						const min = Math.min(...values);
						const max = Math.max(...values);

						const isSpreadValid = max - min === values.length - 1;
						const hasNoDuplicates = new Set(values).size === items.length;
						return isSpreadValid && hasNoDuplicates;
					}),
					scan((acc, curr) => [...acc, curr], Array<boolean>()),
				),
			),
		),
		{ initialValue: [] },
	);

	protected readonly newOptions = toSignal(
		this.form.valueChanges.pipe(
			map((data) => {
				return (
					data.datasets?.map((g) => {
						if (g.meta?.isNew) return g.data?.items ?? [];
						return g.data?.items?.filter((i) => i.isNew) ?? [];
					}) ?? []
				);
			}),
		),
		{ initialValue: [] },
	);
	protected readonly newItemsIndexOffset = toSignal(
		this.form.valueChanges.pipe(
			map((data) => {
				if (!data.datasets) return [];
				return data.datasets.map((g) =>
					g.meta?.isNew
						? 0
						: (g.data!.items!.findIndex((i) => i.isNew) ?? -1) < 0
							? g.data!.items!.length
							: g.data!.items!.findIndex((i) => i.isNew),
				);
			}),
		),
		{
			initialValue: [],
		},
	);

	protected lineDeletionConfirmationCallback?: (
		cb: () => void,
	) => Promise<void>;
	protected pendingChangesCallback?: (arg: {
		callback: () => void;
		action: "save" | "leave" | "close";
	}) => void;

	protected onNewItemReordered(
		event: CdkDragDrop<
			DatasetForm["controls"]["data"]["controls"]["items"]["controls"][number]
		>,
		lineIndex: number,
	) {
		const g =
			this.form.controls.datasets.at(lineIndex).controls.data.controls.items;
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

	protected onItemReordered(
		event: CdkDragDrop<
			DatasetForm["controls"]["data"]["controls"]["items"]["controls"][number]
		>,
		lineIndex: number,
	) {
		const g =
			this.form.controls.datasets.at(lineIndex).controls.data.controls.items;
		moveItemInArray(g.controls, event.previousIndex, event.currentIndex);
		g.controls.forEach((c, i) => {
			c.controls.ordinal.setValue(i + 1, { emitEvent: true });
			c.controls.ordinal.markAsDirty();
		});
		this.cdr.markForCheck();
	}

	constructor() {
		this.isMac = window.electron.platform == "darwin";
		effect(() => {
			this.datasets.value();
			this.doResetForm();
		});
	}

	protected onDeleteLineButtonClicked(lineIndex: number) {
		const currentGroupValue = this.form.controls.datasets.at(lineIndex).value;

		// 1. Handle dependents (Dialog logic)
		if (this.datasetHasDependentDatasets(lineIndex)) {
			this.lineDeletionConfirmationCallback = async (cb) => {
				try {
					this.form.controls.datasets.removeAt(lineIndex); // Removed once
					await this.doDeleteExistingLine(currentGroupValue.data?.id as string);
				} catch (e) {
					this.restoreDatasetControl(lineIndex, currentGroupValue);
				} finally {
					cb();
					this.lineDeletionDialogState.set("closed");
					// this.form.controls.groups.markAsDirty();
				}
			};
			this.lineDeletionDialogState.set("open");
			return;
		}

		// 2. Immediate UI Removal
		this.form.controls.datasets.removeAt(lineIndex);
		// this.form.controls.groups.markAsDirty();

		// 3. Handle API persistence for existing items
		if (currentGroupValue.meta?.isNew !== true) {
			const toastId = toast.warning(
				this.ts.instant("misc.toasts.item_deleted", {
					item: currentGroupValue.data?.title,
				}),
				{
					cancel: {
						label: "Undo",
						onClick: () => {
							console.log(toast.dismiss(toastId));
							this.restoreDatasetControl(lineIndex, currentGroupValue);
						},
					},
					onAutoClose: async () => {
						try {
							await this.doDeleteExistingLine(
								currentGroupValue.data?.id as string,
							);
						} catch (e) {
							toast.error(
								this.ts.instant("misc.toasts.delete_failed", {
									domain: currentGroupValue.data?.title,
								}),
								{ description: (e as Error).message },
							);
							this.restoreDatasetControl(lineIndex, currentGroupValue);
						}
					},
				},
			);
		}
	}

	private restoreDatasetControl(index: number, value: any) {
		const control = this.createGroupForm();
		control.patchValue(value);
		this.form.controls.datasets.insert(index, control, { emitEvent: false });
		control.markAsUntouched();
		control.markAsPristine();
		for (const item of value.data.options) {
			const itemControl = this.createItemForm();
			itemControl.setValue(item, { emitEvent: false });
			itemControl.markAsUntouched();
			itemControl.markAsPristine();
			control.controls.data.controls.items.push(itemControl, {
				emitEvent: false,
			});
		}
		this.cdr.markForCheck();
	}

	private doDeleteExistingLine(id: string) {
		// return await this.datasetService.deleteDataset({ id });
		this.datasetService.deleteDatasetById(id).subscribe();
	}

	private datasetHasDependentDatasets(lineIndex: number) {
		const formGroup = this.form.controls.datasets.at(lineIndex);
		if (formGroup.value.meta?.isNew === true) return false;

		const id = formGroup.value.data?.id as string;
		return (
			this.form.value.datasets?.some((g) => g.data?.parentId == id) ?? false
		);
	}

	private doResetForm() {
		const datasets = untracked(this.datasets.value).data;

		this.form.controls.datasets.clear({ emitEvent: false });
		for (const group of datasets) {
			this.form.controls.datasets.push(this.createGroupForm(group));
		}
		this.form.markAsUntouched();
		this.form.markAsPristine();
		this.cdr.markForCheck();
	}

	@HostListener("window:keydown", ["$event"])
	onCtrPlusPlus(event: KeyboardEvent) {
		if (
			(event.ctrlKey || event.metaKey) &&
			(event.key === "+" || event.key === "=")
		) {
			event.preventDefault();
			this.doAddEmptyGroup();
		}
	}

	protected createItemForm(item?: DatasetItem) {
		return new FormGroup({
			id: new FormControl(item?.id),
			isNew: new FormControl(!item),
			label: new FormControl(item?.label, requiredValidator),
			ordinal: new FormControl(item?.ordinal),
			parentValue: new FormControl(item?.parentValue),
			value: new FormControl(item?.value, requiredValidator),
			trackingKey: new FormControl(item?.id || randomString()),
		}) as ItemForm;
	}

	protected generateGroupKeyAt(index: number) {
		const str = randomString(6);
		this.form.controls.datasets
			.at(index)
			.controls.data.controls.key.setValue(str);
	}

	protected createGroupForm(dataset?: DatasetLookup) {
		const uniqueLabelsValidator = (
			control: AbstractControl<ItemForm["value"][]>,
		) => {
			const items = control.value;
			if (items.length == 0) return null;
			const labels = items
				.map((v) => v.label?.trim())
				.filter((l) => !!l) as string[];
			const containsDuplicateLabels = new Set(labels).size !== labels.length;
			if (!containsDuplicateLabels) return null;
			return {
				duplicateLabels: {
					message: "settings.dataset.validation.unique_labels",
				},
			};
		};

		const uniqueValuesValidator = (
			control: AbstractControl<ItemForm["value"][]>,
		) => {
			const items = control.value;
			const values = items
				.map((v) => v.value?.trim())
				.filter((v) => !!v) as string[];
			const containsDuplicateValues = new Set(values).size !== values.length;
			if (!containsDuplicateValues) return null;
			return {
				duplicateValues: {
					message: "settings.dataset.validation.unique_values",
				},
			};
		};

		const keyValidator = (ref?: string) =>
			debouncedAsyncValidator<string>(300, async (key) => {
				return this.datasetService
					.isDatasetKeyAvailable(
						{
							key,
							ref,
						},
						{ cache: "only-if-cached" },
					)
					.pipe(
						map(({ available }) =>
							available
								? null
								: {
										uniqueKey: {
											message: "settings.dataset.validation.unavailable_key",
										},
									},
						),
						catchError(() => {
							return of({
								networkError: {
									message: "settings.dataset.validation.network_unavailable",
								},
							});
						}),
					)
					.subscribe();
			});

		return new FormGroup({
			data: new FormGroup({
				id: new FormControl(dataset?.id),
				key: new FormControl(
					dataset?.key || "",
					[requiredValidator],
					[keyValidator(dataset?.id ?? undefined)],
				),
				parentId: new FormControl(dataset?.parentId),
				title: new FormControl(dataset?.title || "", {
					validators: [requiredValidator],
					updateOn: "change",
				}),
				description: new FormControl(dataset?.description),
				items: new FormArray<ItemForm>([]),
			}),
			meta: new FormGroup({
				trackingKey: new FormControl(dataset?.id || randomString()),
				expanded: new FormControl(!dataset),
				isNew: new FormControl(!dataset),
			}),
		}) as DatasetForm;
	}

	protected onFormSubmit() {
		this.doSubmitChanges().subscribe({
			error: (e: Error) => {
				toast.error(this.ts.instant("settings.dataset.toasts.unsavable"), {
					description: e.message,
				});
			},
			complete: () => this.datasets.reload(),
		});
	}

	private doSubmitChanges() {
		const modifiedGroups = this.form.controls.datasets.controls
			.filter((g) => g.dirty)
			.map((g) => g.value);
		const payload = UpdateFormOptionsDataSetRequestSchema.parse(modifiedGroups);
		return this.datasetService.upsertDataset(payload as any);
	}

	protected onFormReset(event?: Event) {
		event?.preventDefault();
		this.doResetForm();
	}

	protected onAddGroupButtonClicked() {
		this.doAddEmptyGroup();
	}

	private doAddEmptyGroup() {
		this.form.controls.datasets.insert(0, this.createGroupForm());
		this.cdr.markForCheck();
	}

	protected onSetParentId(id: string | null | undefined, lineIndex: number) {
		this.form.controls.datasets
			.at(lineIndex)
			.controls.data.controls.parentId.setValue(id ?? undefined);
		this.cdr.markForCheck();
	}

	private loadDatasetItems(lineIndex: number) {
		const fg = this.form.controls.datasets.at(lineIndex);
		const { data } = fg.value;
		if (this.loadedDatasetItems.has(data!.id!)) return;
		this.datasetService
			.lookupDatasetItems(data!.id!, { size: 1000 })
			.pipe(map(({ data }) => data))
			.subscribe({
				error: (e: Error) =>
					toast.error(this.ts.instant("could_not_fetch_items"), {
						description: e.message,
					}),
				next: (items) => {
					for (const item of items) {
						fg.controls.data.controls.items.push(this.createItemForm(item));
					}
				},
				complete: () => {
					this.loadedDatasetItems.add(data!.id!);
				},
			});
	}

	protected onToggleExpanded(
		{ currentTarget, target, type }: Event,
		lineIndex: number,
	) {
		const fg = this.form.controls.datasets.at(lineIndex);
		if (
			(type == "click" && target instanceof HTMLButtonElement) ||
			(type == "dblclick" &&
				currentTarget === target &&
				currentTarget === this.expansionPanels()[lineIndex].nativeElement)
		) {
			const expansion = fg.controls.meta.controls.expanded;
			expansion.setValue(!expansion.value);
		}
		if (fg.value.meta?.isNew || fg.value.meta?.expanded) return;
		this.loadDatasetItems(lineIndex);
	}

	protected onAddItemButtonClicked(lineIndex: number) {
		this.doAddDatasetItem(lineIndex);
	}

	private doAddDatasetItem(lineIndex: number) {
		const isSequential = untracked(this.itemsSequential)[lineIndex];
		const group = this.form.controls.datasets.at(lineIndex);
		const item = this.createItemForm();
		item.patchValue({ ordinal: group.controls.data.controls.items.length + 1 });
		if (isSequential) {
			const nextValue =
				Math.max(
					...(group.value.data?.items ?? []).map((i) => Number(i.value)),
				) + 1;
			item.patchValue({
				value: String(nextValue),
			});
		}
		group.controls.data.controls.items.insert(
			this.newItemsIndexOffset()[lineIndex],
			item,
		);
		this.cdr.markForCheck();
	}

	protected onDeleteDatasetItemButtonClicked(
		lineIndex: number,
		itemIndex: number,
	) {
		const group = this.form.controls.datasets.at(lineIndex);
		group.controls.data.controls.items.removeAt(itemIndex);
		group.controls.data.controls.items.markAsDirty();
		this.cdr.markForCheck();
	}
}
