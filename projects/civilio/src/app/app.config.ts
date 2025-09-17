import { ApplicationConfig, inject, isDevMode, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { provideStore } from '@ngxs/store';
import { routes } from './app.routes';
import { ConfigState } from './state/config';
import { provideNgIconLoader } from '@ng-icons/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true })),
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
    })
  ]
};
