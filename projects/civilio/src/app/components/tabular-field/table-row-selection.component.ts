import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellContext, injectFlexRenderContext } from '@tanstack/angular-table';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';

@Component({
	template: `
		<hlm-checkbox [checked]="context.row.getIsSelected()"
									(checkedChange)="context.row.toggleSelected($event)"
		/>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'px-1 block' },
	imports: [
		HlmCheckbox
	]
})
export class TableRowSelectionComponent<T> {
	protected context = injectFlexRenderContext<CellContext<T, unknown>>();
}
