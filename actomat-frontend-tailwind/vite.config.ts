import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Spunem lui Vite: "Orice cerere care începe cu /api, trimite-o la serverul de Node"
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Eliminăm /api înainte să ajungă la server
      },
    },
  },
})