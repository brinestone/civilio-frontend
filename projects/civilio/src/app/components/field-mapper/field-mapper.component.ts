import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, NgForm } from '@angular/forms';
import { FormModelDefinition } from '@app/model';
import { LoadDbColumns, LoadMappings } from '@app/store/form';
import { dbColumnsFor, fieldMappingsfor } from '@app/store/selectors';
import { FormType } from '@civilio/shared';
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
import { filter, mergeMap, startWith, tap } from 'rxjs';

type FieldForm = FormGroup<{
  id: FormControl<string>;
  col: FormControl<string | null>;
}>;

type SectionForm = FormGroup<{
  key: FormControl<string>;
  fields: FormArray<FieldForm>;
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
    FormsModule,
    HlmLabel,
    TranslatePipe,
    BrnCommandImports,
    HlmCommandImports,
    NgIcon,
    HlmIcon,
    HlmButton,
    BrnPopover,
    BrnPopoverTrigger,
    HlmPopoverContent,
    NgTemplateOutlet,
    BrnPopoverContent
  ],
  templateUrl: './field-mapper.component.html',
  styleUrl: './field-mapper.component.scss'
})
export class FieldMapperComponent implements AfterViewInit {
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private inputForm = viewChild<NgForm>('inputForm');
  private loadMappings = dispatch(LoadMappings);
  private loadColumns = dispatch(LoadDbColumns);
  readonly modelDefinition = input.required<FormModelDefinition>();
  readonly form = input.required<FormType>();
  protected readonly mappings = computed(() => {
    return this.store.selectSnapshot(fieldMappingsfor(this.form()));
  });
  protected readonly mappedColumns = signal<Record<string, { table: string, field: string }[]>>({});
  protected readonly dbColumns = computed(() => {
    const specs = this.store.selectSnapshot(dbColumnsFor(this.form()));
    const mapped = this.mappedColumns();
    return specs.filter(spec => {
      const entry = mapped[spec.name];
      return entry?.every(v => v.table != spec.tableName) ?? true;
    });
  });

  constructor() {
    effect(() => {
      this.loadMappings(this.form());
      this.loadColumns(this.form());
    });
  }

  ngAfterViewInit(): void {
    this.inputForm()?.valueChanges?.pipe(
      startWith(this.inputForm()?.value),
      takeUntilDestroyed(this.destroyRef),
      filter(v => !!v),
      tap(() => this.mappedColumns.set({})),
      mergeMap(Object.entries),
      filter(([_, v]) => v != null),
    ).subscribe(([k, v]) => {
      this.mappedColumns.update(m => ({ ...m, [v.name]: [...(m[v.name] ?? []), { field: k, table: v.tableName }] }));
    });
  }

}
