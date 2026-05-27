import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  // ESTO ES LO QUE DESTRIBA EL ERROR DEL CLIENTE:
  resolve: {
    alias: {
      // Le dice al navegador que si ve una importación de Node, no se rompa y use un objeto vacío
      'node:async_hooks': 'empty-module',
    },
  },
  optimizeDeps: {
    exclude: ['@tanstack/start-storage-context']
  }
});
