import { AppConfig, CheckMigrationsResponse, DbConnectionRef } from "@civilio/shared";
import { StateToken } from "@ngxs/store";

export type ConfigStateModel = {
	config?: AppConfig;
	knownConnections: DbConnectionRef[];
	env: 'desktop' | 'web';
	migrationState?: CheckMigrationsResponse;
	preInit: boolean;
	connectionsLoaded: boolean;
}
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');
