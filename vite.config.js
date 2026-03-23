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
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
