/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// VITE_PRIVATE_CONTENT=true builds the online version without any book text in its code;
// chapters are then loaded from the protected database after an approved person signs in.
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const priv = env.VITE_PRIVATE_CONTENT === 'true';
  const book = fileURLToPath(new URL(priv ? './src/data/content/stub.ts' : './src/data/content/index.ts', import.meta.url));
  return {
    plugins: [react()],
    base: './',
    resolve: { alias: { '@book': book } },
    test: { globals: true },
  };
});
