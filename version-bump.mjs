/**
 * Utility functions for reading and writing version strings in file contents.
 * 
 * @module version-bump
 */

/**
 * Reads the version string from the given file contents.
 *
 * Searches for a line matching the pattern: version = "x.y.z"
 *
 * @param {string} contents - The file contents as a string.
 * @returns {string} The extracted version string.
 * @throws {Error} If the version string is not found in the contents.
 */
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