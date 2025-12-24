import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, inject, OnInit, resource, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiParamsConfigComponent, LocaleSelectorComponent, ThemeSelectorComponent } from '@app/components';
import { isActionLoading, sendRpcMessageAsync } from '@app/util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucidePencil, lucideSettings } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { DiscoverServer } from '@app/store/config';
import { Actions, dispatch, ofActionCompleted, ofActionDispatched, select } from '@ngxs/store';
import { map, merge } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { serverOnline } from '@app/store/selectors';
import { ReSignIn } from '@app/store/auth';

@Component({
	selector: 'cv-auth',
	viewProviders: [
		provideIcons({
			lucideSettings,
			lucidePencil,
			lucideLoader
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
		ApiParamsConfigComponent,
		RouterOutlet,
		HlmSeparator
	],
	templateUrl: './auth.layout.html',
	styleUrl: './auth.layout.scss',
})
export class AuthLayout implements OnInit {
	private readonly discoverServer = dispatch(DiscoverServer);
	private readonly actions$ = inject(Actions);
	protected readonly serverOnline = select(serverOnline);
	protected readonly settingsSheetOpenState = signal<BrnDialogState>('closed');
	protected readonly discoveringServer = toSignal(
		merge(
			this.actions$.pipe(ofActionDispatched(DiscoverServer), map(() => true)),
			this.actions$.pipe(ofActionCompleted(DiscoverServer), map(() => false)),
		),
		{ initialValue: false }
	);
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
	ngOnInit() {
		this.discoverServer();
	}
}
