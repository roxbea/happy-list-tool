import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  // Esto obliga a Vite a procesar estas librerías en el bundle y evita el error de Node
  ssr: {
    noExternal: true,
  },
});
