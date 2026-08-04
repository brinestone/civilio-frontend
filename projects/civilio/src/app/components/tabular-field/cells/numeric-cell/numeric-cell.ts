import { DecimalPipe } from "@angular/common";
import { Component, input } from "@angular/core";
import { CellContext, injectFlexRenderContext, RowData } from "@tanstack/angular-table";

@Component({
	selector: 'cv-numeric-cell',
	imports: [DecimalPipe],
	template: `
	{{ctx.getValue() | number:(digitsInfo())}}
	`
})
export class NumericCell<T extends RowData> {
	readonly digitsInfo = input.required<string>();
	protected readonly ctx = injectFlexRenderContext<CellContext<T, number>>();

}
