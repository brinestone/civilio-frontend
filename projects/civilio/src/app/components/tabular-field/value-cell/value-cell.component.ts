import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { ColumnDefinition, ParsedValue } from '@app/model';
import { Option } from '@civilio/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'cv-value-cell',
  imports: [
    HlmCheckboxImports,
    HlmSelectImports,
    NgTemplateOutlet,
    TranslatePipe,
    BrnSelectImports,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './value-cell.component.html',
  styleUrl: './value-cell.component.scss'
})
export class ValueCellComponent {
  readonly options = input<Option[]>();
  readonly value = input.required<ParsedValue | ParsedValue[]>();
  readonly columnSchema = input.required<ColumnDefinition>();
  readonly editing = input<boolean>();
  readonly valueChange = output<ParsedValue>();
  readonly blur = output();

  protected readonly _option = computed(() => {
    const value = this.value();
    if (Array.isArray(value))
      return value.map(v => this.options()?.find(o => o.value == v));
    return this.options()?.find(o => o.value == value);
  })
  protected readonly _editing = linkedSignal(() => this.editing() ?? false);
}
