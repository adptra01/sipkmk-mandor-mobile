import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'SI-PKMK Mandor',
        short_name: 'SI-PKMK',
        lang: 'id',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f59e0b',
        description: 'Pencatatan material lapangan SI-PKMK',
        icons: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Master data: StaleWhileRevalidate (host-agnostik)
          { urlPattern: /\/api\/(materials|projects)(\?.*)?$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'api-master', expiration: { maxEntries: 50, maxAgeSeconds: 604800 } } },
          // Mutasi/auth/sync: NetworkOnly (jangan cache)
          { urlPattern: /\/api\/(sync|photos|login|logout|me)/, handler: 'NetworkOnly' },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: { host: '0.0.0.0', port: 5173 },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-dexie': ['dexie'],
        },
      },
    },
  },
});
