import { NgTemplateOutlet } from '@angular/common';
import { Component, resource } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthParamsConfigComponent, LocaleSelectorComponent, ThemeSelectorComponent } from '@app/components';
import { sendRpcMessageAsync } from '@app/util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideSettings } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';

@Component({
	selector: 'cv-auth',
	viewProviders: [
		provideIcons({
			lucideSettings,
			lucidePencil
		})
	],
	imports: [
		NgTemplateOutlet,
		BrnSheetImports,
		HlmSheetImports,
		TranslatePipe,
		NgIcon,
		HlmButton,
		LocaleSelectorComponent,
		ThemeSelectorComponent,
		AuthParamsConfigComponent,
		RouterOutlet,
		HlmSeparator
	],
	templateUrl: './auth.layout.html',
	styleUrl: './auth.layout.scss',
})
export class AuthLayout {
	protected readonly buildInfo = resource({
		loader: async () => {
			return await sendRpcMessageAsync('build:read');
		}
	});
	protected readonly wideLogoUrl = resource({
		loader: async () => {
			return await sendRpcMessageAsync('resource:read', 'img/LogoWide.png');
		}
	});
	protected readonly sponsorUrl = resource({
		loader: async () => {
			return await sendRpcMessageAsync('resource:read', 'img/Civipol.png');
		}
	});
}
