import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgIconLoader } from '@ng-icons/core';
import { provideTranslateService } from '@ngx-translate/core';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { provideStore } from '@ngxs/store';
import { provideTranslationLoader } from './adapters/ngx-translate';
import { routes } from './app.routes';
import { provideDomainForms } from './services/form';
import { ConfigState } from './store/config';
import { provideDomainConfig } from './services/config';
import { provideNotifications } from './services/notification';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideDomainConfig(),
    provideDomainForms(),
    provideStore([ConfigState],
      withNgxsRouterPlugin(),
      withNgxsLoggerPlugin({
        disabled: !isDevMode(),
        collapsed: true
      }),
      withNgxsFormPlugin()
    ),
    provideNgIconLoader(async name => {
      return await fetch(`/${name}.svg`).then(r => r.text());
    }),
    provideNotifications(),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslationLoader()
    })
  ]
};
