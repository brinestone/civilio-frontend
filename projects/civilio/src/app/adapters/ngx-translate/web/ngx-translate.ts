import { Injectable } from "@angular/core";
import { TranslateLoader, TranslationObject } from "@ngx-translate/core";
import { Observable } from "rxjs";

@Injectable()
export class WebTranslationLoader extends TranslateLoader {
  override getTranslation(lang: string): Observable<TranslationObject> {
    throw new Error("Method not implemented.");
  }

}
