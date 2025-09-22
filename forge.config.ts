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
  './dist/civilio/',
  './assets'
] as const;

const config: ForgeConfig = {
  hooks: {
    generateAssets: async ({ outDir }) => {
      const forgeDir = join(outDir ?? './out', 'assets');
      if (!existsSync(forgeDir)) await mkdir(forgeDir);
      for (const p of assetsDirs) {
        if (!existsSync(p)) continue;
        try {
          const src = resolve(process.cwd(), p);
          // const dir = basename(src);

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
    extraResource: [
      ...assetsDirs
    ],
    icon: iconPath, // This is the fix!
  },
  outDir: './dist',
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
