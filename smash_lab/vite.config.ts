import { defineConfig } from 'vitest/config';

// The Flask page (templates/smash_lab.html) loads the built files from
// static/smash_lab/, so the build writes there with fixed (un-hashed) names.
// Flask's static_file() helper adds a ?v=<mtime> cache-buster.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/static/smash_lab/' : '/',
  build: {
    outDir: '../static/smash_lab',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: { smash_lab: 'src/main.ts' },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
}));
