import { Locale } from "@civilio/shared";
import { app } from "electron";
import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { parse } from 'yaml';

export async function findTranslationsFor(locale: Locale) {
  const path = !app.isPackaged ? resolve(join(__dirname, '..', 'assets', 'i18n', `${locale.substring(0, 2)}.yml`)) : '';
  const yaml = await readFile(path, { encoding: 'utf-8' });
  return parse(yaml);
}
