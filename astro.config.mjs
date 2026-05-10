// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// GitHub Pages prefix support: set PUBLIC_BASE_PATH=/<repo> when deploying to project pages.
// For the production custom domain (momoyasystem.com), leave it empty.
const base = process.env.PUBLIC_BASE_PATH || '/';
const site = process.env.PUBLIC_SITE_URL || 'https://momoyasystem.com';

export default defineConfig({
  site,
  base,
  trailingSlash: 'never',
  vite: { plugins: [tailwindcss()] },
  integrations: [sitemap()],
});
