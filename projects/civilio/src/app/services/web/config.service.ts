import {
	AppConfigResponse,
	ApplyPendingMigrationsResponse,
	CheckMigrationsResponse,
	DbConfig,
	FindConnectionHistoryResponse,
	Locale,
	TestDbConnectionRequest,
	TestDbConnectionResponse,
	ThemeMode
} from "@civilio/shared";
import { ConfigService } from "../config";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: null
})
export class WebConfigService implements ConfigService {
	useConnection(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	clearConnections(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	removeConnectionById(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	findConnectionHistory(): Promise<FindConnectionHistoryResponse> {
		throw new Error("Method not implemented.");
	}

	applyPendingMigrations(): Promise<ApplyPendingMigrationsResponse> {
		throw new Error("Method not implemented.");
	}

	checkMigrations(): Promise<CheckMigrationsResponse> {
		throw new Error("Method not implemented.");
	}

	updateMisc(path: string, value: unknown): Promise<AppConfigResponse> {
		throw new Error("Method not implemented.");
	}

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
