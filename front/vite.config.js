import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from './src/config.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': config.baseUrl
    }
  }
})
