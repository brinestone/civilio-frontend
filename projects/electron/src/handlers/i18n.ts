import { Locale } from "@civilio/shared";
import { app } from "electron";
import { readFile, watch } from "fs/promises";
import { join, resolve } from "path";
import { parse } from 'yaml';

export async function findTranslationsFor(locale: Locale) {
  const path = !app.isPackaged ? resolve(join(__dirname, '..', 'assets', 'i18n', `${locale.substring(0, 2)}.yml`)) :
    join(app.getPath('assets'), 'resources', 'assets', 'i18n', `${locale.substring(0, 2)}.yml`);
  const yaml = await readFile(path, { encoding: 'utf-8' });
  return parse(yaml);
}

/**
 * Watches the assets files and notifying if changed. Should be used in development only
 */
export async function watchAssets() {
  const path = !app.isPackaged ? resolve(join(__dirname, '..', 'assets', 'i18n')) : '';
  const { signal, abort } = new AbortController();

  process.on('SIGINT', abort);
  process.on('SIGKILL', abort);
  process.on('SIGHUP', abort);

  return watch(path, { signal });
}
