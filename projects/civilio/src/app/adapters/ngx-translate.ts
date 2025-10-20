import { isDevMode, Provider } from '@angular/core';
import { isDesktop } from '@app/util';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader } from '@ngx-translate/core';
import { ElectronTranslationLoader } from './electron/ngx-translate';
import { WebTranslationLoader } from './web/ngx-translate';


export function provideTranslationLoader() {
  return { provide: TranslateLoader, useClass: isDesktop() ? ElectronTranslationLoader : WebTranslationLoader } as Provider;
}

export class MissingTranslationHandlerImpl implements MissingTranslationHandler {
	handle(params: MissingTranslationHandlerParams) {
		return isDevMode() ? params.key : '';
	}
}
