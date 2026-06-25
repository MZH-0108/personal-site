import { defineConfig } from 'astro/config';

// Astro configuration follows the official `defineConfig` pattern:
// https://docs.astro.build/en/reference/configuration-reference/
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';

export default defineConfig({
  site: isGitHubPages ? 'https://mzh-0108.github.io' : 'https://example.com',
  base: isGitHubPages ? '/personal-site' : '/',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
});
