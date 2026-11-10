# Tech — jplepecki.tech

Static Astro site on Cloudflare Pages. Content from Notion at build time. Keep it boring, fast and
dependency-light.

## Stack (do not swap)

- Astro, current stable. Static output.
- Content: a custom Astro content loader using `@notionhq/client`. Database and page IDs come from
  env vars (see `.env.example`). No markdown content folders.
- Images: every Notion-hosted file is downloaded at build time and served through Astro's image
  pipeline. Notion file URLs expire and must never appear in built HTML.
- Plain CSS with custom properties in one tokens file. No CSS framework.
- OG images generated at build time with satori + resvg.
- Video: click-to-load facade, no iframe until tapped.
- Analytics: Cloudflare Web Analytics.

## Conventions

- Near-zero client JS. Small islands only (live "today" marker, "tidy the desk").
- Every optional field is guarded so nothing renders empty.
- Images have explicit dimensions (no layout shift). Fonts self-hosted, preloaded, `font-display: swap`.
- `INCLUDE_DRAFTS=true` renders Notion drafts locally. Never in production.
- Never commit `dist/`, `node_modules/`, `.astro/`, `.env`.

## Branches and deploy

- `main` deploys to production. Work on feature branches and open PRs; never push straight to `main`.
- `quartz-archive` and `portfolio-v1` are history. Never delete or rewrite them.
- Cloudflare Pages builds every push (previews) and `main` (production). A deploy hook is called
  hourly by a GitHub Action so Notion changes go live without commits.
