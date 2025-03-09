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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});