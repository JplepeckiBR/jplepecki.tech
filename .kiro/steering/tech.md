# Tech — jplepecki.tech

Static Astro site deployed to GitHub Pages. Keep it boring, fast, and dependency-light.

## Stack (do not swap)

- Astro (current stable; repo is on v7) with content collections (glob loader) + zod schemas.
- `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp`.
- Plain CSS with custom properties. Single design-token file `src/styles/tokens.css`. No CSS
  framework.
- Pagefind for static search (runs in the `build` script against `dist`).
- Video via a lightweight click-to-load facade (no full iframe until tap).
- OG images generated at build time (satori + resvg).

## Commands

- `npm run dev` — local dev server.
- `npm run build` — Astro build THEN Pagefind index (`astro build && pagefind --site dist`).
- `npm run preview` — preview the built `dist`.

## Conventions

- Ship near-zero client JS. Interactivity is small islands, hydrated on visible/idle only.
- Every optional field must be guarded in templates so nothing renders empty.
- Images use Astro `<Image>`/`<Picture>` with explicit dimensions (no CLS). Fonts self-hosted,
  preloaded, `font-display: swap`.
- Set `site: 'https://jplepecki.tech'` in astro.config. `public/CNAME` holds the domain.
- `dist/`, `node_modules/`, `.astro/` are gitignored. Never commit build output or `node_modules`.

## Deploy

- `.github/workflows/deploy.yml`: build on PRs (no deploy); build + deploy to Pages on push to
  `main` and manual `workflow_dispatch`. Permissions: contents:read, pages:write, id-token:write.
  No secrets. Work on feature branches; never push straight to `main` without review (main deploys
  to production).
