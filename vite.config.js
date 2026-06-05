import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import typegpuPlugin from 'unplugin-typegpu/vite';

// three.js — specifically the experimental dev build that ships HTMLTexture — is
// vendored locally under ./vendor/three so the project runs fully offline. The
// aliases below resolve the bare `three` / `three/addons/*` specifiers to those
// local files in both dev and build; Vite/Rollup then serve (dev) or bundle
// (build) a single shared instance. No CDN / import map required.
const threeModulePath = fileURLToPath(new URL('./vendor/three/three.module.js', import.meta.url));
const threeAddonsPrefix = fileURLToPath(new URL('./vendor/three/addons/', import.meta.url));

export default defineConfig({
  plugins: [typegpuPlugin()],
  resolve: {
    alias: [
      { find: /^three\/addons\//, replacement: threeAddonsPrefix },
      { find: /^three$/, replacement: threeModulePath },
    ],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
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
        jelly: './demos/jelly/index.html',
        analyseImage: './demos/analyse-image/index.html',
      },
    },
  },
});
