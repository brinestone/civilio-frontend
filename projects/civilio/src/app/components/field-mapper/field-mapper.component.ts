import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	inject,
	input,
	OnInit,
	signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	FormArray,
	FormControl,
	FormGroup,
	FormRecord,
	ReactiveFormsModule
} from '@angular/forms';
import {
	extractFieldKey,
	FieldSchema,
	flattenSections,
	FormSchema,
	GroupFieldSchema,
	SectionSchema
} from '@app/model/form';
import { IsStringPipe, ValuesPipe } from '@app/pipes';
import {
	LoadDbColumns,
	LoadMappings,
	RemoveMapping,
	UpdateMappings
} from '@app/store/form';
import { formColumns, formMappings } from '@app/store/selectors';
import { DbColumnSpec, FieldKey, FormType } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideCheck,
	lucideChevronsUpDown,
	lucideLoader,
	lucideSearch,
	lucideX
} from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Actions, dispatch, ofActionSuccessful, Store } from '@ngxs/store';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPopoverImports, HlmPopoverPortal } from '@spartan-ng/helm/popover';
import { cloneDeep, differenceWith, entries, values } from 'lodash';
import { toast } from 'ngx-sonner';
import { createNotifier } from 'ngxtension/create-notifier';
import { derivedFrom } from 'ngxtension/derived-from';
import { concatMap, map, merge, pipe, tap } from 'rxjs';

type FieldControl = FormControl<DbColumnSpec | null>;

type SectionForm = FormGroup<{
	id: FormControl<string | null>;
	fields: FormRecord<FieldControl>;
	isChild: FormControl<boolean>;
}>;

@Component({
	selector: 'cv-field-mapper',
	viewProviders: [
		provideIcons({
			lucideChevronsUpDown,
			lucideSearch,
			lucideCheck,
			lucideLoader,
			lucideX
		})
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		HlmPopoverImports,
		HlmCommandImports,
		HlmLabel,
		TranslatePipe,
		NgClass,
		NgIcon,
		HlmBadge,
		HlmButton,
		ValuesPipe,
		ReactiveFormsModule,
		NgTemplateOutlet,
		IsStringPipe,
	],
	templateUrl: './field-mapper.component.html',
	styleUrl: './field-mapper.component.scss'
})
export class FieldMapperComponent implements OnInit {
	private store = inject(Store);
	private translateService = inject(TranslateService);
	private cdr = inject(ChangeDetectorRef);
	private doUpdateMapping = dispatch(UpdateMappings);
	private loadMappings = dispatch(LoadMappings);
	private loadColumns = dispatch(LoadDbColumns);
	protected doRemoveMapping = dispatch(RemoveMapping);
	protected updatingMapping = signal<FieldKey | undefined>(undefined);

	readonly formModel = input<FormSchema>();
	readonly form = input<FormType>();

	private mappingsNotifier = createNotifier();
	private columnsNotifier = createNotifier();
	protected loadedMappings = computed(() => {
		const form = this.form();
		if (!form) return {};
		this.mappingsNotifier.listen();
		return this.store.selectSnapshot(formMappings)?.[form] ?? {};
	});
	protected columns = computed(() => {
		const form = this.form();
		if (!form) return [];
		this.columnsNotifier.listen();
		return this.store.selectSnapshot(formColumns)?.[form] ?? [];
	});
	protected sectionMap = computed(() => {
		const model = this.formModel();
		if (!model) return {};
		return cloneDeep(flattenSections(model)).map((s) => {
			return s as unknown as Exclude<typeof s, 'fields'>;
		}).reduce((acc, curr) => ({
			...acc,
			[curr.id]: curr
		}), {} as Record<string, Exclude<SectionSchema, 'fields'>>);
	});
	protected inputForm: FormGroup<{
		groups: FormArray<SectionForm>
	}> = new FormGroup({
		groups: new FormArray<SectionForm>([])
	});
	protected unmappedColumns = derivedFrom([
		this.controls.valueChanges,
		this.loadedMappings,
		this.columns
	], pipe(
		map(([formValue, mappings, columns]) => {
			const unifiedMappings = {} as Record<string, DbColumnSpec>;

			values(mappings).forEach(({ field, dbColumn, dbTable, dbColumnType }) => {
				unifiedMappings[field] = {
					dataType: dbColumnType,
					name: dbColumn,
					tableName: dbTable
				};
			});

			formValue.flatMap(({ fields }) => entries(fields) as [string, DbColumnSpec | null][])
				.forEach(([k, v]) => {
					if (v == null) return;
					unifiedMappings[k] = v;
				});

			const arr = values(unifiedMappings);
			return differenceWith(columns, arr, (a, b) => a.name == b.name && a.tableName == b.tableName);
		})
	), { initialValue: [] });

