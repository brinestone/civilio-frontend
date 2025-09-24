import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { PublisherGithub } from '@electron-forge/publisher-github';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { existsSync } from 'fs';
import { cp, mkdir, readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';

async function isDir(path: string) {
  const stats = await stat(path);
  return stats.isDirectory();
}

const iconPath = "./assets/img/icon"; // No file extension
const iconIcoPath = './assets/img/icon.ico';
const iconPngPath = "./assets/img/icon.png";
const assetsDirs = [
  './dist/angular/',
  './assets'
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
            if (child == 'migrations') continue;
            const path = join(src, child);
            const dest = join(forgeDir, child);
            if (await isDir(path)) {
              await cp(path, dest, {
                recursive: true
              });
            }
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
    // Remove windowsSign if you don't have code signing certificates
    // windowsSign: true,
    extraResource: ['./dist/assets'],
    // Explicitly set the main entry point
    executableName: 'civilio'
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: iconIcoPath,
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        icon: iconPngPath,
      }
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
        name: 'civilio',
      },
      prerelease: true,
    })
  ]
};

export default config;
