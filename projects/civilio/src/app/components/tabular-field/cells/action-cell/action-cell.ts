import { Component, computed, input, output } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CellContext, injectFlexRenderContext, RowData } from '@tanstack/angular-table';
import { RowContext } from '@angular/cdk/table';

export type ActionTriggeredEvent<T> = {
	row: T,
	index: number;
	identifier: RowAction<T>['identifier']
}
export type RowAction<T> = {
	class?: string;
	identifier: string | Symbol;
	icon?: string;
	label?: string;
	relevance?: (ctx: RowContext<T>) => boolean;
};

@Component({
	selector: 'cv-actions-cell',
	imports: [HlmButton, NgIcon, TranslatePipe],
	template: `
		@if ((actions() ?? []).length > 0) {
			@for (action of actions(); track action.identifier) {
				<button [title]="minimal() ? (_static() ? action.label : (action.label| translate)) : ''"
								(click)="onActionButtonClicked(action.identifier)"
								hlmBtn
								variant="ghost"
								[size]="!action.label && action.icon ? 'icon' : 'default'">
					@if (action.icon) {
						<ng-icon [name]="action.icon"/>
					}
					@if (action.label && !minimal()) {
						<span>{{ _static() ? action.label : (action.label | translate) }} </span>
					}
				</button>
			}
		}
	`,
	styles: `
		@reference "tailwindcss";
		:host {
			@apply inline-flex justify-start items-center flex-wrap;
		}
	`
})
export class ActionCell<T extends RowData> {
	readonly minimal = input<boolean>();
	readonly shouldTranslateText = input<boolean>();
	readonly actions = input<RowAction<T>[]>();
	readonly actionTriggered = output<ActionTriggeredEvent<T>>();

	protected readonly _static = computed(() => !this.shouldTranslateText());
	protected readonly context = injectFlexRenderContext<CellContext<T, unknown>>();

	protected onActionButtonClicked(identifier: string | Symbol) {
		this.actionTriggered.emit({
			row: this.context.row.original,
			identifier: identifier,
			index: this.context.row.index
		});
	}
}
