import { Injectable } from '@angular/core';
import { AppConfigSchema, Locale, ThemeMode, UpdateConfigRequest } from '@civilio/shared';
import { sendRpcAndWaitAsync } from '../util';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  async setLocale(locale: Locale) {
    return await sendRpcAndWaitAsync('config:update', {
      path: 'prefs.locale',
      value: locale
    } as UpdateConfigRequest).then(AppConfigSchema.parse);
  }
  async setTheme(theme: ThemeMode) {
    return await sendRpcAndWaitAsync('config:update', {
      path: 'prefs.theme',
      value: theme
    } as UpdateConfigRequest).then(AppConfigSchema.parse);
  }
  async loadConfig() {
    const result = await sendRpcAndWaitAsync('config:read');
    return AppConfigSchema.parse(result);
  }
}
