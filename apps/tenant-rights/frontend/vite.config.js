import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.FRONTEND_PORT || 5210),
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || 3053}`,
        changeOrigin: true,
      },
    },
  },
});
