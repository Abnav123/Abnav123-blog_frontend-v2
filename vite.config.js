import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': {
        target: 'https://blog-backend-8efx.onrender.com',
        changeOrigin: true,
      },
      '/debates': {
        target: 'https://blog-backend-8efx.onrender.com',
        changeOrigin: true,
      },
      '/arguments': {
        target: 'https://blog-backend-8efx.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
