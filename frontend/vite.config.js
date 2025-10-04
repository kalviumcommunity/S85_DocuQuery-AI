import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable automatic JSX runtime
    jsxRuntime: 'automatic'
  })],
  server: {
    port: 5173,
    host: true
  }
})
