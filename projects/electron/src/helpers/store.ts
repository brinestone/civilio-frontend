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
  console.time('store::read');
  console.debug('reading value in store at: ' + path);
  try {
    const store = assertStore();
    return (store as any).get(path);
  } finally {
    console.timeEnd('store::read');
  }
}

export function storeValue(path: AppConfigPaths, value: unknown) {
  console.time('store::write');
  console.debug('storing value in store at: ' + path);
  const store = assertStore();
  (store as any).set(path, value);
  console.timeEnd('store::read');
}
