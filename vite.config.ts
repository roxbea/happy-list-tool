import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Forzamos a Vite a ignorar los módulos conflictivos de servidor en el bundle final
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['node:async_hooks', '@tanstack/start-storage-context']
    }
  }
});
