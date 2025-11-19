import {
	Component,
	computed,
	effect,
	forwardRef,
	input,
	linkedSignal,
	model,
	output,
	signal,
	untracked
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { FieldKey, Option } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck, lucideCheckCheck, lucidePencil, lucidePlus, lucideTrash2, lucideX, } from "@ng-icons/lucide";
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTableContainer, HlmTableImports } from '@spartan-ng/helm/table';
import { ParsedValue, TabularFieldSchema } from '@app/model/form';
import { entries, isEmpty, values } from 'lodash';
import {
	CellContext,
	createAngularTable,
	createColumnHelper,
	flexRenderComponent,
	FlexRenderDirective,
	getCoreRowModel,
	RowData,
	RowSelectionState,
	VisibilityState
} from '@tanstack/angular-table';
import { TableHeadSelectionComponent } from './table-head-selection.component';
import { TableRowSelectionComponent } from './table-row-selection.component';
import { EditableCellComponent } from '@app/components/tabular-field/cells/editable-cell/editable-cell.component';
import { ActionCell, ActionTriggeredEvent, RowAction } from '@app/components/tabular-field/cells';
import { DeltaChangeEvent } from '@app/model/form/events/delta-change-event';

declare module '@tanstack/angular-table' {
	interface TableMeta<TData extends RowData> {
		updateData: (rowIndex: number, columnId: string, value: unknown) => void;
		deleteRow: (rowIndex: number) => void;
	}
}

type TrackedChanges = Record<string, any[]>;

const separator = '/';

function flattenKey(k: FieldKey, sep = separator) {
	return k.replaceAll('.', sep);
}

const deleteIdentifier = Symbol('delete');

@Component({
	selector: "cv-tabular-field",
	imports: [
		HlmTableImports,
		TranslatePipe,
		NgIcon,
		HlmButton,
		ReactiveFormsModule,
		HlmTableContainer,
		FlexRenderDirective
	],
	templateUrl: "./tabular-field.component.html",
	styleUrl: "./tabular-field.component.scss",
	viewProviders: [
		provideIcons({
			lucidePencil,
			lucideCheck,
			lucidePlus,
			lucideX,
			lucideCheckCheck,
		}),
	],
	providers: [
		provideIcons({
			lucideTrash2,
		}),
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TabularFieldComponent),
			multi: true,
		},
	],
	hostDirectives: []
})
export class TabularFieldComponent<T = Record<string, ParsedValue | ParsedValue[]>> implements ControlValueAccessor {
	public readonly loadingData = input<boolean>();
	public readonly optionSource = input.required<Record<string, Option[]>>();
	public readonly schema = input.required<TabularFieldSchema>();
	public readonly actions = input<RowAction<T>[]>();
	public readonly enableSelection = input<boolean>();
	public readonly enableMutation = input<boolean>();
	public readonly maxRows = input<number>();
	public readonly changed = output<T[]>();
	public readonly deltaChange = output<DeltaChangeEvent<T[]>>();
	public readonly actionTriggered = output<ActionTriggeredEvent<T>>();

