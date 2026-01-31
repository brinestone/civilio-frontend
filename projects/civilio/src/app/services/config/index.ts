import { InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { ElectronConfigService } from "@app/services/electron";
import { WebConfigService } from "@app/services/web";
import { isDesktop } from "@app/util";
import {
	AppConfigResponse,
	ApplyPendingMigrationsResponse,
	CheckMigrationsResponse,
	DbConfig,
	DeleteDbConnectionRequest,
	DiscoverServerResponse,
	FindConnectionHistoryResponse,
	Locale,
	TestDbConnectionRequest,
	TestDbConnectionResponse,
	ThemeMode,
	UseConnectionRequest
} from "@civilio/shared";

export interface ConfigService {
	setServerUrl(url: string): Promise<AppConfigResponse>;
	discoverServer(): Promise<DiscoverServerResponse>;

	useConnection(req: UseConnectionRequest): Promise<void>;

	clearConnections(): Promise<void>;

	removeConnectionById(req: DeleteDbConnectionRequest): Promise<void>;

	findConnectionHistory(): Promise<FindConnectionHistoryResponse>;

	applyPendingMigrations(): Promise<ApplyPendingMigrationsResponse>;

	checkMigrations(): Promise<CheckMigrationsResponse>;

	updateMisc(path: string, value: unknown): Promise<AppConfigResponse>;

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
		{
			provide: CONFIG_SERVICE,
			useExisting: isDesktop() ? ElectronConfigService : WebConfigService
		}
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
