import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        // All /api/* requests are forwarded to the backend during development.
        // This avoids CORS issues — the browser only ever talks to the Vite origin.
        '/api': {
          target: env['VITE_API_BASE_URL'] ?? 'https://ai-portfolio-analyser-devpraveen-3908e154.koyeb.app',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
