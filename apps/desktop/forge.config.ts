import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'RestaurantPOS',
    productName: 'Restaurant POS',
    asar: false,
    extraResource: [
      '../../apps/api/dist',
      '../../apps/api/src/generated',
      '../../apps/api/prisma',
      '../../apps/api/node_modules',
      '../../apps/web/.next/standalone',
      '../../apps/web/public',
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'RestaurantPOS',
      setupExe: 'RestaurantPOS-Setup.exe',
    }),
    new MakerZIP({}, ['darwin', 'linux']),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: `default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3001 http://localhost:3000 http://127.0.0.1:3001 http://127.0.0.1:3000; connect-src 'self' http://localhost:3001 http://localhost:3000 http://127.0.0.1:3001 http://127.0.0.1:3000`,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: { js: './src/preload.ts' },
          },
        ],
      },
      port: 3100,
      loggerPort: 9001,
    }),
  ],
};

export default config;
