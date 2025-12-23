import { ParsedLoginRequest } from "@civilio/shared";

export function saveUserCredntials({ }: ParsedLoginRequest) {

}
// export async function loginUser({ password, username }: ParsedLoginRequest) {
// 	const url = getStoreValue('api.baseUrl') as string;
// 	net.
// }
// export async function loginUser({ password, username }: ParsedLoginRequest) {
// 	const client = provideClient();
// 	const baseDn = getBaseDN();
// 	const filter = USER_FILTER_TEMPLATE.replace('{login}', username);

// 	const searchResult = await client.search(baseDn, {
// 		scope: 'sub',
// 		filter,
// 		attributes: ['cn', 'dn', 'uid']
// 	});

// 	if (!searchResult.searchEntries || searchResult.searchEntries.length == 0) {
// 		throw new UserAccountNotFoundError(username);
// 	}

// 	const userDN = searchResult.searchEntries[0].dn;
// 	await client.bind(userDN, password);

// 	saveCredentials(userDN, password);
// }

// export async function logoutUser() {
// 	await client.unbind();

// }

// function provideClient() {
// 	if (!client) {
// 		const { host, tls } = getLdapConfig();
// 		client = new Client({
// 			url: `ldap${tls ? 's' : ''}://${host}:${tls ? 636 : 389}`,
// 		});
// 		console.log('Loading credentials from store')
// 		const credentials = loadCredentials();
// 		if (credentials) {
// 			client.bind(credentials.username, credentials.password).then(() => console.log(`Credentials loaded from store`));
// 		} else {
// 			console.log('Credentials not found');
// 		}
// 	}
// 	return client;
// }

// function getBaseDN() {
// 	return getAppConfig().auth?.baseDn as string;
// }

// function getLdapConfig() {
// 	return getAppConfig().auth;
// }

// app.on('ready', () => {
// 	try {
// 		const _ = provideClient();
// 	} catch (e) {
// 		console.error(e);
// 	}
// })
