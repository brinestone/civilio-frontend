import { AppConfig, CheckMigrationsResponse, DbConnectionRef, UserPrincipal } from "@civilio/shared";
import { StateToken } from "@ngxs/store";

export type AuthStateModel = {
	credentialsSaved: boolean;
	principal?: UserPrincipal;
};

export type ConfigStateModel = {
	config?: AppConfig;
	knownConnections: DbConnectionRef[];
	env: 'desktop' | 'web';
	migrationState?: CheckMigrationsResponse;
	preInit: boolean;
	connectionsLoaded: boolean;
	serverOnline: boolean;
}
export const AUTH_STATE = new StateToken<AuthStateModel>('auth');
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');
