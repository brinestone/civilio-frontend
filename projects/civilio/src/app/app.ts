import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en-CM';
import localeFr from '@angular/common/locales/fr-CM';
import {
	Component,
	DOCUMENT,
	effect,
	inject,
	PLATFORM_ID,
	signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { BaseLayout } from '@app/layouts/base/base.layout';
import { LoadConfig } from '@app/store/config';
import { dispatch, select } from '@ngxs/store';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { ThemeService } from './services/theme.service';
import { fontSize } from './store/selectors';

registerLocaleData(localeFr);
registerLocaleData(localeEn);


@Component({
	selector: 'cv-root',
	imports: [RouterOutlet, BaseLayout, HlmToaster],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	protected readonly platformId = inject(PLATFORM_ID);
	protected readonly document = inject(DOCUMENT);
	protected readonly title = signal('civilio');
	protected readonly fontSize = select(fontSize);
	private loadConfig = dispatch(LoadConfig);
	private themeService = inject(ThemeService);
	protected themeSignal = toSignal(this.themeService.theme$, { initialValue: 'system' });

	constructor() {
		if (isPlatformBrowser(this.platformId)) {
			effect(() => {
				const fs = this.fontSize();
				if (fs === undefined) return;
				this.document.documentElement.style.fontSize = `${ fs }px`;
			});
		}
	}

	// ngOnInit(): void {
	// 	if (isDesktop()) {
	// 		this.loadConfig();
	// 	}
	// }
}
