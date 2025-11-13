import { getStoreValue, storeValue } from "@civilio/helpers/store";
import { AppConfigPaths, AppConfigSchema, Locale, ThemeMode } from "@civilio/shared";
import { nativeTheme } from "electron";
import { unset } from 'lodash';
import z from "zod";

export function getAppConfig(includeSecrets = false) {
	const secretKeys = [
		'db.password'
	] as AppConfigPaths[];

	const keys = z.keyof(AppConfigSchema.unwrap()).options;
	const map: any = {};
	keys.forEach(k => map[k] = getStoreValue(k));

	if (!includeSecrets) {
		secretKeys.forEach(k => unset(map, k));
	}
	return AppConfigSchema.parse(map);
}

export function updateTheme(theme: ThemeMode) {
	storeValue('prefs.theme', theme);
	nativeTheme.themeSource = theme;
	return getAppConfig();
}

export function updateLocale(locale: Locale) {
	storeValue('prefs.locale', locale);
	return getAppConfig();
}
