import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jplepecki.tech',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
  },
});
