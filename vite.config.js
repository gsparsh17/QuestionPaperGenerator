// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import nodePolyfills from 'rollup-plugin-polyfill-node';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       events: 'rollup-plugin-polyfill-node/polyfills/events',
//     },
//   },
//   optimizeDeps: {
//     include: ['events'],
//   },
//   build: {
//     rollupOptions: {
//       plugins: [nodePolyfills()],
//     },
//   },
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    nodePolyfills({
      // Specify which polyfills to include
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
});