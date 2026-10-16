import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendTarget = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/ask': backendTarget,
      '/summarize': backendTarget,
      '/compare': backendTarget,
      '/upload': backendTarget,
      '/papers': backendTarget,
      '/root-health': {
        target: backendTarget,
        rewrite: () => '/',
      }
    }
  }
})

