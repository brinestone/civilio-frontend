import { EncryptionUnavailableError, ParsedLoginRequest, pause, ServiceEventPayload, UserAccountNotFoundError } from '@civilio/shared';
import { app, safeStorage } from 'electron';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { Client } from 'ldapts';
import { join } from 'path';
import { getAppConfig } from './config';

const USER_FILTER_TEMPLATE = '(&(objectClass=inetOrgPerson)(|(uid={login})(mail={login})))';
const credentialsPath = join(app.getPath('userData'), 'credentials.enc');

let client: Client;

export async function* watchLdap() {
	let isOnline = true;
	while (true) {
		isOnline = client?.isConnected ?? false;
		yield { service: 'LDAP Server', status: isOnline ? 'Online' : 'Offline', details: isOnline ? undefined : 'Authentication endpoint unreachable' } as ServiceEventPayload;

		await pause(10000);
	}
}

function saveCredentials(username: string, password: string) {
	if (safeStorage.isEncryptionAvailable()) {
		throw new EncryptionUnavailableError();
	}

	const encrypted = safeStorage.encryptString(JSON.stringify({ username, password }));
	writeFileSync(credentialsPath, encrypted);
}

function loadCredentials() {
	if (safeStorage.isEncryptionAvailable()) {
		throw new EncryptionUnavailableError();
	}

	if (!existsSync(credentialsPath)) return null;
	const encrypted = readFileSync(credentialsPath);
	return JSON.parse(safeStorage.decryptString(encrypted)) as { username: string; password: string };
}

function clearCredentials() {
	if (!existsSync(credentialsPath)) return;
	rmSync(credentialsPath);
}

export async function loginUser({ password, username }: ParsedLoginRequest) {
	const client = provideClient();
	const baseDn = getBaseDN();
	const filter = USER_FILTER_TEMPLATE.replace('{login}', username);

	const searchResult = await client.search(baseDn, {
		scope: 'sub',
		filter,
		attributes: ['cn', 'dn', 'uid']
	});

	if (!searchResult.searchEntries || searchResult.searchEntries.length == 0) {
		throw new UserAccountNotFoundError(username);
	}

	const userDN = searchResult.searchEntries[0].dn;
	await client.bind(userDN, password);

	saveCredentials(userDN, password);
}

export async function logoutUser() {
	await client.unbind();

}

function provideClient() {
	if (!client) {
		const { host, tls } = getLdapConfig();
		client = new Client({
			url: `ldap${tls ? 's' : ''}://${host}:${tls ? 636 : 389}`,
		});
		console.log('Loading credentials from store')
		const credentials = loadCredentials();
		if (credentials) {
			client.bind(credentials.username, credentials.password).then(() => console.log(`Credentials loaded from store`));
		} else {
			console.log('Credentials not found');
		}
	}
	return client;
}

function getBaseDN() {
	return getAppConfig().auth?.baseDn as string;
}

function getLdapConfig() {
	return getAppConfig().auth;
}

app.on('ready', () => {
	try {
		const _ = provideClient();
	} catch (e) {
		console.error(e);
	}
})
