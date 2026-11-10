# Requirements — jplepecki.tech portfolio + blog

## Introduction

A personal portfolio and blog for João Pedro "JP" Lepecki at https://jplepecki.tech. JP is a
Business Analytics & Finance student who builds real technical things and is pivoting toward the
hardware/software intersection (embedded systems + data science). The site must read like a
"field instrument / lab notebook," never like a generic AI-generated template. It is a static
Astro site deployed to GitHub Pages, writable from a phone via Pages CMS, with zero secrets and
zero required API keys.

## Guiding rules (non-negotiable)

- Never invent facts about JP. Missing content becomes a visible `TODO(JP): …` placeholder in the
  content source, and empty fields must never render as empty boxes, "undefined", or broken cards.
- No secrets, no API keys, no committed `.env` values.
- No committed large binaries. Images go through Astro's image pipeline; videos are embedded from
  external URLs. Max single committed asset: 2 MB.
- Ship as close to zero client JS as possible; interactivity is small islands only.

## Requirements

### Requirement 1 — Content model
**User Story:** As JP, I want typed content collections so that projects, posts and videos are
structured and validated at build time.
#### Acceptance Criteria
1. WHEN the site builds THEN the system SHALL define three content collections — `projects`,
   `blog`, `videos` — using the glob loader and zod schemas.
2. WHEN a content entry is missing a required field THEN the build SHALL fail with a clear error.
3. The `projects` schema SHALL include: title, hook, status (`active|shipped|paused|archived`),
   dates (start, optional end), tags, stack, optional cover image with required alt, optional
   links (repo/demo/video), featured flag, order.
4. The `blog` schema SHALL include: title, description, pubDate, optional updatedDate, tags,
   optional `project` slug reference, draft flag, optional hero image with required alt.
5. The `videos` schema SHALL include: title, provider (`youtube|vimeo`), id/url, pubDate, optional
   `project` slug reference, optional description, tags.
6. Alt text SHALL be required by schema anywhere an image is accepted.

### Requirement 2 — Information architecture & routes
**User Story:** As a visitor, I want a clear set of pages so I can explore JP's work.
#### Acceptance Criteria
1. The system SHALL provide routes: `/`, `/projects`, `/projects/[slug]`, `/blog`,
   `/blog/[slug]`, `/videos`, `/about`, `/now`, and a custom 404.
2. WHEN on `/` THEN the home SHALL show a hero, a "currently building" strip from `status: active`
   projects, 3 featured projects, the latest 3 posts, and the latest video.
3. `/projects` SHALL be a filterable grid by tag (embedded, data, AI, hardware, finance, agritech).
4. `/projects/[slug]` SHALL render a build-log body plus a spec table (MCU, sensors, stack, status,
   dates), optional image gallery, embedded videos, and related posts (posts whose frontmatter
   `project` matches the slug).
5. `/blog/[slug]` SHALL show reading time, tags, and link to a related project when set.
6. `/videos` SHALL render embedded videos via a click-to-load facade.

### Requirement 3 — SEO, feeds, discoverability
#### Acceptance Criteria
1. The system SHALL generate `/rss.xml`, a sitemap, and `robots.txt`.
2. Every page SHALL have a unique title and description, canonical URL, and Open Graph + Twitter
   card tags.
3. The system SHALL generate a per-post and per-project Open Graph image at build time.
4. The system SHALL provide static search (Pagefind) built at build time.

### Requirement 4 — Visual direction
#### Acceptance Criteria
1. The design SHALL use a single `tokens.css` design-token file: graphite background, warm
   off-white text, one signal-orange accent (~#FF5A1F).
2. The system SHALL provide light mode (paper-white) following `prefers-color-scheme` with a manual
   toggle that persists.
3. Typography SHALL pair a characterful grotesk (headings/body) with a monospace (metadata, labels,
   tags, spec tables), self-hosted with `font-display: swap`.
4. The home hero SHALL include a procedural sensor-trace waveform (<5 KB JS) that pauses off-screen
   and renders a static frame under `prefers-reduced-motion`.
5. The design SHALL avoid: purple/blue gradients, glassmorphism, blobs, emoji bullets, "Hi I'm JP
   👋" hero, three identical icon cards, stock art, centered-everything layouts, gratuitous scroll
   animations.

### Requirement 5 — Quality bar
#### Acceptance Criteria
1. The site SHALL be mobile-first and excellent at 360–430 px: no horizontal scroll, tap targets
   ≥ 44 px, readable without zoom.
2. Lighthouse mobile SHALL target ≥ 95 for Performance, Accessibility, Best Practices, SEO.
3. The site SHALL use semantic HTML, a skip link, focus-visible styles, and AA contrast in both
   themes.
4. `npm run build` SHALL pass with zero fixable warnings and no console errors.
5. There SHALL be no layout shift from fonts or images.

### Requirement 6 — Authoring & deploy
#### Acceptance Criteria
1. The repo SHALL include a Pages CMS config (`.pages.yml`) mapping the three collections, with
   image uploads routed to `src/assets/uploads/`.
2. The repo SHALL include `.github/workflows/deploy.yml` that builds on PRs (no deploy) and builds
   + deploys to GitHub Pages on push to `main` and manual dispatch, using current action majors and
   permissions `contents: read`, `pages: write`, `id-token: write`, with no secrets.
3. The repo SHALL include `public/CNAME` = `jplepecki.tech` and `site: 'https://jplepecki.tech'`.
