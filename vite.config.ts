import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Group React library
              if (id.includes('react') || id.includes('scheduler')) {
                return 'vendor-react-core';
              }
              // Group Google GenAI SDK
              if (id.includes('@google/genai')) {
                return 'vendor-google-genai';
              }
              // Group Motion/Framer motion
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              // Group Lucide icons
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              return 'vendor-utils';
            }
          }
        }
      }
    }
  };
});
