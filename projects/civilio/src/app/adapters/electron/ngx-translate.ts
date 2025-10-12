import { inject, Injectable } from "@angular/core";
import { I18NUpdated } from "@app/store/notifications/actions";
import { sendRpcMessageAsync } from "@app/util";
import { LoadTranslationRequest, Locale } from "@civilio/shared";
import { TranslateLoader, TranslationObject } from "@ngx-translate/core";
import { Actions, ofActionDispatched } from "@ngxs/store";
import { mergeMap, Observable } from "rxjs";

@Injectable()
export class ElectronTranslationLoader extends TranslateLoader {
  private actions = inject(Actions);

  override getTranslation(lang: string): Observable<TranslationObject> {
    const locale: Locale = lang.startsWith('en') ? 'en-CM' : 'fr-CM';
    return new Observable<TranslationObject>(subscriber => {
      const subscription = this.actions.pipe(
        ofActionDispatched(I18NUpdated),
        mergeMap(() => sendRpcMessageAsync('translations:read', { locale }))
      ).subscribe((v) => {
        subscriber.next(v as TranslationObject);
      });
      subscriber.add(subscription.unsubscribe);

      sendRpcMessageAsync('translations:read', { locale } as LoadTranslationRequest).then(
        v => subscriber.next(v as TranslationObject)
      );
    })
    // return from(sendRpcMessageAsync('translations:read', { locale } as LoadTranslationRequest)).pipe(
    //   map(v => v as TranslationObject)
    // );
  }
}
