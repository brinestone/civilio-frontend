import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'node:fs';
import { open, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateValue(value, sourceLocale, targetLocales) {
    const result = new Map();
    for (const targetLocale of targetLocales) {
        if (targetLocale === sourceLocale) {
            result.set(targetLocale, value);
            console.debug(`Skipping translation for ${targetLocale} as it is the same as source locale ${sourceLocale}`);
            continue;
        }
        try {
            const url = new URL('/translate', 'https://ftapi.pythonanywhere.com');
            url.searchParams.append('text', value);
            url.searchParams.append('dl', targetLocale);

            const response = await fetch(url).then(res => res.json());
            let translatedText;
            try {
                translatedText = decodeURIComponent(response['destination-text'] || '');
            } catch (_) {
                translatedText = response['destination-text'] || '';
            }
            result.set(targetLocale, translatedText);
            console.debug(`Translated "${value}" from ${sourceLocale} to ${targetLocale}:`, translatedText);
            await sleep(1000); // Sleep for 1 second to avoid rate limiting
        } catch (e) {
            console.error(`Error translating value "${value}" from ${sourceLocale} to ${targetLocale}:`, e);
            result.set(targetLocale, '');
            continue;
        }
    }
    return result;
}

async function writeTranslationsTofile(filePath, translations, backupExisting = true) {
    try {
        const fileContent = translations;
        if (existsSync(filePath) && backupExisting) {
            const backupFilePath = filePath + '.' + Date.now() + '.bak';
            await rename(filePath, backupFilePath)
                .then(() => console.log(`Backup created at ${backupFilePath}`));
        }
        await writeFile(filePath, fileContent, 'utf-8');
        console.log(`${translations.length} translations written to ${filePath}`);
    } catch (e) {
        console.error(e);
    }
}

async function translateFile(filePath, sourceLocale, targetLocales) {
    targetLocales = targetLocales.filter(l => l !== sourceLocale);
    try {
        const fileContent = await readFile(filePath);
        const content = fileContent.toString('utf-8').split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#'));
        const translations = content.map(line => {
            const [key, value] = line.split('=');
            return { key: key.trim(), value: value ? value.trim() : '' };
        }).filter(({ value }) => value.length > 0);

        const translationsMap = new Map(translations.map(({ key, value }) => [key, value]));
        const resultMap = new Map();
        for (const [key, value] of translationsMap.entries()) {
            const translatedValues = await translateValue(value, sourceLocale, targetLocales);
            for (const [targetLocale, translatedValue] of translatedValues.entries()) {
                const entry = `${key}=${translatedValue}`;
                if (!resultMap.has(targetLocale)) {
                    resultMap.set(targetLocale, []);
                }
                resultMap.get(targetLocale).push(entry);
            }
        }

        for (const [key, value] of resultMap.entries()) {
            await writeTranslationsTofile(join(dirname(filePath), `messages_${key}.properties`), value.join('\n'));
        }
    } catch (e) {
        console.error(`Error reading file ${filePath}:`, e);
        return;
    }
}

async function openFile(filePath) {
    let cursor = 0;
    let buffer = Buffer.alloc(1024);
    try {
        const handle = await open(filePath);
        return async function* () {
            handle.readFile({})
        }
    } catch (e) {
        console.error(`Error opening file ${filePath}:`, e);
        throw e;
    }
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: translate.mjs <target_locale1> [<target_locale2> ...]');
    process.exit(1);
}

const [...targetLocales] = args;
if (targetLocales.length === 0) {
    console.error('No target locales provided.');
    process.exit(1);
}

function isValidLocale(locale) {
    // ISO 639-1: two lowercase letters, optionally followed by a dash and two uppercase letters (region)
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(locale);
}

const invalidLocales = targetLocales.filter(l => !isValidLocale(l));
if (invalidLocales.length > 0) {
    console.error(`Invalid locale(s) detected: ${invalidLocales.join(', ')}. Locales must be in ISO 639 format (e.g., "en", "fr", "es", "de", "en-US").`);
    process.exit(1);
}
translateFile(join(import.meta.dirname, 'src', 'main', 'resources', 'messages.properties'), 'en', targetLocales);