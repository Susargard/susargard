import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Пока сайт живёт как project site на GitHub Pages:
// https://susargard.github.io/susargard/
// Когда появится домен — поменять base на '/' и добавить CNAME.
export default defineConfig({
  site: 'https://susargard.github.io',
  base: '/susargard',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
