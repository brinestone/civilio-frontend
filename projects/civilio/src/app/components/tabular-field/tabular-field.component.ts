import { DecimalPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColumnDefinition, ParsedValue, parseValue } from '@app/model';
import { Option } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCheckCheck, lucidePencil, lucidePlus, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { derivedFrom } from 'ngxtension/derived-from';
import { map, pipe } from 'rxjs';

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
    NgIcon,
    NgClass
  ],
  templateUrl: './tabular-field.component.html',
  styleUrl: './tabular-field.component.scss',
  viewProviders: [
    provideIcons({
      lucidePencil,
      lucideCheck,
      lucidePlus,
      lucideTrash2,
      lucideX,
      lucideCheckCheck,
    })
  ],
  providers: [
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
  public readonly loadingData = input<boolean>();
  public readonly enableCreationActions = input<boolean>();
  public readonly maxRows = input<number>();
  public readonly title = input<string>();

  protected readonly _columnSchemas = computed(() => Object.values(this.columnsSchema()).reduce((acc, curr) => ({
    ...acc,
    [curr.key]: curr
  }), {} as Record<string, ColumnDefinition>));
  protected readonly _headers = computed(() => Object.keys(this._columnSchemas()));
  protected readonly _data = signal<Record<string, ParsedValue | ParsedValue[]>[]>([]);
  protected readonly _disabled = signal(false);
  protected readonly _editingRows = signal<number[]>([]);
  protected readonly _pendingUpdates = signal<[number, Record<string, ParsedValue | ParsedValue[]>, boolean][]>([]);
  protected readonly _committedData = signal<Record<string, ParsedValue | ParsedValue[]>[]>([]);
  protected readonly _hasPendingUpdates = derivedFrom([this._pendingUpdates, this._editingRows], pipe(
    map(([pending, rows]) => pending.length > 0 || pending.some(([_, __, isNew]) => isNew) || rows.length > 0)
  ))

  protected updateValue(row: number, key: string, value: any) {
    const schema = this._columnSchemas()[key];
    const parsedValue = parseValue(schema, value);

    this._pendingUpdates.update(data => {
      // Find existing update for this row
      const existingUpdateIndex = data.findIndex(([rowIndex]) => rowIndex === row);

      if (existingUpdateIndex !== -1) {
        // Update existing pending update
        data[existingUpdateIndex][1][key] = parsedValue;
      } else {
        // Create new pending update
        data.push([row, { [key]: parsedValue }, false]);
      }

      return [...data];
    });
  }

  protected cancelEditingRow(index: number) {
    // Find the pending update for this row
    const pendingUpdateIndex = this._pendingUpdates().findIndex(([rowIndex]) => rowIndex === index);

    if (pendingUpdateIndex !== -1) {
      const entry = this._pendingUpdates()[pendingUpdateIndex];

      // If this was a new row (marked with true), remove it from the data
      if (entry[2]) {
        this._data.update(data => {
          const newData = data.filter((_, i) => i !== index);

          // Update editing rows for rows that come after the removed row
          this._editingRows.update(editingRows =>
            editingRows
              .filter(i => i !== index)
              .map(i => i > index ? i - 1 : i)
          );

          // Update pending updates for rows that come after the removed row
          this._pendingUpdates.update(pendingUpdates =>
            pendingUpdates
              .filter(([i]) => i !== index)
              .map(([i, updates, isNew]) => [i > index ? i - 1 : i, updates, isNew])
          );

          return newData;
        });
      } else {
        // Just remove from pending updates and editing rows for existing rows
        this._pendingUpdates.update(data => data.filter((_, i) => i !== pendingUpdateIndex));
        this._editingRows.update(arr => arr.filter(x => x !== index));
      }
    } else {
      // No pending update, just remove from editing rows
      this._editingRows.update(arr => arr.filter(x => x !== index));
    }
  }

  protected commitEdit(index: number) {
    const pendingUpdates = this._pendingUpdates();
    const updateForRow = pendingUpdates.find(([rowIndex]) => rowIndex === index);

    if (updateForRow) {
      this._data.update(data => {
        const [rowIndex, updates, isNew] = updateForRow;

        if (isNew) {
          // For new rows, we already have the empty object, just update it
          Object.assign(data[rowIndex], updates);
        } else {
          // For existing rows, merge the updates
          data[rowIndex] = { ...data[rowIndex], ...updates };
        }

        return [...data];
      });

      // Update committed data with the changes
      this._committedData.update(committedData => {
        const newCommittedData = [...committedData];

        if (index >= newCommittedData.length) {
          // If this is beyond current committed data length, extend the array
          while (newCommittedData.length <= index) {
            newCommittedData.push({});
          }
        }

        const [rowIndex, updates, isNew] = updateForRow;
        newCommittedData[rowIndex] = { ...newCommittedData[rowIndex], ...updates };

        return newCommittedData;
      });

      // Send only the committed data via callback
      this.changeCallback?.(this._committedData());
    }

    this._editingRows.update(arr => arr.filter(x => x !== index));
    this._pendingUpdates.update(data => data.filter(([rowIndex]) => rowIndex !== index));
  }

  protected startEditingRow(index: number) {
    this._editingRows.update(arr => {
      return [...(new Set([...arr, index]))];
    });
  }

  protected commitAllChanges() {
    const pendingUpdates = this._pendingUpdates();

    if (pendingUpdates.length === 0) {
      return; // No changes to commit
    }

    this._data.update(data => {
      // Apply all pending updates to the data
      pendingUpdates.forEach(([rowIndex, updates, isNew]) => {
        if (rowIndex < data.length) {
          if (isNew) {
            // For new rows, merge the updates
            data[rowIndex] = { ...data[rowIndex], ...updates };
          } else {
            // For existing rows, merge the updates
            data[rowIndex] = { ...data[rowIndex], ...updates };
          }
        }
      });
      return [...data];
    });

    // Update committed data with all changes
    this._committedData.update(committedData => {
      const newCommittedData = [...committedData];

      pendingUpdates.forEach(([rowIndex, updates, isNew]) => {
        // Ensure the array is long enough
        if (rowIndex >= newCommittedData.length) {
          while (newCommittedData.length <= rowIndex) {
            newCommittedData.push({});
          }
        }

        newCommittedData[rowIndex] = { ...newCommittedData[rowIndex], ...updates };
      });

      return newCommittedData;
    });

    // Clear all pending updates and editing states
    this._pendingUpdates.set([]);
    this._editingRows.set([]);

    // Send the updated committed data via callback
    this.changeCallback?.(this._committedData());
    this.touchCallback?.();
  }

  protected discardAllChanges() {
    const pendingUpdates = this._pendingUpdates();

    if (pendingUpdates.length === 0) {
      return; // No changes to discard
    }

    // Filter out new rows that haven't been committed yet
    const newRows = pendingUpdates.filter(([_, __, isNew]) => isNew);

    if (newRows.length > 0) {
      // Remove all new rows from the data
      this._data.update(data => {
        const rowsToRemove = newRows.map(([rowIndex]) => rowIndex).sort((a, b) => b - a); // Sort descending for safe removal

        let newData = [...data];
        rowsToRemove.forEach(rowIndex => {
          newData = newData.filter((_, i) => i !== rowIndex);
        });

        return newData;
      });
    }

    // Clear all pending updates and editing states
    this._pendingUpdates.set([]);
    this._editingRows.set([]);

    // Notify parent of current committed state (no changes)
    this.changeCallback?.(this._committedData());
    this.touchCallback?.();
  }

  writeValue(obj: any): void {
    const newData = [...(obj ?? [])];
    this._data.set(newData);
    this._committedData.set(newData); // Initialize committed data with the same values
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

  protected addRow() {
    const index = this._data().length;
    this._editingRows.update(arr => [...(new Set([...arr, index]))]);
    this._pendingUpdates.update(list => [...list, [index, {}, true]]);
    this._data.update(data => [...data, {}]);
  }

  protected removeRow(index: number) {
    this._data.update(data => {
      const newData = data.filter((_, i) => i !== index);

      // Update editing rows for rows that come after the removed row
      this._editingRows.update(editingRows =>
        editingRows
          .filter(i => i !== index) // Remove the deleted row
          .map(i => i > index ? i - 1 : i) // Adjust indices for rows after the removed one
      );

      // Update pending updates for rows that come after the removed row
      this._pendingUpdates.update(pendingUpdates =>
        pendingUpdates
          .filter(([i]) => i !== index) // Remove the deleted row's updates
          .map(([i, updates, isNew]) => [i > index ? i - 1 : i, updates, isNew]) // Adjust indices
      );

      // Update committed data as well
      this._committedData.update(committedData => {
        const newCommittedData = committedData.filter((_, i) => i !== index);
        return newCommittedData;
      });

      return newData;
    });

    // Notify parent of the change
    this.changeCallback?.(this._committedData());
    this.touchCallback?.();
  }

  protected findOption(group: string, value: any) {
    return this.optionSource()[group]?.find(o => o.value == value);
  }
}
