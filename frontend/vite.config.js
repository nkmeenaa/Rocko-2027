import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The landing page is served by Django:
//   npm run build  →  ../server/static/landing/   (index.html + bundle/ + assets/)
//   Django view `landing` (server/views.py) returns that index.html at "/".
// base must match where Django serves those files: STATIC_URL + "landing/".
export default defineConfig({
  base: '/static/landing/',
  plugins: [react()],
  build: {
    outDir: '../server/static/landing',
    emptyOutDir: true,
    assetsDir: 'bundle',
    assetsInlineLimit: 0,
  },
});
