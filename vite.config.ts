import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

// base: './' → GitHub Pages alt yolu (kullanici.github.io/repo/) ve ileride Capacitor ile aynı build çalışır.
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Çizio — Çizim Öğren',
        short_name: 'Çizio',
        description: 'Adım adım, sesli anlatımlı çizim dersleri',
        lang: 'tr',
        theme_color: '#ff6b4a',
        background_color: '#cfeee6',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Ses dosyaları (public/voice) kuruluma dahil edilmez; çalındıkça önbelleğe alınır.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['**/node_modules/**/*', 'voice/**/*'],
        runtimeCaching: [
          {
            // Manifest güncellenebilir: önce ağ, çevrimdışıysa önbellek.
            urlPattern: ({ url }) => url.pathname.includes('/voice/') && url.pathname.endsWith('/manifest.json'),
            handler: 'NetworkFirst',
            options: { cacheName: 'voice-manifest', networkTimeoutSeconds: 3, expiration: { maxEntries: 2 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/voice/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'voice',
              expiration: { maxEntries: 2000 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
