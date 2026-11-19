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
        theme_color: '#f59e0b',
        background_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /inventaris-material\.ddev\.site.*\/api\/(materials|projects)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-master',
              expiration: { maxEntries: 50, maxAgeSeconds: 604800 },
            },
          },
          {
            urlPattern: /inventaris-material\.ddev\.site.*\/api\/sync/,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://curious-lime-sloth.101-50-1-74.cpanel.site',
        changeOrigin: true,
        secure: false,
        headers: { Cookie: 'cpanel_tech_domain=1' },
      },
    },
  },
  build: { outDir: 'dist' },
});
