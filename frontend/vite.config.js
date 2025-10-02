import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.svg', 'mask-icon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg', 'offline.html', 'sw.js'],
      manifest: {
        name: 'Gestor de Aulas Universitarias',
        short_name: 'GestorAulas',
        description: 'Sistema de gestión de aulas universitarias con IoT',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['education', 'productivity', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Ir al dashboard principal',
            url: '/dashboard',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }]
          },
          {
            name: 'Aulas',
            short_name: 'Aulas',
            description: 'Ver aulas disponibles',
            url: '/classrooms',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        // Usar Service Worker personalizado generado por el plugin
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'offline.html'
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
