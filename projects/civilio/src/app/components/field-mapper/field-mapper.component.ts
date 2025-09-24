import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  linkedSignal,
  OnInit,
  signal,
  untracked
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { FormModelDefinition, FormSection } from '@app/model';
import { LoadDbColumns, LoadMappings, UpdateMappings } from '@app/store/form';
import { dbColumnsFor, formMappings } from '@app/store/selectors';
import { DbColumnSpec, FieldMapping, FieldUpdateSpec, FormType } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronsUpDown, lucideSearch } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { dispatch, Store } from '@ngxs/store';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { BrnPopover, BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';
import { combineLatestWith, concat, filter, map, mergeMap, tap } from 'rxjs';

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
      lucideCheck
    })
  ],
  imports: [
    HlmLabel,
    TranslatePipe,
    BrnCommandImports,
    HlmCommandImports,
    NgIcon,
    HlmIcon,
    HlmButton,
    BrnPopover,
    ReactiveFormsModule,
    BrnPopoverTrigger,
    HlmPopoverContent,
    NgTemplateOutlet,
    BrnPopoverContent
  ],
  templateUrl: './field-mapper.component.html',
  styleUrl: './field-mapper.component.scss'
})
export class FieldMapperComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private updateMapping = dispatch(UpdateMappings);
  private loadMappings = dispatch(LoadMappings);
  private loadColumns = dispatch(LoadDbColumns);
  readonly formModel = input.required<FormModelDefinition>();
  readonly form = input.required<FormType>();
  private readonly form$ = toObservable(this.form);
  protected readonly mappings = toSignal(this.store.select(formMappings).pipe(
    takeUntilDestroyed(),
    combineLatestWith(this.form$),
    map(([mappings, form]) => mappings?.[form] ?? ({} as Record<string, FieldMapping> | undefined))
  ), );
  protected readonly mappedColumns = signal<Record<string, { field: string, table: string }[]>>({});
  protected readonly dbColumns = linkedSignal(() => {
    const specs = this.store.selectSnapshot(dbColumnsFor(this.form()));
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
      concat(this.loadMappings(this.form()), this.loadColumns(this.form())).subscribe();
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

  private findAllFields(section: FormSection) {
    const result = Array<[string, FieldForm]>();
    const mappings = untracked(this.mappings);
    const dbColumns = untracked(this.dbColumns);
    if (section.children && section.children.length > 0) {
      for (const childSection of section.children) {
        result.push(...this.findAllFields(childSection));
      }
    }
    for (const field of section.fields) {
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
        this.updateMapping(this.form(), ...v)
      });
    }, 1000)
  }
}
