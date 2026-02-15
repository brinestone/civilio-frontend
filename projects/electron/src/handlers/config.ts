import { getStoreValue, storeValue } from "@civilio/helpers/store";
import {
	AppConfigSchema,
	BuildInfoSchema,
	DiscoverServerResponse,
	DiscoverServerResponseSchema,
	Locale,
	ThemeMode
} from "@civilio/shared";
import { app, nativeTheme } from "electron";
import z from "zod";
import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import { provideLogger } from '@civilio/helpers/logging';
import { createSocket } from 'node:dgram';

const logger = provideLogger('config');

export async function discoverServer() {
	const port = 5534;
	const clientKey = 'g8eULU5uY6u1ZQSuGTUeDQABLgArt2yOTDKJ0AB1Y13GYCHt6Hkj7Q0qsUGWtRqS';

	return await new Promise<DiscoverServerResponse>((resolve, reject) => {
		const client = createSocket('udp4');
		client.once('message', (msg, rinfo) => {
			try {
				const serverData = JSON.parse(msg.toString());
				logger.info(`Found server at ${ serverData.baseUrl } via ${ rinfo.address }`);
				const response = DiscoverServerResponseSchema.parse(serverData);
				resolve(response);
				storeValue('apiServer', response)
			} catch (e) {
				logger.error(e);
				reject(e);
			}
		});
		client.bind(() => {
			client.setBroadcast(true);
			const message = Buffer.from(JSON.stringify({ c: `DISCOVER=${ clientKey }` }));

			client.send(message, port, '255.255.255.255', err => {
				if (err) {
					logger.error(err);
					reject(err);
					return;
				}
				logger.info('Discovery broadcast sent');
			});
		});
	});
}

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
