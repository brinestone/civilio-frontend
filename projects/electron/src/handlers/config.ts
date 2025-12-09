import { getStoreValue, storeValue } from "@civilio/helpers/store";
import {
	AppConfigSchema,
	BuildInfoSchema,
	Locale,
	ThemeMode
} from "@civilio/shared";
import { app, nativeTheme } from "electron";
import z from "zod";
import { join, resolve } from 'path';
import { readFileSync } from 'fs';

export function getBuildInfo() {
	const manifestPath = app.isPackaged ? join(app.getPath('assets'), 'resources', 'assets', 'build.json') : resolve(join(__dirname, '..', 'assets', 'build.json'));
	const parsed = JSON.parse(readFileSync(manifestPath).toString('utf8'))
	return BuildInfoSchema.parse(parsed);
}

export function getAppConfig() {
	const keys = z.keyof(AppConfigSchema.unwrap()).options;
	const map: any = {};
	keys.forEach(k => map[k] = getStoreValue(k));
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
