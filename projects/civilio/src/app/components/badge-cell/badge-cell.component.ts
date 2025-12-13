import { Component, input, computed } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { HlmBadgeImports, BadgeVariants } from "@spartan-ng/helm/badge";
import { HlmTd } from "@spartan-ng/helm/table";

@Component({
	selector: 'cv-badge-cell',
	imports: [HlmBadgeImports, HlmTd, TranslatePipe],
	template: `
		<td hlmTd>
			@if(text()) {
			@if (_static()) {
			<span hlmBadge [variant]="variant()"> {{ text() }}</span>
		} @else {
			<span hlmBadge [variant]="variant()">{{ text() | translate }}</span>
		}
		}
	</td>
	`
})
export class BadgeCell {
	readonly variant = input<BadgeVariants['variant']>();
	readonly text = input.required<string>();
	readonly shouldTranslateText = input<boolean>();

	protected readonly _static = computed(() => !this.shouldTranslateText());
}
