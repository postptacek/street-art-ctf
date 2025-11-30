import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use '/' for dev, '/street-art-ctf/' for production (GitHub Pages)
  base: mode === 'production' ? '/street-art-ctf/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173,
    host: true // Allow mobile testing on same network
  }
}))
