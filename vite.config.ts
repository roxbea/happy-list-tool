import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  // Le avisamos a Vite que permita el uso de módulos de Node en el build de servidor
  ssr: {
    noExternal: ['@tanstack/start', '@tanstack/start-storage-context'],
  }
});
