import { Component, computed, forwardRef, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColumnDefinition, ParsedValue } from '@app/model';
import { Option } from '@civilio/shared';
import { TranslateService } from '@ngx-translate/core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { createAngularTable, createColumnHelper, FlexRender, FlexRenderDirective, getCoreRowModel } from '@tanstack/angular-table';

export type ColumnSchemaSource = (key: string) => () => ColumnDefinition;

@Component({
  selector: 'cv-tabular-field',
  imports: [
    HlmTableImports,
    FlexRender,
    FlexRenderDirective
  ],
  templateUrl: './tabular-field.component.html',
  styleUrl: './tabular-field.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TabularFieldComponent), multi: true }
  ],
})
export class TabularFieldComponent implements ControlValueAccessor {
  private translateService = inject(TranslateService);
  private changeCallback?: (arg?: any) => void;
  private touchCallback?: (arg?: any) => void;
  public readonly optionSource = input.required<Record<string, Option[]>>();
  public readonly columnsSchema = input.required<Record<string, ColumnDefinition>>();

  private readonly _columnSchemas = computed(() => Object.values(this.columnsSchema()));
  protected readonly _data = signal<Record<string, ParsedValue>[]>([]);
  private readonly columnHelper = createColumnHelper<Record<string, ParsedValue>>();
  protected readonly _disabled = signal(false);
  protected readonly _columns = linkedSignal(() => {
    const keys = Object.keys(this._data()[0] ?? {});

    return keys.map(k => {
      const columnSchema = this._columnSchemas().find(c => c.key == k) as Extract<ColumnDefinition, { type: 'multi-selection' | 'single-selection'; }>;
      return this.columnHelper.accessor((row) => row[k],
        {
          id: k,
          header: this.translateService.instant(`${k}.title`),
          cell: ({ renderValue }) => {
            if (!(['multi-selection', 'single-selection'] as ColumnDefinition['type'][]).includes(columnSchema.type)) return renderValue();
            const options = untracked(this.optionSource)[columnSchema.optionGroupKey];
            const option = options.find(o => o.value == renderValue());
            return option?.i18nKey ? this.translateService.instant(option.i18nKey) : option?.label;
          }
        });
    });
  });
  protected readonly table = createAngularTable(() => ({
    columns: this._columns(),
    data: this._data(),
    getCoreRowModel: getCoreRowModel(),
  }))

  writeValue(obj: any): void {
    this._data.set(obj ?? []);
  }
  registerOnChange(fn: any): void {
    this.changeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.changeCallback = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

}
