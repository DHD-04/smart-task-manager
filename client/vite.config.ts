import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:' + (loadEnv(mode, process.cwd(), '').PORT || 3001) } }
}))
