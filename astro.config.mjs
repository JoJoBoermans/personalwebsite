import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const site = process.env.PUBLIC_SITE_URL ?? 'https://shelfsketch.example';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
