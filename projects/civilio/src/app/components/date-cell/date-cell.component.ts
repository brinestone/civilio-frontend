import { Component, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AgoDatePipe } from '@app/pipes';
import { select } from '@ngxs/store';
import { currentLocale } from '@app/store/selectors';
import { CellContext, injectFlexRenderContext } from '@tanstack/angular-table';
import { HlmTd } from '@spartan-ng/helm/table';

@Component({
	selector: 'cv-date-cell',
	imports: [DatePipe, AgoDatePipe, HlmTd],
	template: `
		<td hlmTd>
			<span
			[title]="context.cell.getValue() | date:'dd/MM/yyyy HH:mm'">{{ context.cell.getValue() | ago_date:actualLocale() }}</span>
		</td>
	`,
})
export class DateCell<T> {
	readonly locale = select(currentLocale);
	readonly context = injectFlexRenderContext<CellContext<T, Date>>()
	protected readonly actualLocale = computed(() => {
		return (this.locale().startsWith('en') ? 'en-CM' : 'fr-CM').slice(0, 2);
	})
}
