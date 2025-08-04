import { writeFile, rename, appendFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { dirname, join, sep } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const url = new URL('/translate', 'https://ftapi.pythonanywhere.com');

async function translateValue(value, sourceLocale, targetLocales) {
    const result = new Map();
    for (const targetLocale of targetLocales) {
        if (targetLocale === sourceLocale) {
            result.set(targetLocale, value);
            console.debug(`Skipping translation for ${targetLocale} as it is the same as source locale ${sourceLocale}`);
            continue;
        }
        try {
            url.searchParams.set('text', value);
            url.searchParams.set('dl', targetLocale);

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
        }
    }
    return result;
}

async function clearFile(filePath) {
    try {
        if (existsSync(filePath)) {
            await rm(filePath, { force: true });
            await writeFile(filePath, '', 'utf-8');
            console.log(`Cleared file ${filePath}`);
        }
    } catch (e) { }
}

async function appendTranslationsToFile(filePath, translations) {
    try {
        await appendFile(filePath, translations, 'utf-8');
    } catch (e) {
        console.error(e);
    }
}

async function translateFile(filePath, sourceLocale, targetLocales) {
    targetLocales = targetLocales.filter(l => l !== sourceLocale);
    const segments = filePath.split(sep);
    const fileName = segments[segments.length - 1];
    const prefix = fileName.substring(0, fileName.indexOf('.'));
    const suffix = fileName.substring(fileName.indexOf('.'));
    try {
        if (!existsSync(filePath)) {
            console.error(`File ${filePath} does not exist.`);
            process.exit(1);
        }
        console.log(`Translating file ${filePath} from ${sourceLocale} to ${targetLocales.join(', ')}`);
        for (const targetLocale of targetLocales) {
            const targetFilePath = join(dirname(filePath), `${prefix}_${targetLocale}${suffix}`);
            if (existsSync(targetFilePath)) {
                console.log(`Backing up existing translation file for target locale: ${targetLocale}`)
                const backupFilePath = targetFilePath + '.' + Date.now() + '.bak';
                await rename(targetFilePath, backupFilePath)
                    .then(() => console.log(`Backup created at ${backupFilePath}`));
                await clearFile(targetFilePath);
                console.log(`Cleared existing translation files for target locales: ${targetLocales.join(', ')}`);
            }
        }
        for await (const line of streamLines(filePath)) {
            const [key, value] = line.split('=');
            if (!key || !value) {
                console.warn(`Skipping invalid line: ${line}`);
                continue;
            }
            const trimmedKey = key.trim();
            const trimmedValue = value.trim();
            const translatedValues = await translateValue(trimmedValue, sourceLocale, targetLocales);
            for (const [targetLocale, translatedValue] of translatedValues.entries()) {
                const entry = `${trimmedKey}=${translatedValue}`;
                await appendTranslationsToFile(join(dirname(filePath), `${prefix}_${targetLocale}.properties`), entry + '\n');
            }
        }
        console.log('Translation completed successfully.');
    } catch (e) {
        console.error(`Error reading file ${filePath}:`, e);
    }
}

async function* streamLines(filePath) {
    let stream, reader;
    try {
        stream = createReadStream(filePath, { encoding: 'utf-8' });
        reader = createInterface({
            input: stream,
            crlfDelay: Infinity,
        });

        for await (const line of reader) {
            if (line.trim().length === 0 || line.startsWith('#')) {
                continue; // Skip empty lines and comments
            }
            yield line;
        }
    } catch (e) {
        console.error(`Error opening file ${filePath}:`, e);
        throw e;
    } finally {
        if (reader) {
            reader.close();
        }
        if (stream) {
            stream.close();
        }
    }
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: translate.mjs <source_locale> <target_locale1> [<target_locale2> ...]');
    process.exit(1);
}

const [srcLocale, ...targetLocales] = args.slice();
if (targetLocales.length === 0) {
    console.error('No target locales provided.');
    process.exit(1);
}

function isValidLocale(locale) {
    // ISO 639-1: two lowercase letters, optionally followed by a dash and two uppercase letters (region)
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(locale);
}

const invalidLocales = args.filter(l => !isValidLocale(l));
if (invalidLocales.length > 0) {
    console.error(`Invalid locale(s) detected: ${invalidLocales.join(', ')}. Locales must be in ISO 639 format (e.g., "en", "fr", "es", "de", "en-US").`);
    process.exit(1);
}

let fileName = 'messages.properties';
if (!srcLocale.startsWith('en')) {
    fileName = `messages_${srcLocale}.properties`;
}
translateFile(join(import.meta.dirname, 'src', 'main', 'resources', fileName), srcLocale, targetLocales);