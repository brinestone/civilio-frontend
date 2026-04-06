import { MakerDeb } from '@electron-forge/maker-deb';
import MakerSquirrel from '@electron-forge/maker-squirrel';
import MakerWix from '@electron-forge/maker-wix';
import { MakerZIP } from '@electron-forge/maker-zip';
import {
	AutoUnpackNativesPlugin
} from '@electron-forge/plugin-auto-unpack-natives';
import { PublisherGithub } from '@electron-forge/publisher-github';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { existsSync } from 'fs';
import { cp, mkdir, readdir } from 'fs/promises';
import { join, resolve } from 'path';

const iconIcnsPath = "./assets/img/icon.icns"
const iconPath = "./assets/img/icon"; // No file extension
const iconIcoPath = './assets/img/icon.ico';
const iconPngPath = "./assets/img/icon.png";
const assetsDirs = [
	'./dist/angular/',
	'./assets',
	'./projects/electron/assets/migrations'
];

const config: ForgeConfig = {
	hooks: {
		generateAssets: async ({ outDir }) => {
			const forgeDir = join(outDir ?? './dist', 'assets');
			if (!existsSync(forgeDir)) await mkdir(forgeDir, { recursive: true });
			for (const p of assetsDirs) {
				if (!existsSync(p)) continue;
				try {
					const src = resolve(process.cwd(), p);
					const children = await readdir(src);
					for (const child of children) {
						if (child == 'meta') continue;
						const path = join(src, child);
						const dest = join(forgeDir, child);
						// if (await isDir(path)) {
						await cp(path, dest, {
							recursive: true
						});
						// }
					}
				} catch (e) {
					console.error(e);
					throw e;
				}
			}
		}
	},
	packagerConfig: {
		asar: true,
		icon: iconPath,
		executableName: 'civilio',
		// Remove windowsSign if you don't have code signing certificates
		// windowsSign: true,
		extraResource: ['./dist/assets'],
	},
	rebuildConfig: {},
	makers: [
		// new MakerDMG({
		// 	icon: iconPath + '.icns'
		// }),
		new MakerZIP({}),
		new MakerSquirrel({
			// CamelCase version without spaces
			name: "civilio",
			setupIcon: iconIcoPath
		}),
		new MakerWix({
			icon: iconIcoPath,
			features: {
				autoUpdate: true,
				autoLaunch: false
			},
			defaultInstallMode: 'perUser',
			shortcutName: 'CivilIO',
			programFilesFolderName: 'CivilIO',
			language: 1033,
		}),
		new MakerDeb({
			options: {
				icon: iconPngPath
			}
		})
	],
	plugins: [
		new AutoUnpackNativesPlugin({}),
	],
	publishers: [
		new PublisherGithub({
			repository: {
				owner: 'brinestone',
				name: 'civilio-frontend',
			},
			prerelease: true,
		})
	]
};

export default config;
