export function readVersion(contents) {
    const versionMatch = contents.match(/version\s*=\s*["']([^"']+)["']/);
    if (versionMatch) {
        return versionMatch[1];
    }
    throw new Error("Version not found in the file.");
}

export function writeVersion(contents, version) {
    const newContents = contents.replace(/version\s*=\s*["'][^"']+["']/m, `version = "${version}"`);
    return newContents;
}