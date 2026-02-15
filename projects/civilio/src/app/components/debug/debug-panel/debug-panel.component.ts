import { Component, signal } from '@angular/core';
import { DevOnly } from '@app/directives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronUp } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';

@Component({
	selector: 'cv-debug-panel',
	viewProviders: [
		provideIcons({
			lucideChevronDown,
			lucideChevronUp
		})
	],
	imports: [
		HlmButton,
		HlmSeparator,
		NgIcon
	],
	templateUrl: './debug-panel.component.html',
	styleUrl: './debug-panel.component.scss',
	hostDirectives: [
		DevOnly
	],
})
export class DebugPanelComponent {
	protected expanded = signal(true);
	protected toggleExpanded() {
		this.expanded.update(v => !v);
	}
}
