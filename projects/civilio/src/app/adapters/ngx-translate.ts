import { Injectable, Provider } from '@angular/core';
import { sendRpcMessageAsync } from '@app/util';
import { LoadTranslationRequest, Locale } from '@civilio/shared';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { from, map, Observable } from 'rxjs';

@Injectable()
class ElectronTranslationLoader extends TranslateLoader {
  override getTranslation(lang: string): Observable<TranslationObject> {
    const locale: Locale = lang.startsWith('en') ? 'en-CM' : 'fr-CM';
    return from(sendRpcMessageAsync('translations:read', { locale } as LoadTranslationRequest)).pipe(
      map(v => v as TranslationObject)
    );
  }
}

export function provideElectronTranslationLoader() {
  return { provide: TranslateLoader, useClass: ElectronTranslationLoader } as Provider;
}
