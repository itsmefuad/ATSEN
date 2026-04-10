import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      // Ensure environment variables are available at build time
      'import.meta.env.VITE_API_URL': JSON.stringify(
        mode === 'production' ? 'https://atsen.app/api' : process.env.VITE_API_URL
      ),
    },
  }
})
