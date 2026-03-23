import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      three: '/Users/paulkinlan/Code/3d-io-demo-26/src/lib/three-proxy.js',
    }
  },
  optimizeDeps: {
    exclude: ['three'],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      external: ['three'],
      input: {
        main: './index.html',
        flappyBird: './demos/flappy-bird/index.html',
        browser: './demos/browser/index.html',
        newTab: './demos/new-tab/index.html'
      },
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
