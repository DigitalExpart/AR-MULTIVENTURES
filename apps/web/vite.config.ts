import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@ar-multiventures/types': fileURLToPath(new URL('../../packages/types/src', import.meta.url)),
      '@ar-multiventures/validation': fileURLToPath(new URL('../../packages/validation/src', import.meta.url)),
      '@ar-multiventures/business-logic': fileURLToPath(new URL('../../packages/business-logic/src', import.meta.url)),
      '@ar-multiventures/config': fileURLToPath(new URL('../../packages/config/src', import.meta.url)),
      '@ar-multiventures/api': fileURLToPath(new URL('../../packages/api/src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
