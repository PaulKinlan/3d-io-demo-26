import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import typegpuPlugin from 'unplugin-typegpu/vite';
import { browserChrome } from './demos/_frame/wrap.js';

// Auto-discover every `demos/<name>/index.html` as a build entry so adding a
// demo never requires editing this file. The main 3D app stays the `main` entry.
const demosDir = fileURLToPath(new URL('./demos/', import.meta.url));
const demoInputs = Object.fromEntries(
  readdirSync(demosDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .filter((d) => existsSync(`${demosDir}${d.name}/index.html`))
    .map((d) => [`demo-${d.name}`, `./demos/${d.name}/index.html`]),
);

// three.js — specifically the experimental dev build that ships HTMLTexture — is
// vendored locally under ./vendor/three so the project runs fully offline. The
// aliases below resolve the bare `three` / `three/addons/*` specifiers to those
// local files in both dev and build; Vite/Rollup then serve (dev) or bundle
// (build) a single shared instance. No CDN / import map required.
const threeModulePath = fileURLToPath(new URL('./vendor/three/three.module.js', import.meta.url));
const threeAddonsPrefix = fileURLToPath(new URL('./vendor/three/addons/', import.meta.url));

export default defineConfig({
  plugins: [typegpuPlugin(), browserChrome()],
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
        ...demoInputs,
      },
    },
  },
});
