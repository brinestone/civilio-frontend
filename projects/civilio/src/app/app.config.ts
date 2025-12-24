import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
	ApplicationConfig,
	isDevMode,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { usingElectron } from '@app/services/electron';
import { usingWeb } from '@app/services/web';
import { isDesktop } from '@app/util';
import { provideNgIconLoader } from '@ng-icons/core';
import {
	provideMissingTranslationHandler,
	provideTranslateService
} from '@ngx-translate/core';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { provideStore } from '@ngxs/store';
import { provideCasl } from './adapters/casl';
import {
	MissingTranslationHandlerImpl,
	provideTranslationLoader
} from './adapters/ngx-translate/ngx-translate';
import { TranslateTitleStrategy } from './adapters/ngx-translate/title.strategy';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';
import { provideDomainConfig } from './services/config';
import { provideDomainForms } from './services/form';
import { provideNotifications } from './services/notification';
import { AuthState } from './store/auth';
import { ConfigState } from './store/config';
import { NotificationState } from './store/notifications';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
		provideZonelessChangeDetection(),
		provideRouter(routes, withComponentInputBinding()),
		provideDomainConfig(),
		provideDomainForms(isDesktop() ? usingElectron() : usingWeb()),
		provideStore([NotificationState, ConfigState, AuthState],
			withNgxsRouterPlugin(),
			withNgxsLoggerPlugin({
				disabled: !isDevMode(),
				collapsed: false
			}),
		),
		provideNgIconLoader(async name => {
			return await fetch(`/${name}.svg`).then(r => r.text());
		}),
		provideCasl(),
		provideNotifications(),
		provideTranslateService({
			fallbackLang: 'fr',
			loader: provideTranslationLoader(),
			missingTranslationHandler: provideMissingTranslationHandler(MissingTranslationHandlerImpl)
		}),
		{ provide: TitleStrategy, useClass: TranslateTitleStrategy }
	]
};
