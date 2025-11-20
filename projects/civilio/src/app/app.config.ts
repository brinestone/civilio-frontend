import { provideHttpClient } from '@angular/common/http';
import {
	ApplicationConfig,
	isDevMode,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNgIconLoader } from '@ng-icons/core';
import {
	provideMissingTranslationHandler,
	provideTranslateService
} from '@ngx-translate/core';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { provideStore } from '@ngxs/store';
import {
	MissingTranslationHandlerImpl,
	provideTranslationLoader
} from './adapters/ngx-translate';
import { routes } from './app.routes';
import { provideDomainConfig } from './services/config';
import { provideDomainForms } from './services/form';
import { provideNotifications } from './services/notification';
import { ConfigState } from './store/config';
import { isDesktop } from '@app/util';
import { usingElectron } from '@app/services/electron';
import { usingWeb } from '@app/services/web';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(),
		provideZonelessChangeDetection(),
		provideRouter(routes, withComponentInputBinding()),
		provideDomainConfig(),
		provideDomainForms(isDesktop() ? usingElectron() : usingWeb()),
		provideStore([ConfigState],
			withNgxsRouterPlugin(),
			withNgxsLoggerPlugin({
				disabled: !isDevMode(),
				collapsed: false
			}),
		),
		provideNgIconLoader(async name => {
			return await fetch(`/${ name }.svg`).then(r => r.text());
		}),
		provideNotifications(),
		provideTranslateService({
			fallbackLang: 'en',
			loader: provideTranslationLoader(),
			missingTranslationHandler: provideMissingTranslationHandler(MissingTranslationHandlerImpl)
		})
	]
};
