import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const threeProxyPath = fileURLToPath(new URL('./src/lib/three-proxy.js', import.meta.url));
const threeAddonsProxyPrefix = `${fileURLToPath(new URL('./src/lib/three-addons/', import.meta.url))}/`;

export default defineConfig(({ command }) => ({
  plugins: [
    {
      name: 'patching-clock-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/demos/patching-clock/' || req.url === '/demos/patching-clock/index.html') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            
            res.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Patching Clock Demo</title>
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: #0c1118;
      color: #e8f6ff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    h1 {
      color: #89ffd8;
      margin-bottom: 1rem;
    }
    .clock-container {
      background: rgba(24, 40, 60, 0.5);
      border: 2px solid rgba(125, 255, 210, 0.3);
      border-radius: 12px;
      padding: 2rem;
      font-size: 3rem;
      font-weight: 700;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
    }
    .clock-container section span {
      display: none !important;
    }
    .clock-container section span:last-of-type {
      display: inline !important;
    }
  </style>
</head>
<body>
  <h1>Declarative Patching Clock</h1>
  <div class="clock-container">
    <section>
      <?start name="clock">Clock loading...<?end>
    </section>
  </div>
`);

            const interval = setInterval(() => {
              const time = new Date().toLocaleTimeString();
              res.write(`
<template for="clock">
  <span>${time}</span>
  <?marker name="clock">
</template>
`);
            }, 1000);

            req.on('close', () => {
              clearInterval(interval);
            });
          } else {
            next();
          }
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
