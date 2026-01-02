import { Component, inject, resource } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HasPendingChanges } from '@app/model/form';
import { FORM_SERVICE } from '@app/services/form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFocus } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmH3 } from "@spartan-ng/helm/typography";
import { Observable } from 'rxjs';

@Component({
	selector: 'cv-choice-settings',
	viewProviders: [
		provideIcons({
			lucideFocus
		})
	],
	imports: [
		HlmH3,
		RouterLink,
		RouterOutlet,
		NgIcon,
		RouterLinkActive,
		TranslatePipe,
		HlmEmptyImports,
	],
	templateUrl: './choice-settings.page.html',
	styleUrl: './choice-settings.page.scss',
})
export class ChoiceSettingsPage implements HasPendingChanges {
	private readonly formService = inject(FORM_SERVICE);
	protected readonly route = inject(ActivatedRoute);
	protected readonly forms = resource({
		loader: async () => {
			return await this.formService.findAllForms();
		}
	})
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}

}
