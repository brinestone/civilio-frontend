import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
	ApplicationConfig,
	isDevMode,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
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
} from './adapters/ngx-translate/ngx-translate';
import { TranslateTitleStrategy } from './adapters/ngx-translate/title.strategy';
import { routes } from './app.routes';
import { provideHttpClientErrorHandler } from './http/error-handler';
import { apiUrlInterceptor } from './interceptors/api-url-interceptor';
import { provideDomainConfig } from './services/config';
import { provideNotifications } from './services/notification';
import { ConfigState } from './store/config';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withInterceptors([apiUrlInterceptor])),
		provideHttpClientErrorHandler(),
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes, withComponentInputBinding()),
		provideDomainConfig(),
		// provideDomainForms(isDesktop() ? usingElectron() : usingWeb()),
		provideStore([ConfigState],
			withNgxsRouterPlugin(),
			withNgxsLoggerPlugin({
				disabled: !isDevMode(),
				collapsed: false
			}),
		),
		provideNgIconLoader(async name => {
			return await fetch(`/${name}.svg`).then(r => r.text());
		}),
		{ provide: TitleStrategy, useClass: TranslateTitleStrategy },
		provideNotifications(),
		provideTranslateService({
			fallbackLang: 'fr',
			loader: provideTranslationLoader(),
			missingTranslationHandler: provideMissingTranslationHandler(MissingTranslationHandlerImpl)
		})
	]
};
