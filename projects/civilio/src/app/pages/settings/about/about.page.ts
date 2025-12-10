import { Component, resource } from '@angular/core';
import { openLinkInBrowser, sendRpcMessageAsync } from '@app/util';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import {
	lucideExternalLink,
	lucideGlobe2,
	lucideMail,
	lucidePhoneCall
} from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmH4 } from '@spartan-ng/helm/typography';
import { HlmButton } from '@spartan-ng/helm/button';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'cv-about',
	viewProviders: [
		provideIcons({
			lucideGlobe2,
			lucideExternalLink,
			lucideMail,
			lucidePhoneCall
		})
	],
	imports: [
		TranslatePipe,
		DatePipe,
		HlmSeparator,
		NgIcon,
		HlmH4,
		HlmButton
	],
	templateUrl: './about.page.html',
	styleUrl: './about.page.scss',
})
export class AboutPage {
	protected readonly buildInfo = resource({
		loader: async () => {
			return await sendRpcMessageAsync('build:read');
		}
	});
	protected readonly licenses = resource({
		loader: async () => {
			return await sendRpcMessageAsync('licences:read');
		}
	})
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

	protected async externalLinkClicked(event: MouseEvent) {
		event.preventDefault();
		await openLinkInBrowser((event.target as unknown as HTMLAnchorElement).href);
	}
}
