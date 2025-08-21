import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const file = join(import.meta.dirname, 'build.gradle.kts');
async function updateVersion() {
    try {
        const projectInfo = await readFile('package.json', 'utf8');
        const { version } = JSON.parse(projectInfo);

        const buildGradleContent = await readFile(file, 'utf8');
        const updatedContent = buildGradleContent.replace(/^\s*version\s*=\s*".*"/m, `version = "${version}"`);
        await writeFile(file, updatedContent, 'utf8');
        console.log(`Updated version to ${version} in build.gradle.kts`);
    } catch (e) {
        console.error('Error reading version:', e);
        throw e;
    }
}

updateVersion();