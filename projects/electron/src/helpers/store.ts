import { AppConfig, AppConfigPaths, AppPrefs } from '@civilio/shared';
import Store from 'electron-store';
const KEY = '83zoSRF8PhEsUbJFw0MPesKbTweu1qgJqDAvbAgkfjlhqu5xEZtBtdFfZEK1z6BF';

let store: Store<AppConfig>;

function assertStore() {
  store = store ?? createStore();
  return store;
}

function createStore() {
  return new Store<AppConfig>({
    encryptionKey: KEY,
    defaults: {
      prefs: { locale: 'en-CM', theme: 'system' } as AppPrefs
    }
  });
}

export function getStoreValue(path: AppConfigPaths) {
  try {
    const store = assertStore();
    return (store as any).get(path);
  } finally {
  }
}

export function storeValue(path: AppConfigPaths, value: unknown) {
  const store = assertStore();
  (store as any).set(path, value);
}
