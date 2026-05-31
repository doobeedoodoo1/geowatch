import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'GeoWatch – Städte erraten',
        short_name: 'GeoWatch',
        description: 'Erkenne Städte aus echten Webcams weltweit. Kostenloses Geographie-Quiz.',
        theme_color: '#07080d',
        background_color: '#07080d',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Webcam-Bilder: network-first, kurzer Cache
            urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'webcam-images',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            // Supabase API: network-first
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
})
