import { Injectable } from '@angular/core';
import {
	AppConfigPaths,
	AppConfigResponse,
	AppConfigSchema,
	CheckMigrationsResponse,
	DbConfig,
	DiscoverServerResponse,
	FindConnectionHistoryResponse,
	Locale,
	TestDbConnectionRequest,
	TestDbConnectionResponseSchema,
	ThemeMode
} from '@civilio/shared';
import { sendRpcMessageAsync } from '@app/util';
import { ConfigService } from '../config';

@Injectable({
	providedIn: null
})
export class ElectronConfigService implements ConfigService {
	async setServerUrl(url: string): Promise<AppConfigResponse> {
		return await sendRpcMessageAsync('config:update', {
			path: 'apiServer.baseUrl' as AppConfigPaths,
			value: url
		})
	}
	async discoverServer(): Promise<DiscoverServerResponse> {
		return await sendRpcMessageAsync('discovery:init');
	}

	async useConnection(id: number): Promise<void> {
		return await sendRpcMessageAsync('db-conn:use', id);
	}

	async clearConnections(): Promise<void> {
		return await sendRpcMessageAsync('db-conn:clear');
	}

	async removeConnectionById(id: number): Promise<void> {
		return await sendRpcMessageAsync('db-conn:delete', id);
	}

	async findConnectionHistory(): Promise<FindConnectionHistoryResponse> {
		return await sendRpcMessageAsync('db-conns:read');
	}

	async applyPendingMigrations() {
		return await sendRpcMessageAsync('migrations:apply', undefined, 1000000)
	}

	checkMigrations(): Promise<CheckMigrationsResponse> {
		return sendRpcMessageAsync('migrations:check',)
	}

	async updateMisc(path: string, value: unknown): Promise<AppConfigResponse> {
		return await sendRpcMessageAsync('config:update', {
			path: `${ 'misc' as AppConfigPaths }.${ path }`,
			value
		})
	}

	async setFontSize(size: number): Promise<AppConfigResponse> {
		return await sendRpcMessageAsync('config:update', {
			path: 'prefs.fontSize' as AppConfigPaths,
			value: size
		});
	}

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
		return await sendRpcMessageAsync('locale:update', { locale }).then(AppConfigSchema.parse);
	}

	async setTheme(theme: ThemeMode) {
		return await sendRpcMessageAsync('theme:update', { theme }).then(AppConfigSchema.parse);
	}

	async loadConfig() {
		const result = await sendRpcMessageAsync('config:read');
		return AppConfigSchema.parse(result);
	}
}
