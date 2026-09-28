import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ['cloudflare/**/*.tsx'], rules: { '@next/next/no-html-link-for-pages': 'off' } },
  globalIgnores(['.next/**', '.wrangler/**', 'dist-cloudflare/**', 'cloudflare/generated/**', 'public/maplibre/**', 'next-env.d.ts']),
]);
