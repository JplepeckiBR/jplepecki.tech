# Tasks — jplepecki.tech

- [x] 1. Project scaffold & config
  - [x] 1.1 `astro.config.mjs` with site, mdx, sitemap integrations; `tsconfig.json`; `.gitignore`.
  - [x] 1.2 `public/CNAME`, `public/robots.txt`, self-hosted fonts in `public/fonts/`.
  - _Req: 6.3, 3.1, 4.3_

- [x] 2. Design system
  - [x] 2.1 `src/styles/tokens.css` (color, type, spacing, dark+light) and `global.css`.
  - [x] 2.2 Base + Prose layouts, Nav, Footer (with Rio↔Boston time + last-built/commit), skip link.
  - _Req: 4.1, 4.2, 4.3, 5.3_

- [x] 3. Content model
  - [x] 3.1 `src/content.config.ts` with zod schemas for projects, blog, videos (alt required).
  - _Req: 1.1–1.6_

- [x] 4. Core components
  - [x] 4.1 StatusLight, Tag, SpecTable, ProjectCard, PostCard.
  - [x] 4.2 SensorTrace hero island (reduced-motion safe, pauses off-screen).
  - [x] 4.3 ThemeToggle (no-FOUC), VideoEmbed facade.
  - _Req: 4.4, 2.6, 5.5_

- [ ] 5. Pages
  - [ ] 5.1 Home with currently-building strip, featured, latest posts, latest video.
  - [ ] 5.2 Projects index (tag filter) + project detail (spec table, gallery, videos, related posts).
  - [ ] 5.3 Blog index + post detail (reading time, Shiki, related project).
  - [ ] 5.4 Videos, About (TODO draft copy), Now, 404.
  - _Req: 2.1–2.6_

- [ ] 6. SEO & feeds
  - [ ] 6.1 BaseHead meta/OG/Twitter/canonical; rss.xml; sitemap; per-entry OG image endpoint.
  - [ ] 6.2 Pagefind in build script + search UI on /blog and /projects.
  - _Req: 3.1–3.4_

- [ ] 7. Seed content
  - [ ] 7.1 8 project MDX files (StrideSense, card pricer, homelab, RAG, invest platform, PCA,
        vape teardown, hackathons) — build-log bodies, TODO(JP) for gaps.
  - [ ] 7.2 2–3 blog posts, a few video entries, about/now copy, placeholder cover art (<2MB, SVG).
  - _Req: 1.*, 2.*_

- [ ] 8. Authoring & deploy
  - [ ] 8.1 `.pages.yml` mapping collections + upload path.
  - [ ] 8.2 `.github/workflows/deploy.yml` (PR build; main deploy; dispatch).
  - _Req: 6.1, 6.2_

- [ ] 9. Self-review
  - [ ] 9.1 Clean build; Playwright screenshots every route × 2 sizes × 2 themes; fix visual issues.
  - [ ] 9.2 Link/404/feed checks; secret + 2MB asset audit.
  - [ ] 9.3 `NOTES_FOR_JP.md`; commit; prepare push + PR instructions.
  - _Req: 5.*, all_
