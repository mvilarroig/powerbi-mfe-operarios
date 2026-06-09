import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El frontend llama a /api y Vite lo redirige al backend Express (PostgreSQL).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
