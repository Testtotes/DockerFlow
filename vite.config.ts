import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/root/DockerFlow/',
  server: {
    proxy: {
      '/root/DockerFlow/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/root\/DockerFlow\/api/, ''),
      },
    },
  },
});