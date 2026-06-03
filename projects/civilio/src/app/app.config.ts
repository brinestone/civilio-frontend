import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {
	ApplicationConfig,
	isDevMode,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection,
} from "@angular/core";
import {
	provideRouter,
	TitleStrategy,
	withComponentInputBinding,
	withRouterConfig,
} from "@angular/router";
import { provideCollectionIndexing } from "@db/collections";
import { provideNgIconLoader } from "@ng-icons/core";
import {
	provideMissingTranslationHandler,
	provideTranslateService,
} from "@ngx-translate/core";
import { withNgxsLoggerPlugin } from "@ngxs/logger-plugin";
import { withNgxsRouterPlugin } from "@ngxs/router-plugin";
import { StorageOption, withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from "@ngxs/store";
import {
	MissingTranslationHandlerImpl,
	provideTranslationLoader,
} from "./adapters/ngx-translate/ngx-translate";
import { TranslateTitleStrategy } from "./adapters/ngx-translate/title.strategy";
import { routes } from "./app.routes";
import { provideHttpClientErrorHandler } from "./http/error-handler";
import { apiUrlInterceptor } from "./interceptors/api-url-interceptor";
import { provideDomainConfig } from "./services/config";
import { provideSseClient } from "./services/sse.service";
import { ConfigState } from "./store/config";
import { DocsState, SYNC_STATE } from "./store/docs";
import { withDocumentsSdk } from "@civilio/sdk/providers";

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withInterceptors([apiUrlInterceptor])),
		provideCollectionIndexing(),
		provideHttpClientErrorHandler(),
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withRouterConfig({ paramsInheritanceStrategy: "always" }),
		),
		provideDomainConfig(),
		provideStore(
			[ConfigState, DocsState],
			withDocumentsSdk(),
			withNgxsStoragePlugin({
				keys: [SYNC_STATE],
				storage: StorageOption.LocalStorage
			}),
			withNgxsRouterPlugin(),
			withNgxsLoggerPlugin({
				disabled: !isDevMode(),
				collapsed: false,
			}),
		),
		provideNgIconLoader(async (name) => {
			return await fetch(`/${name}.svg`).then((r) => r.text());
		}),
		{ provide: TitleStrategy, useClass: TranslateTitleStrategy },
		provideTranslateService({
			fallbackLang: "fr",
			loader: provideTranslationLoader(),
			missingTranslationHandler: provideMissingTranslationHandler(
				MissingTranslationHandlerImpl,
			),
		}),
	],
};
