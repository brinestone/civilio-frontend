import { Component, computed, input, output } from '@angular/core';
import { ColumnDefinition } from '@app/model/form';
import { CellContext, injectFlexRenderContext } from '@tanstack/angular-table';
import { Option } from '@civilio/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { AgoDatePipe } from '@app/pipes';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmDatePicker } from '@spartan-ng/helm/date-picker';
import { debounce } from 'lodash';

@Component({
	selector: 'cv-editable-cell',
	templateUrl: './editable-cell.component.html',
	imports: [TranslatePipe, HlmSelectImports, DecimalPipe, AgoDatePipe, BrnSelectImports, HlmCheckbox, HlmInput, HlmDatePicker]
})
export class EditableCellComponent<T> {
	readonly editing = input<boolean>();
	readonly schema = input.required<ColumnDefinition>();
	readonly options = input<Record<string, Option[]>>();
	readonly locale = input<string>();
	readonly blur = output();
	readonly change = output<T>();
	protected readonly selectionDefinition = computed(() => {
		const schema = this.schema();
		if (schema.type == 'single-selection' || schema.type == 'multi-selection') {
			return schema;
		}
		return undefined;
	})
	protected readonly context = injectFlexRenderContext<CellContext<unknown, T>>();
	protected readonly selectedOptions = computed(() => {
		const schema = this.selectionDefinition();
		const options = this.options();
		const value = this.context.cell.getValue();
		if (!options || !value || !schema) return undefined;
		if (Array.isArray(value)) return options[schema.optionGroupKey]?.filter(o => value.includes(o.value));
		return options[schema.optionGroupKey]?.filter(o => o.value === value);
	});
	protected readonly onChange = debounce(this.changeHandler.bind(this), 300);

	private changeHandler(value: any) {
		this.change.emit(value);
	}
}
