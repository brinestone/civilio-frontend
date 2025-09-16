import { AppConfig } from '@civilio/shared';
import Prefs from 'preferences';
const KEY = '83zoSRF8PhEsUbJFw0MPesKbTweu1qgJqDAvbAgkfjlhqu5xEZtBtdFfZEK1z6BF';

export type AppPrefs = AppConfig & { save: () => void; clear: () => void; }
let prefs: AppPrefs;

function createStore() {
  const prefs = new Prefs(KEY, {}, {
    format: 'yaml',
    encrypt: true,
  });
  return prefs;
}

export function usePrefs() {
  prefs = prefs ?? createStore() as AppPrefs;
  return prefs;
}
