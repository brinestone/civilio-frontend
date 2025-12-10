import { Component, effect, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
	selector: 'cv-overview',
	viewProviders: [
		provideIcons({
			lucideTrash2
		})
	],
	imports: [
		NgIcon,
		HlmButton
	],
	templateUrl: './overview.page.html',
	styleUrl: './overview.page.scss',
})
export class OverviewPage {
	readonly submissionIndex = input<string>();
	constructor() {
		effect(() => {
			console.log(this.submissionIndex());
		})
	}
}
