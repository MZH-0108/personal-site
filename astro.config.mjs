import { defineConfig } from 'astro/config';

// Astro configuration follows the official `defineConfig` pattern:
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
});
