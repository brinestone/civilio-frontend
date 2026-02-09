import { Component, resource } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
	LocaleSelectorComponent,
	ThemeSelectorComponent
} from '@app/components';
import { sendRpcMessageAsync } from '@app/util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSettings, lucideTable2 } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'cv-base',
	viewProviders: [
		provideIcons({
			lucideTable2,
			lucideSettings,
		})
	],
	imports: [
		NgIcon,
		RouterLink,
		TranslatePipe,
		RouterLinkActive,
		ThemeSelectorComponent,
		LocaleSelectorComponent,
	],
	templateUrl: './base.layout.html',
	styleUrl: './base.layout.scss'
})
export class BaseLayout {
	protected leftLinks = [
		{ label: $localize`:site header|A section of the application which deals with survey form submissions:Form Submissions`, icon: 'lucideTable2', path: '/submissions' },
		{ label: $localize`:site header|A section of the application which deals with configurations and user preferences:Settings`, icon: 'lucideSettings', path: '/settings' },
	];
	protected readonly wideLogoUrl = resource({
		loader: async () => {
			return await sendRpcMessageAsync('resource:read', 'img/outlined-logo.svg');
		}
	});
}
