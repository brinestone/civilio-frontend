import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderContext, injectFlexRenderContext } from '@tanstack/angular-table';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';

@Component({
	template: `
		<hlm-checkbox
			[checked]="context.table.getIsAllRowsSelected()"
			[indeterminate]="context.table.getIsSomeRowsSelected()"
			(checkedChange)="context.table.toggleAllRowsSelected($event)"
		/>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'px-1 block',
	},
	imports: [
		HlmCheckbox
	]
})
export class TableHeadSelectionComponent<T> {
	context = injectFlexRenderContext<HeaderContext<T, unknown>>()
}
