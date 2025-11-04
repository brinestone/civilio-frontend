import { InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { isDesktop } from "@app/util";
import { DbConfig, AppConfigResponse, TestDbConnectionRequest, TestDbConnectionResponse, Locale, ThemeMode } from "@civilio/shared";
import { ElectronConfigService } from "../electron/config.service";
import { WebConfigService } from "../web/config.service";

export interface ConfigService {
	setFontSize(size: number): Promise<AppConfigResponse>;
  setDbConfig(dbConfig: DbConfig): Promise<AppConfigResponse>;
  testDb(input: TestDbConnectionRequest): Promise<TestDbConnectionResponse>;
  setLocale(locale: Locale): Promise<AppConfigResponse>;
  setTheme(theme: ThemeMode): Promise<AppConfigResponse>;
  loadConfig(): Promise<AppConfigResponse>;
}

export const CONFIG_SERVICE = new InjectionToken<ConfigService>('CONFIG_SERVICE');

export function provideDomainConfig() {
  const providers: any = [
    { provide: CONFIG_SERVICE, useExisting: isDesktop() ? ElectronConfigService : WebConfigService }
  ];
  if (isDesktop()) {
    providers.push({
      provide: ElectronConfigService,
      useClass: ElectronConfigService,
      multi: false
    })
  } else {
    providers.push({
      provide: WebConfigService,
      useClass: WebConfigService,
      multi: false
    })
  }
  return makeEnvironmentProviders(providers);
}
