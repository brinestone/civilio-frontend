import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { PublisherGithub } from '@electron-forge/publisher-github';
import type { ForgeConfig } from '@electron-forge/shared-types';

const iconPngPath = "./projects/electron/assets/icon.png";
const iconIcoPath = './projects/electron/assets/icon.ico';
const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  outDir: './out',
  makers: [
    new MakerSquirrel({
      setupIcon: iconIcoPath,
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
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
