import { NgTemplateOutlet } from '@angular/common';
import {
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	input,
	OnInit,
	signal,
	untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { FormSchema, SectionSchema } from '@app/model/form';
import { ValuesPipe } from '@app/pipes';
import { LoadDbColumns, LoadMappings, RemoveMapping, UpdateMappings } from '@app/store/form';
import { dbColumnsFor, formMappings } from '@app/store/selectors';
import { DbColumnSpec, FieldMapping, FieldUpdateSpec, FormType, UnwrapArray } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {HlmBadge} from '@spartan-ng/helm/badge'
import { lucideCheck, lucideChevronsUpDown, lucideSearch, lucideX } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { dispatch, Store } from '@ngxs/store';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { BrnPopover, BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';
import { derivedFrom } from 'ngxtension/derived-from';
import { concat, filter, map, mergeMap, pipe, tap } from 'rxjs';

type FieldForm = FormGroup<{
	key: FormControl<string>,
	col: FormControl<{
		name: string;
		dataType: string;
		tableName: string;
	} | null | undefined>;
}>;

@Component({
	selector: 'cv-field-mapper',
	viewProviders: [
		provideIcons({
			lucideChevronsUpDown,
			lucideSearch,
			lucideCheck,
			lucideX
		})
	],
	imports: [
		HlmLabel,
		TranslatePipe,
		BrnCommandImports,
		HlmCommandImports,
		NgIcon,
		HlmIcon,
		HlmBadge,
		HlmButton,
		BrnPopover,
		ValuesPipe,
		ReactiveFormsModule,
		BrnPopoverTrigger,
		HlmPopoverContent,
		NgTemplateOutlet,
		BrnPopoverContent,
	],
	templateUrl: './field-mapper.component.html',
	styleUrl: './field-mapper.component.scss'
})
export class FieldMapperComponent implements OnInit {
	private store = inject(Store);
	private destroyRef = inject(DestroyRef);
	private updateMapping = dispatch(UpdateMappings);
	private loadMappings = dispatch(LoadMappings);
	private loadColumns = dispatch(LoadDbColumns);
	protected removeMapping = dispatch(RemoveMapping);

	readonly formModel = input.required<FormSchema>();
	readonly form = input<FormType>();
	protected readonly mappings = derivedFrom([this.store.selectSignal(formMappings), this.form], pipe(
		filter(([_, f]) => f != undefined),
		map(([mappings, form]) => mappings?.[form!] ?? {})
	), { initialValue: {} });
	protected readonly mappedColumns = signal<Record<string, { field: string, table: string }[]>>({});
	protected readonly dbColumns = computed(() => {
		const form = this.form();
		if (!form) return [];
		const specs = this.store.selectSnapshot(dbColumnsFor(form));
		const mapped = this.mappedColumns();
		return specs.filter(spec => {
			const entry = mapped?.[spec.name];
			return entry?.every(v => v.table != spec.tableName) ?? true;
		});
	});
	protected readonly inputForm = new FormRecord<FieldForm>({});
	constructor() {
		effect(() => {
			const mappings = this.mappings();
			if (!mappings) return;
			for (const mapping of Object.values(mappings)) {
				this.mappedColumns.update(m => ({ ...m, [mapping.dbColumn]: [...(m[mapping.dbColumn] ?? []), { field: mapping.field, table: mapping.dbTable }] }));
			}
		})
		effect(() => {
			const form = this.form();
			if (!form) return;
			concat(this.loadMappings(form), this.loadColumns(form)).subscribe();
		});
		effect(() => {
			const model = this.formModel();
			this.clearFormControls();

			const fields = Array<[string, FieldForm]>();
			for (const section of model.sections) {
				fields.push(...this.findAllFields(section));
			}

			for (const [k, field] of fields) {
				this.inputForm.addControl(k, field);
			}
		})
	}

	private findAllFields(section: SectionSchema) {
		const result = Array<[string, FieldForm]>();
		const mappings = untracked(this.mappings);
		const dbColumns = untracked(this.dbColumns);
		if (section.children && section.children.length > 0) {
			for (const childSection of section.children) {
				result.push(...this.findAllFields(childSection as any));
			}
		}
		for (const field of section.fields) {
			if (field.type == 'table') {
				for (const column of Object.values(field.columns)) {
					const mapping: FieldMapping | undefined = (mappings as Record<string, FieldMapping>)[field.key as string];
					let colSpec;
					if (mapping) {
						colSpec = dbColumns.find(c => c.name == mapping.dbColumn && c.tableName == mapping.dbTable);
					}
					result.push([
						column.key,
						new FormGroup({
							col: new FormControl(colSpec),
							key: new FormControl(String(column.key), { nonNullable: true })
						})
					]);
				}
			} else {
				const mapping: FieldMapping | undefined = (mappings as Record<string, FieldMapping>)[field.key as string];
				let colSpec;
				if (mapping) {
					colSpec = dbColumns.find(c => c.name == mapping.dbColumn && c.tableName == mapping.dbTable);
				}
				const group: FieldForm = new FormGroup({
					col: new FormControl(colSpec),
					key: new FormControl(String(field.key), { nonNullable: true })
				});
				result.push([field.key, group]);
			}

		}
		return result;
	}

	private clearFormControls() {
		const keys = [...Object.keys(this.inputForm.controls)];
		for (const key of keys) {
			this.inputForm.removeControl(key);
		}
	}

	ngOnInit(): void {
		this.inputForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef),
			tap(() => this.mappedColumns.set({})),
			mergeMap(Object.entries),
			filter(([_, v]) => v != null && v.col != null)
		).subscribe(([k, v]) => {
			const { col } = v as { col: DbColumnSpec };
			this.mappedColumns.update(m => ({ ...m, [col.name]: [...(m[col.name] ?? []), { field: k, table: col.tableName }] }));
		});
		setTimeout(() => {
			this.inputForm.valueChanges.pipe(
				takeUntilDestroyed(this.destroyRef),
				map(v => {
					const updates = Array<FieldUpdateSpec>();
					for (const value of Object.values(v)) {
						if (!value) continue;
						if (!value.col) continue;
						updates.push({ field: value.key as any, dbColumn: value.col.name, table: value.col.tableName });
					}
					return updates;
				})
			).subscribe((v) => {
				const form = this.form();
				if (!form) return;
				this.updateMapping(form, ...v)
			});
		}, 1000)
	}
}
