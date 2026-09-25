import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg', 'icon-192.svg', 'icon-512.svg',
        'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
      ],
      manifest: {
        id: '/',
        name: 'תקציב — ניהול פיננסי משפחתי',
        short_name: 'תקציב',
        description: 'ניהול פיננסי חכם למשפחה',
        theme_color: '#1B2A27',
        background_color: '#E9EBE4',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'he',
        dir: 'rtl',
        // PNG only: Chrome's WebAPK minting service does not reliably accept SVG
        // manifest icons, and falling back leaves a plain bookmark shortcut
        // instead of a real installed app. `any` and `maskable` are declared as
        // separate entries — a combined "any maskable" purpose makes Android
        // crop the rounded backplate of the standard icon.
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // Never let the service worker intercept /api/ — OAuth redirects and
        // cookie-based auth break when the SW follows server-side redirects.
        navigateFallbackDenylist: [/^\/api\//, /^\/lab\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      },
    },
  },
})
