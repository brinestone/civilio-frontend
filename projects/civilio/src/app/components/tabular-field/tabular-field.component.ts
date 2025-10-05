import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColumnDefinition, ParsedValue, parseValue } from '@app/model';
import { Option } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePencil, lucideX } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';

export type ColumnSchemaSource = (key: string) => () => ColumnDefinition;

@Component({
  selector: 'cv-tabular-field',
  imports: [
    TranslatePipe,
    HlmTableImports,
    HlmSelectImports,
    HlmCheckboxImports,
    DecimalPipe,
    BrnSelectImports,
    HlmInput,
    HlmButton,
    NgTemplateOutlet,
    NgIcon
  ],
  templateUrl: './tabular-field.component.html',
  styleUrl: './tabular-field.component.scss',
  providers: [
    provideIcons({
      lucidePencil,
      lucideCheck,
      lucideX
    }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TabularFieldComponent),
      multi: true
    }
  ],
})
export class TabularFieldComponent implements ControlValueAccessor {
  private changeCallback?: (arg?: any) => void;
  protected touchCallback?: (arg?: any) => void;
  public readonly optionSource = input.required<Record<string, Option[]>>();
  public readonly columnsSchema = input.required<Record<string, ColumnDefinition>>();

  protected readonly _columnSchemas = computed(() => Object.values(this.columnsSchema()).reduce((acc, curr) => ({ ...acc, [curr.key]: curr }), {} as Record<string, ColumnDefinition>));
  protected readonly _headers = computed(() => Object.keys(this._columnSchemas()));
  protected readonly _data = signal<Record<string, ParsedValue | ParsedValue[]>[]>([]);
  protected readonly _disabled = signal(false);
  protected readonly _editingRows = signal<number[]>([]);

  protected updateValue(row: number, key: string, value: any) {
    console.log(key, value);
    const schema = this._columnSchemas()[key];
    const parsedValue = parseValue(schema, value);
    this._data.update((data) => {
      const rec = data[row];
      rec[key] = parsedValue;
      return [...data];
    });
    this.changeCallback?.(this._data());
  }

  protected cancelEditingRow(index: number) {
    this._editingRows.update(arr => [...arr.filter(x => x != index)]);
  }

  protected commitEdit(index: number) {
    this.changeCallback?.(this._data());
    this.cancelEditingRow(index);
  }

  protected startEditingRow(index: number) {
    this._editingRows.update(arr => {
      return [...(new Set([...arr, index]))];
    });
  }

  writeValue(obj: any): void {
    this._data.set([...(obj ?? [])]);
  }
  registerOnChange(fn: any): void {
    this.changeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.touchCallback = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  protected findOption(group: string, value: any) {
    return this.optionSource()[group]?.find(o => o.value == value);
  }
}
