import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), tailwindcss()],

    // `@/*` comes from tsconfig.app.json — one source of truth for the alias.
    resolve: { tsconfigPaths: true },

    server: {
      port: 5173,
      strictPort: true,
      // Dev-only proxy: the app always calls same-origin `/api/...`, so no CORS
      // setup and no environment-specific base URL baked into the client.
      proxy: env.VITE_API_PROXY_TARGET
        ? {
            '/api': {
              target: env.VITE_API_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },

    preview: {
      port: 4173,
      strictPort: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'es2022',
      // Chunking is left to Vite: the lazy routes in `src/app/routes.tsx`
      // already produce per-page chunks, and hand-rolled `manualChunks` for
      // React is a common source of module init-order bugs.
      chunkSizeWarningLimit: 700,
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts', 'src/main.tsx'],
      },
    },
  };
});
