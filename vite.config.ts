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
        // Seslendirme dosyaları (public/voice) kuruluma dahil edilmez; çalındıkça önbelleğe alınır.
        // Yalnızca ince ses listesi (voice/index.json, ~68 KB) dahildir: açılışta hiç ağ beklenmesin.
        // Efektler (public/sfx, ~800 KB) de dahildir: oyunun sesi çevrimdışı da tam çalışsın.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}', 'sfx/*.mp3', 'voice/index.json'],
        // Çevrimiçi istemci (Firebase, ~650 KB) yalnızca çevrimiçi özelliği açanlara, ilk kullanımda iner.
        // Tam manifest (voice/manifest.json, 644 KB) yalnızca betikler içindir, uygulama indirmez.
        globIgnores: ['**/node_modules/**/*', 'voice/*.mp3', 'voice/manifest.json', 'assets/client-*.js'],
        runtimeCaching: [
          {
            // Ders eskizleri (public/thumbs): bir kez inince hep önbellekten (atölyede kaydırırken beklemesin).
            urlPattern: ({ url }) => url.pathname.includes('/thumbs/'),
            handler: 'CacheFirst',
            options: { cacheName: 'thumbs', expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 60 } },
          },
          {
            // Ses listesi: önbellekten hemen verilir, arka planda tazelenir (açılış ağ beklemez).
            urlPattern: ({ url }) => url.pathname.includes('/voice/') && /\/(index|manifest)\.json$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'voice-manifest', expiration: { maxEntries: 4 } },
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
          {
            urlPattern: ({ url }) => /\/assets\/client-[\w-]+\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'online-client', expiration: { maxEntries: 3 }, cacheableResponse: { statuses: [200] } },
          },
          {
            // Önceden üretilmiş ders eskizleri (scripts/build-thumbs.ts): görüldükçe önbelleğe alınır.
            urlPattern: ({ url }) => url.pathname.includes('/thumbs/'),
            handler: 'CacheFirst',
            options: { cacheName: 'thumbs', expiration: { maxEntries: 400 }, cacheableResponse: { statuses: [200] } },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    // Firestore kural testleri emulator ister: npm run test:rules
    exclude: ['**/node_modules/**', '**/dist/**', 'rules-tests/**'],
  },
});
