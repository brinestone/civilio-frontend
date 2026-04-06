import { Component, computed, input } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { BadgeVariants, HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmTd } from "@spartan-ng/helm/table";

@Component({
	selector: 'cv-badge-cell',
	imports: [HlmBadgeImports, TranslatePipe],
	template: `
			@if(text()) {
			@if (_static()) {
			<span hlmBadge [variant]="variant()"> {{ text() }}</span>
		} @else {
			<span hlmBadge [variant]="variant()">{{ text() | translate }}</span>
		}
		}
	`
})
export class BadgeCell {
	readonly variant = input<BadgeVariants['variant']>();
	readonly text = input.required<string>();
	readonly shouldTranslateText = input<boolean>();

	protected readonly _static = computed(() => !this.shouldTranslateText());
}
