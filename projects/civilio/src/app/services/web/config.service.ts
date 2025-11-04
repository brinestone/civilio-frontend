import { DbConfig, AppConfigResponse, TestDbConnectionRequest, TestDbConnectionResponse, Locale, ThemeMode } from "@civilio/shared";
import { ConfigService } from "../config";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: null
})
export class WebConfigService implements ConfigService {
	setFontSize(size: number): Promise<AppConfigResponse> {
		throw new Error("Method not implemented.");
	}
  setDbConfig(dbConfig: DbConfig): Promise<AppConfigResponse> {
    throw new Error("Method not implemented.");
  }
  testDb(input: TestDbConnectionRequest): Promise<TestDbConnectionResponse> {
    throw new Error("Method not implemented.");
  }
  setLocale(locale: Locale): Promise<AppConfigResponse> {
    throw new Error("Method not implemented.");
  }
  setTheme(theme: ThemeMode): Promise<AppConfigResponse> {
    throw new Error("Method not implemented.");
  }
  loadConfig(): Promise<AppConfigResponse> {
    throw new Error("Method not implemented.");
  }

}
