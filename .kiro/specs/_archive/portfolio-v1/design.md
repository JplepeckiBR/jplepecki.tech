# Design — jplepecki.tech

## Overview

Static Astro site, SSG, deployed to GitHub Pages. Content lives in typed collections and MDX.
Near-zero client JS. One visual concept: **field instrument / lab notebook**.

## Tech stack (decided)

- Astro 7 (current stable) — note: the original brief said "Astro latest"; latest stable at build
  time is v7, not v5. Content Layer API (glob loader) + zod schemas carry over unchanged.
- `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp` (image pipeline + OG images).
- Styling: plain CSS with custom properties. Single `src/styles/tokens.css` for design tokens,
  plus `global.css`. No CSS framework (keeps JS/CSS minimal and the aesthetic bespoke).
- Search: Pagefind, run in the `build` script against `dist`.
- Video: `lite-youtube-embed` style facade implemented as a tiny custom island (no full iframe
  until tap). Vimeo uses an equivalent lightweight facade.
- OG images: generated at build via `satori` + `@resvg/resvg-js` through an endpoint per entry.

## Architecture

```
src/
  assets/            # images processed by Astro (project covers, uploads/)
    uploads/         # Pages CMS image target
  components/        # Astro components (islands kept minimal)
    SensorTrace.astro      # hero waveform (canvas, <5KB, IntersectionObserver)
    ThemeToggle.astro      # light/dark toggle (inline script, no framework)
    VideoEmbed.astro       # click-to-load facade
    ProjectCard.astro
    PostCard.astro
    SpecTable.astro
    Tag.astro / StatusLight.astro / Prose.astro / BaseHead.astro / Footer.astro / Nav.astro
  content/
    config.ts        # collection schemas (zod)
    projects/*.mdx
    blog/*.mdx
    videos/*.mdx
  layouts/
    Base.astro       # html shell, head, skip link, nav, footer
    Prose.astro      # blog/project body measure (~68ch), figures, footnotes
  pages/
    index.astro
    projects/index.astro, projects/[slug].astro
    blog/index.astro, blog/[slug].astro
    videos/index.astro
    about.astro, now.astro, 404.astro
    rss.xml.ts
    og/[...route].ts       # build-time OG image endpoint
  styles/tokens.css, global.css
public/
  CNAME, robots.txt, fonts/  (self-hosted woff2)
```

## Design tokens

- Color (dark, default): `--bg: #14151a` (graphite, not pure black); `--fg: #ece7df` (warm
  off-white); `--muted`, `--line` hairline; `--accent: #ff5a1f`.
- Color (light, `[data-theme="light"]`): paper-white `#f7f4ee` bg, ink text, same accent.
- Type: headings/body = Space Grotesk (self-hosted woff2). Mono = IBM Plex Mono. `font-display: swap`.
- Scale: fluid type via `clamp()`. Spacing scale on a 4px base. Hairline `1px` rules in `--line`.
- Mono labels: uppercase, letter-spaced, e.g. `STATUS: ACTIVE`, `MCU: nRF52840`.

## Key components

- **SensorTrace**: canvas waveform resembling a gait-pressure signal, drawn procedurally with sine
  harmonics + smoothed noise. Pauses via IntersectionObserver; honors `prefers-reduced-motion` by
  drawing one static frame. Degrades to a static SVG if JS disabled.
- **ThemeToggle**: reads `localStorage` then `prefers-color-scheme`; sets `data-theme` on `<html>`
  via a tiny inline head script to avoid flash (FOUC) and layout shift.
- **VideoEmbed**: shows a poster + play button; on click swaps in the provider iframe. Keyboard
  accessible, 44px target, `title` + `aria-label`.
- **BaseHead**: title/description/canonical/OG/Twitter + per-entry OG image URL.

## Data flow

- `getCollection('projects')` etc. in pages. Related posts resolved by filtering `blog` where
  `data.project === project.slug`. "Currently building" = `projects` where `status==='active'`
  sorted by order/date. Featured = `featured: true` limited to 3.
- Empty-field safety: components guard every optional field (`cover && …`, `links?.repo && …`) so
  nothing renders empty. `TODO(JP)` text lives in content bodies, never injected into UI chrome.

## Accessibility & performance

- Semantic landmarks, one `h1` per page, skip link, visible focus rings, AA contrast verified in
  both themes. Images get width/height (via Astro `<Image>`) to prevent CLS. Fonts preloaded +
  `swap`. No render-blocking JS; islands hydrate on idle/visible only.

## Deploy

- `.github/workflows/deploy.yml`: `withastro/action` to build; `actions/deploy-pages` to deploy on
  push to `main` + `workflow_dispatch`; PRs run build only. Permissions pages/id-token. CNAME in
  `public/`. `site` set in `astro.config`.

## Testing / self-review

- `npm run build` clean. Playwright screenshots of every route at 375×812 and 1440×900 in both
  themes, reviewed visually. Click every link/card; verify rss.xml, sitemap, 404. Verify no secrets
  and no file > 2 MB committed.
