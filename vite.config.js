import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev proxy: /api/iss/* → http://api.open-notify.org/*
      '/api/iss': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/iss/, ''),
      },
    },
  },
  build: {
    // Raise warning threshold to avoid noise
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large deps into separate chunks for better caching
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'charts':        ['recharts'],
          'leaflet':       ['leaflet', 'react-leaflet'],
          'motion':        ['framer-motion'],
          'utils':         ['axios', 'date-fns', 'react-hot-toast'],
        },
      },
    },
  },
})
