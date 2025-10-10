import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'  // ← Deshabilitado temporalmente para desarrollo

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({...})  // ← Deshabilitado temporalmente
  ],
  server: {
    host: '0.0.0.0', // Escuchar en todas las interfaces (IPv4 e IPv6)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3003',  // ← Cambiado temporalmente a 3003
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://127.0.0.1:3003',   // ← Cambiado temporalmente a 3003
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
