import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Python OCR/compliance API (backend/api.py) runs on port 8000.
// During `npm run dev`, requests to /api are forwarded there.
const apiTarget = process.env.NIRIKSHAK_API ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