	protected readonly editing = signal<boolean>(false);
	protected readonly title = computed(() => `${ this.schema().key }.title`)
	protected readonly shouldShowActionsCol = computed(() => {
		const mutationEnabled = this.enableMutation();
		const customActions = this.actions();
		return mutationEnabled || (customActions && customActions.length > 0);
	})
	protected readonly trackedChanges = signal<TrackedChanges>({});
	protected readonly changesTracked = computed(() => !isEmpty(this.trackedChanges()))
	protected readonly data = model<T[]>([]);
	protected readonly rowSelection = signal<RowSelectionState>({});
	private readonly columnVisibility = linkedSignal<VisibilityState>(() => {
		const schema = this.schema();
		const v = { selection: this.enableSelection() ?? false, actions: this.shouldShowActionsCol() } as VisibilityState;
		values(schema.columns)
			.filter(c => c.visible === false)
			.forEach(c => v[c.key] = false);
		return v;
	});
	protected readonly disabled = signal<boolean>(false);
	protected readonly tableDefinition = computed(() => {
		const cols = this.columnDefinitions();
		const schema = this.schema();
		return createAngularTable<T>(() => ({
			getCoreRowModel: getCoreRowModel(),
			data: this.data(),
			columns: cols,
			state: {
				rowSelection: this.rowSelection(),
				columnVisibility: this.columnVisibility()
			},
			enableRowSelection: this.enableSelection(),
			onRowSelectionChange: updaterOrValue => {
				this.rowSelection.set(typeof updaterOrValue === 'function' ? updaterOrValue(this.rowSelection()) : updaterOrValue);
			},
			onColumnVisibilityChange: updaterOrValue => {
				this.columnVisibility.set(typeof updaterOrValue === 'function' ? updaterOrValue(this.columnVisibility()) : updaterOrValue)
			},
			getRowId: (row) => {
				const k = flattenKey(schema.identifierColumn);
				return `${ k }${ separator }${ (row as any)[k] }`;
			},
			defaultColumn: {
				maxSize: 250,
			},
			meta: {
				deleteRow: (index) => {
					this.data.update(old => old.filter((_, i) => i != index));
					const exportingValue = this.transformKeys(this.data(), separator, '.') as any;
					this.changed.emit(exportingValue);
					this.changeCallback?.(exportingValue);
					this.deltaChange.emit({
						changeType: 'delete',
						path: [schema.key as string, index]
					});
				},
				updateData: (rowIndex, columnId, value) => {
					this.data.update(old =>
						old.map((row, index) => {
							if (index === rowIndex) {
								return {
									...old[rowIndex],
									[columnId]: value,
								}
							}
							return row
						})
					);
					const exportingValue = this.transformKeys(this.data(), separator, '.') as any;
					this.changeCallback?.(exportingValue);
					this.changed.emit(exportingValue);
					this.deltaChange.emit({
						changeType: 'update',
						path: [schema.key as string, rowIndex, columnId],
						value: value as any
					});
				}
			}
		}))
	})
	private cols = createColumnHelper<T>();

	private touchCallback?: () => void;
	private changeCallback?: (v: T[]) => void;
	protected readonly columnDefinitions = computed(() => {
		const schema = this.schema();
		const defs = values(schema.columns);
		const actions = this.actions() ?? [];

		if (this.enableMutation()) {
			actions.push({
				icon: 'lucideTrash2',
				identifier: deleteIdentifier,
			});
		}
		return [
			this.cols.display({
				id: 'selection',
				header: () => flexRenderComponent(TableHeadSelectionComponent),
				cell: () => flexRenderComponent(TableRowSelectionComponent),
				enableHiding: true
			}),
			...defs.map(def => {
				// noinspection JSUnusedGlobalSymbols
				return {
					id: def.key,
					header: `${ def.key }.title`,
					accessorKey: flattenKey(def.key),
					enableHiding: def.visible === false,
					cell: ({ table, column, row, }: CellContext<T, unknown>) =>
						flexRenderComponent(EditableCellComponent, {
							inputs: {
								editing: untracked(this.editing),
								schema: def,
								options: untracked(this.optionSource)
							},
							outputs: {
								blur: () => this.touchCallback?.(),
								change: (v) => {
									if (table.options.meta?.updateData) {
										table.options.meta.updateData(row.index, column.id, v);
									}
								}
							}
						}),
				};
			}),
			this.cols.display({
				enableHiding: true,
				id: 'actions',
				cell: ({ table }) => {
					return flexRenderComponent(ActionCell<T>, {
						inputs: {
							actions
						},
						outputs: {
							actionTriggered: ({ index, identifier }) => {
								if (identifier === deleteIdentifier) {
									table.options.meta?.deleteRow(index);
								}
							}
						}
					})
				}
			})
		];
	});

	constructor() {
		effect(() => {
			const mutationEnabled = this.enableMutation();
			if (!mutationEnabled) {
				untracked(() => {
					this.editing.set(false);
				})
			}
		})
	}

	writeValue(obj: any): void {
		const transformedValue = obj.map((row: any) => entries(row).reduce((acc, [k, v]) => {
			acc[flattenKey(k as FieldKey)] = v as ParsedValue | ParsedValue[];
			return acc;
		}, {} as Record<string, ParsedValue | ParsedValue[]>));
		this.data.set(transformedValue);
	}

	protected addRow() {
		this.touchCallback?.();
	}

	registerOnChange(fn: any): void {
		this.changeCallback = fn;
	}

	registerOnTouched(fn: any): void {
		this.touchCallback = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		this.disabled.set(isDisabled);
	}

	private transformKeys(data: any[], target: string, replacement: string = separator) {
		return data.map((row: any) => entries(row).reduce((acc, [k, v]) => {
			acc[k.replaceAll(target, replacement)] = v as ParsedValue | ParsedValue[];
			return acc;
		}, {} as Record<string, ParsedValue | ParsedValue[]>));
	}
}
