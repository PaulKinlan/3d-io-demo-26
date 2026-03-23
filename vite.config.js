import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const threeProxyPath = fileURLToPath(new URL('./src/lib/three-proxy.js', import.meta.url));
const threeAddonsProxyPrefix = `${fileURLToPath(new URL('./src/lib/three-addons/', import.meta.url))}/`;

export default defineConfig(({ command }) => ({
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
      },
    },
  },
}));
