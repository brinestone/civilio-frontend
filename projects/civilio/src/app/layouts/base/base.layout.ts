import { Component, computed, resource } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
	LocaleSelectorComponent,
	ThemeSelectorComponent
} from '@app/components';
import { Logout } from '@app/store/auth';
import { principal } from '@app/store/selectors';
import { isActionLoading, sendRpcMessageAsync } from '@app/util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucideLogOut, lucideSettings, lucideTable2 } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { dispatch, select } from '@ngxs/store';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
	selector: 'cv-base',
	viewProviders: [
		provideIcons({
			lucideTable2,
			lucideSettings,
			lucideLogOut,
			lucideLoader
		})
	],
	imports: [
		NgIcon,
		RouterLink,
		TranslatePipe,
		HlmButton,
		HlmBadge,
		RouterLinkActive,
		HlmAvatarImports,
		ThemeSelectorComponent,
		// HlmDropdownMenuImports,
		LocaleSelectorComponent,
		RouterOutlet
	],
	templateUrl: './base.layout.html',
	styleUrl: './base.layout.scss'
})
export class BaseLayout {
	protected signOut = dispatch(Logout);
	protected signingOut = isActionLoading(Logout);
	protected principal = select(principal);
	protected readonly initials = computed(() => {
		return this.principal()?.name?.split(' ', 3)
			.slice(0, 2)
			.map(s => s[0])
			.join('');
	})
	protected leftLinks = [
		{ label: 'submissions.title', icon: 'lucideTable2', path: '/submissions' },
		{ label: 'settings.title', icon: 'lucideSettings', path: '/settings' },
	];
	protected readonly wideLogoUrl = resource({
		loader: async () => {
			return await sendRpcMessageAsync('resource:read', 'img/outlined-logo.svg');
		}
	});
}
