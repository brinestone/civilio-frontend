import {writeFile, rename, appendFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {dirname, join, sep} from 'node:path';
import {createReadStream, existsSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';

const database = new DatabaseSync(join(import.meta.dirname, 'temp.db'));

async function prepareDatabase() {
    if (!database.isOpen) database.open();
    // setup translation table
    // language=SQLite
    database.exec(`
        CREATE TABLE IF NOT EXISTS translations
        (
            key         TEXT NOT NULL,
            digest      TEXT NOT NULL,
            src_locale  TEXT NOT NULL,
            src_value   TEXT NOT NULL,
            dest_locale TEXT NOT NULL,
            dest_value  TEXT NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS translation_key_src_locale_dest_locale_idx_uq ON translations (key, src_locale, dest_locale);
    `);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const url = new URL('/translate', 'https://ftapi.pythonanywhere.com');

async function translateValue(value, sourceLocale, targetLocales) {
    const result = new Map();
    const digest = computeDigest(value);
    let localesCopy = [...targetLocales];
    const cachedTranslations = await findTranslationsByDigest(digest, localesCopy);
    if (cachedTranslations.length > 0) {
        for (const {dest_locale, dest_value} of cachedTranslations) {
            if (localesCopy.includes(dest_locale)) {
                localesCopy = localesCopy.filter(v => v !== dest_locale);
                result.set(dest_locale, dest_value);
            }
        }
        if (localesCopy.length === 0) return result;
    }

    for (const targetLocale of localesCopy) {
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
            await rm(filePath, {force: true});
            await writeFile(filePath, '', 'utf-8');
            console.log(`Cleared file ${filePath}`);
        }
    } catch (e) {
    }
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
    const prefix = fileName.substring(0, fileName.lastIndexOf("_.") > 0 ? fileName.lastIndexOf('_.') : fileName.lastIndexOf('.'));
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
            const [key, value] = line.split('=', 2);
            if (!key || !value) {
                console.warn(`Skipping invalid line: ${line}`);
                continue;
            }
            const trimmedKey = key.trim();
            const trimmedValue = value.trim();
            const existingDigest = await findExistingDigestFor(trimmedKey, srcLocale);
            const currentDigest = computeDigest(trimmedValue);
            let cacheHit = existingDigest === currentDigest;
            let targetLocalesCopy = [...targetLocales];
            const existingTranslations = await findExistingTranslationsFor(trimmedKey, srcLocale);
            if (cacheHit && existingTranslations.length > 0)
                targetLocalesCopy = targetLocalesCopy.filter(t => existingTranslations.find(({dest_locale}) => dest_locale !== t) !== undefined);
            let translatedValues;
            if (cacheHit && existingTranslations.length > 0 && targetLocalesCopy.length === 0) {
                cacheHit = true;
                translatedValues = new Map();
                existingTranslations.forEach(({dest_locale, dest_value}) => {
                    translatedValues.set(dest_locale, dest_value);
                });
            } else
                translatedValues = await translateValue(trimmedValue, sourceLocale, targetLocalesCopy);
            for (const [targetLocale, translatedValue] of translatedValues.entries()) {
                if (translatedValue) {
                    await cacheTranslationsFor(trimmedKey, srcLocale, trimmedValue, targetLocale, translatedValue);
                }
                const entry = `${trimmedKey}=${translatedValue}`;
                await appendTranslationsToFile(join(dirname(filePath), `${prefix}_${targetLocale}.properties`), entry + '\n');
            }
        }
        console.log('Translation completed successfully.');
    } catch (e) {
        console.error(`Error reading file ${filePath}:`, e);
    }
}

function computeDigest(v) {
    const cipher = createHash('md5');
    return cipher.update(v).digest('hex');
}


async function findTranslationsByDigest(digest, destLocales) {
    return new Promise(async (resolve, reject) => {
        try {
            const query = database.prepare(`
                SELECT dest_locale, dest_value FROM translations WHERE src_digest = :digest AND dest_locale IN (${destLocales.map(v => `'${v}'`).join(',')});
            `);
            const result = query.all({
                digest
            });
            resolve(result);
        } catch (e) {
            reject(e);
        }
    })
}

async function cacheTranslationsFor(key, srcLocale, srcValue, destLocale, destValue) {
    return new Promise(async (resolve, reject) => {
        try {
            await database.exec('BEGIN TRANSACTION;');
            // language=sqlite
            const query = database.prepare(`
                INSERT INTO translations (key, dest_locale, dest_value, src_locale, src_value, src_digest)
                VALUES (:key, :destLocale, :destValue, :srcLocale, :srcValue, :srcDigest)
                ON CONFLICT (key, src_locale, dest_locale) DO UPDATE SET src_value  = excluded.src_value,
                                                                         dest_value = excluded.dest_value,
                                                                         src_digest = excluded.src_digest;
            `);
            query.run({
                key,
                destLocale,
                destValue,
                srcLocale,
                srcValue,
                srcDigest: computeDigest(srcValue)
            });
            await database.exec('COMMIT;');
            resolve();
        } catch (e) {
            reject(e);
            await database.exec('ROLLBACK;');
        }
    })
}

async function findExistingDigestFor(key, srcLocale) {
    return new Promise(async (resolve, reject) => {
        const query = database.prepare(`
            SELECT src_digest FROM translations WHERE key = :key AND src_locale = :locale LIMIT 1;
        `);
        try {
            const [result] = query.all({
                key, locale: srcLocale
            });
            resolve(result?.src_digest);
        } catch (e) {
            reject(e);
        }
    })
}

async function findExistingTranslationsFor(key, srcLocale) {
    return new Promise((resolve, reject) => {
        // language=sqlite
        const query = database.prepare(`
            SELECT dest_locale, dest_value
            FROM translations
            WHERE src_locale = :srcLocale
              AND key = :key;
        `);
        try {
            const result = query.all({
                key,
                srcLocale
            });
            resolve(result);
        } catch (e) {
            reject(e);
        }
    })
}

async function* streamLines(filePath) {
    let stream, reader;
    try {
        stream = createReadStream(filePath, {encoding: 'utf-8'});
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

const start = Date.now();
prepareDatabase()
    .then(() => console.log('prepared database'));
translateFile(join(import.meta.dirname, 'src', 'main', 'resources', fileName), srcLocale, targetLocales)
    .catch(e => console.error(e))
    .finally(() => {
        database.close();
        console.log('database connection closed');
        const stop = Date.now();
        const diff = (stop - start) / 1000;
        console.log(`translation took ${diff} seconds`);
    });