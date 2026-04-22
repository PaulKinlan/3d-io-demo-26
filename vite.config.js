import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { handleClockRequest } from './demos/patching-clock/server.js';
import { handleUserDataRequest } from './demos/patching-user-data/server.js';
import { handleIslandsRequest } from './demos/islands-html/server.js';

const threeProxyPath = fileURLToPath(new URL('./src/lib/three-proxy.js', import.meta.url));
const threeAddonsProxyPrefix = `${fileURLToPath(new URL('./src/lib/three-addons/', import.meta.url))}/`;

export default defineConfig(({ command }) => ({
  plugins: [
    {
      name: 'patching-clock-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (handleClockRequest(req, res)) return;
          if (handleUserDataRequest(req, res)) return;
          if (handleIslandsRequest(req, res)) return;
          next();
        });
      }
    }
  ],
  resolve: {
    // Vite dev needs concrete files for import analysis, but production should
    // keep the bare specifiers so the browser import map remains authoritative.
    alias: command === 'serve' ? [
      { find: /^three\/addons\//, replacement: threeAddonsProxyPrefix },
      { find: /^three$/, replacement: threeProxyPath },
    ] : undefined,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      external: ['three', /^three\/addons\//],
      input: {
        main: './index.html',
        flappyBird: './demos/flappy-bird/index.html',
        browser: './demos/browser/index.html',
        newTab: './demos/new-tab/index.html',
        slideDeck: './demos/slide-deck/index.html',
        wahoo: './demos/wahoo/index.html',
        meoTowns: './demos/meo-towns/index.html',
        wahooWail: './demos/wahoo-wail/index.html',
        maltavista: './demos/maltavista/index.html',
        siteGenerator: './demos/site-generator/index.html',
      },
    },
  },
}));
