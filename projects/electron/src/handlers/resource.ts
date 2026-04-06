import { app } from "electron";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { lookup } from 'mime-types';
import { join, resolve } from "path";
import { ThirdPartyLicence } from '@civilio/shared';

export async function getLicences() {
	const filePath = app.isPackaged ? join(app.getPath('assets'), 'resources', 'assets', '3rdpartylicenses.txt') : resolve(join(__dirname, '..', 'assets', '3rdpartylicenses.txt'));
	if (!existsSync(filePath)) {
		return [];
	}

	const content = await readFile(filePath, 'utf8');
	const entries = content.split(/^-{79,}\s*$/m).filter(e => e.trim().length > 0);
	const licenses: ThirdPartyLicence[] = [];
	for (const entry of entries) {
		const lines = entry.trim().split('\n');
		const packageLine = lines.find(l => l.startsWith('Package:'));
		const licenseTypeLine = lines.find(line => line.startsWith('License:'));
		const packageName = packageLine ? packageLine.replace('Package:', '').trim() : 'N/A';
		const licenseType = licenseTypeLine ? licenseTypeLine.replace('License:', '').replace(/"/g, '').trim() : 'N/A';
		const licenseTextLines = lines.filter(line =>
			!line.startsWith('Package:') &&
			!line.startsWith('License:') &&
			line.trim().length > 0
		);
		const licenseText = licenseTextLines.join('\n').trim();
		licenses.push({
			package: packageName,
			licenceType: licenseType,
			licenceText: licenseText,
		});
	}
	return licenses;
}

export async function getResourceUrl(fileName: string) {
	const filePath = app.isPackaged ? join(app.getPath('assets'), 'resources', 'assets', fileName) : resolve(join(__dirname, '..', 'assets', fileName));
	if (!existsSync(filePath)) {
		return null;
	}
	const base64 = await readFile(filePath, 'base64');
	const mimeType = lookup(filePath);
	if (!mimeType) return null;

	return `data:${ mimeType };base64,${ base64 }`;
}
