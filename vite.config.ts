// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Opcional: proxy para desenvolvimento
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    // Variáveis globais
    // 'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'https://seu-servidor.com:4000')
  }
})
