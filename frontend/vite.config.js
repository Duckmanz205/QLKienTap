import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite Configuration - Direct Download Mode
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy tat ca request /api/* sang backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

