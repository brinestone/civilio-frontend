import { clearStoredCredentials, getStoredCredentials, storeCredentials } from "@civilio/helpers/store";
import { LoginRequest, LoginRequestSchema } from "@civilio/shared";
import { safeStorage } from "electron";

const key = 'g8eULU5uY6u1ZQSuGTUeDQABLgArt2yOTDKJ0AB1Y13GYCHt6Hkj7Q0qsUGWtRqS';

export function clearCredentials() {
	clearStoredCredentials();
}

export function saveUserCredntials(creds: LoginRequest) {
	if (!safeStorage.isEncryptionAvailable()) {
		safeStorage.setUsePlainTextEncryption(true)
	}

	const encrypted = safeStorage.encryptString(JSON.stringify(creds));
	storeCredentials(encrypted.toString('utf8'));
}

export function getUserCredentials() {
	const encrypted = getStoredCredentials();
	if (encrypted) {
		const json = safeStorage.decryptString(Buffer.from(encrypted));
		return LoginRequestSchema.parse(JSON.parse(json));
	}
	return null;
}
