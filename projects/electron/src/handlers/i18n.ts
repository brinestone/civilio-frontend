import { Locale } from "@civilio/shared";
import { readFile } from "fs/promises";
import { join } from "path";
import { parse } from 'yaml';

export async function findTranslationsFor(locale: Locale) {
  const path = join(__dirname, 'assets', 'i18n', `${locale.substring(0, 2)}.yml`);
  const yaml = await readFile(path, { encoding: 'utf-8' });
  return parse(yaml);
}
