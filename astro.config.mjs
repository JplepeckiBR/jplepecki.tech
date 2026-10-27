import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build
export default defineConfig({
  site: 'https://jplepecki.tech',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Shiki theme matched to the graphite / signal-orange palette.
      theme: 'github-dark',
      wrap: true,
    },
  },
  image: {
    // Allow processing of local assets only; no remote domains needed.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
