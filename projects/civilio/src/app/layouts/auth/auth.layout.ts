import { NgTemplateOutlet } from '@angular/common';
import { Component, resource } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocaleSelectorComponent } from '@app/components';
import { sendRpcMessageAsync } from '@app/util';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmSeparator } from '@spartan-ng/helm/separator';

@Component({
	selector: 'cv-auth',
	imports: [
		NgTemplateOutlet,
		TranslatePipe,
		LocaleSelectorComponent,
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
