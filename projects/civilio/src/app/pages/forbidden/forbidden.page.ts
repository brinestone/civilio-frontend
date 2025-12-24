import { Location } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideBan, lucideHome } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';

@Component({
	selector: 'cv-forbidden',
	viewProviders: [
		provideIcons({
			lucideBan,
			lucideArrowLeft,
			lucideHome
		})
	],
	imports: [
		HlmEmptyImports,
		NgIcon,
		TranslatePipe,
		HlmButton,
		RouterLink
	],
	templateUrl: './forbidden.page.html',
	styleUrl: './forbidden.page.scss',
})
export class ForbiddenPage {
	private location = inject(Location);

	@HostListener('document:keydown.escape')
	protected onBackButtonClicked() {
		this.location.back();
	}
}