	constructor(actions$: Actions) {
		effect(() => {
			const model = this.formModel();
			if (!model) return;
			setTimeout(() => this.setupForm(model), 100);
		});
		merge(
			actions$.pipe(ofActionSuccessful(UpdateMappings)),
			// actions$.pipe(ofActionSuccessful(RemoveMapping)),
		).pipe(
			takeUntilDestroyed()
		).subscribe(() => {
			this.mappingsNotifier.notify();
		})
	}

	protected get controls() {
		return this.inputForm.controls.groups;
	}

	private clearAllControls() {
		this.controls.clear();
	}

	protected updateMapping(control: FieldControl, key: FieldKey, {
		name,
		tableName
	}: DbColumnSpec) {
		this.updatingMapping.set(key);
		this.doUpdateMapping(this.form()!, {
			dbColumn: name,
			field: key,
			table: tableName
		}).subscribe({
			error: (e: Error) => {
				toast.error(this.translateService.instant('msg.error.title'), { description: e.message })
				this.updatingMapping.set(undefined);
			},
			complete: () => {
				control.markAsPristine();
				control.markAsUntouched();
				control.updateValueAndValidity();
				this.cdr.markForCheck();
				this.updatingMapping.set(undefined);
			}
		})
	}

	private setupGroupField(schema: GroupFieldSchema) {
		return schema.fields.map(f => {
			const key = extractFieldKey(f.key);
			const mapping = this.loadedMappings()[key];
			let initialValue: DbColumnSpec | null = null;
			if (mapping) {
				initialValue = this.columns().find(({
					name, tableName
				}) => name == mapping.dbColumn && tableName == mapping.dbTable) ?? null;
			}
			return [key, new FormControl<typeof initialValue>(initialValue, { nonNullable: false })] as [string, FieldControl];
		}).reduce((acc, [k, control]) => ({
			...acc,
			[k]: control
		}), {} as Record<string, FieldControl>);
	}

	private setupTabularField(schema: Extract<FieldSchema, {
		type: 'table'
	}>): Record<string, FieldControl> {
		const columns = values(schema.columns);
		return columns.map(c => {
			const mapping = this.loadedMappings()[c.key];
			let initialValue: DbColumnSpec | null = null;
			if (mapping) {
				initialValue = this.columns().find(({
					name,
					tableName
				}) => name == mapping.dbColumn && tableName == mapping.dbTable) ?? null;
			}
			return [c.key, new FormControl<typeof initialValue>(initialValue, { nonNullable: false })] as [string, FieldControl];
		}).reduce((acc, [k, control]) => ({
			...acc,
			[k]: control
		}), {} as Record<string, FieldControl>);
	}

	private setupField(schema: FieldSchema) {
		const key = typeof schema.key == 'string' ? schema.key : schema.key.value;
		const mapping = this.loadedMappings()[key];
		let initialValue: DbColumnSpec | null = null;
		if (mapping) {
			initialValue = this.columns().find(({
				name,
				tableName
			}) => name == mapping.dbColumn && tableName == mapping.dbTable) ?? null;
		}
		return new FormControl<DbColumnSpec | null>(initialValue, { nonNullable: false })
	}

	private setupForm(schema: FormSchema) {
		this.clearAllControls();
		const sections = schema.sections.flatMap(section => this.setupSection(section));
		this.controls.push(sections);
		this.cdr.markForCheck();
	}

	ngOnInit(): void {
		this.loadColumns(this.form()!).pipe(
			tap(() => this.columnsNotifier.notify()),
			concatMap(() => this.loadMappings(this.form()!).pipe(
				tap(() => this.mappingsNotifier.notify())
			))
		).subscribe({
			complete: () => {
				this.cdr.markForCheck();
			}
		});
	}

	private setupSection(schema: SectionSchema, isChild = false): SectionForm[] {
		const fields = schema!.fields;
		const id = schema!.id;
		const children = (schema as any).children ?? [];
		const _fields = new FormRecord(fields
			.map(f => {
				if (f.type == 'table') return this.setupTabularField(f);
				else if (f.type == 'group') return this.setupGroupField(f);
				const key = extractFieldKey(f.key);
				return ({ [key]: this.setupField(f) });
			})
			.reduce((acc, curr) => {
				return ({ ...acc, ...curr });
			}, {} as Record<string, FieldControl>)
		);
		const group: SectionForm = new FormGroup({
			fields: _fields,
			id: new FormControl<string | null>(id ?? null, { nonNullable: false }),
			isChild: new FormControl<boolean>(isChild, { nonNullable: true })
		});
		return [group, ...children.flatMap((s: any) => this.setupSection(s, true))];
	}

	protected removeMapping(control: FieldControl, key: FieldKey) {
		if (!control.value) return;
		this.doRemoveMapping(this.form()!, key).subscribe({
			error: (e: Error) => {
				toast.error(this.translateService.instant('msg.error.title'), { description: e.message })
			},
			complete: () => {
				control.setValue(null);
				control.markAsPristine();
				control.markAsUntouched();
				control.updateValueAndValidity();
				this.cdr.markForCheck();
			}
		})
	}
}
