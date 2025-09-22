import { Injectable } from '@angular/core';
import { AppConfigPaths, AppConfigSchema, DbConfig, Locale, TestDbConnectionRequest, TestDbConnectionResponseSchema, ThemeMode, UpdateConfigRequest } from '@civilio/shared';
import { sendRpcMessageAsync } from '../util';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  async setDbConfig(dbConfig: DbConfig) {
    return await sendRpcMessageAsync('config:update', {
      path: 'db' as AppConfigPaths,
      value: dbConfig
    });
  }
  async testDb(input: TestDbConnectionRequest) {
    return await sendRpcMessageAsync('db:test', input).then(TestDbConnectionResponseSchema.parse)
  }
  async setLocale(locale: Locale) {
    return await sendRpcMessageAsync('config:update', {
      path: 'prefs.locale',
      value: locale
    } as UpdateConfigRequest).then(AppConfigSchema.parse);
  }
  async setTheme(theme: ThemeMode) {
    return await sendRpcMessageAsync('config:update', {
      path: 'prefs.theme',
      value: theme
    } as UpdateConfigRequest).then(AppConfigSchema.parse);
  }
  async loadConfig() {
    const result = await sendRpcMessageAsync('config:read');
    return AppConfigSchema.parse(result);
  }
}
