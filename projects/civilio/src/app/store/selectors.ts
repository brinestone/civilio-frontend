import { Locale } from "@civilio/shared";
import { createPropertySelectors, createSelector } from "@ngxs/store";
import { get } from "lodash";
import { CONFIG_STATE } from "./config";

const configSlices = createPropertySelectors(CONFIG_STATE);

export const currentTheme = createSelector([configSlices.config], (config) => {
	return config?.prefs?.theme ?? "system";
});
export const currentLocale = createSelector([configSlices.config], (config) => {
	return config?.prefs?.locale ?? (navigator.language as Locale);
});


export function miscConfig<T = unknown>(path: string) {
	return createSelector([configSlices.config], (config) => {
		return get(config?.misc, path) as T | undefined;
	})
}

export const fontSize = createSelector([configSlices.config], (cfg) => {
	return cfg?.prefs?.fontSize ?? 16;
});

export const migrationNeeded = createSelector([configSlices.migrationState], m => m?.needsMigration === true);
export const dbConfig = createSelector([configSlices.knownConnections], (c) => {
	return c.find(d => d.inUse);
});
export const hasConfiguredConnection = createSelector([configSlices.knownConnections], c => c.some(x => x.inUse))
export const connections = configSlices.knownConnections;
export const preInit = configSlices.preInit;
export const apiInfo = createSelector([configSlices.config], c => {
	return c?.apiServer;
});
export const apiUrl = createSelector([apiInfo], info => {
	return info ? info.baseUrl : '';
});
export const machineId = createSelector([configSlices.machineId], id => id ?? '');
export const apiOrigin = createSelector([apiUrl], url => {
	if (url == '') return '';
	return new URL(url).origin;
});
export const uploadUrl = createSelector([apiOrigin], url => `${url}/upload`);
