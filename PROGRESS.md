# PROGRESS — jplepecki.tech portfolio build

## Goal

Build JP Lepecki's personal portfolio + blog at https://jplepecki.tech as a static Astro site:
"field instrument / lab notebook" aesthetic, content collections (projects/blog/videos), near-zero
client JS, Pages CMS phone authoring, GitHub Pages deploy, zero secrets. Work happens on branch
`portfolio-v1`; a PR into `main` is opened for review (main deploys to production). Never invent
facts about JP — missing info becomes visible `TODO(JP):` placeholders that never render broken.

Executing the Kiro spec at:
- `.kiro/specs/portfolio-v1/requirements.md`
- `.kiro/specs/portfolio-v1/design.md`
- `.kiro/specs/portfolio-v1/tasks.md`

Steering (rules for future sessions):
- `.kiro/steering/product.md`, `.kiro/steering/tech.md`, `.kiro/steering/style.md`

## Environment notes

- Workspace was EMPTY and not a git repo (repo was not pre-cloned as the prompt assumed).
  Initialized git, added remote `origin` = https://github.com/JplepeckiBR/jplepecki.tech.git,
  fetched `origin/main`, and re-based `portfolio-v1` onto `origin/main` (commit `8b388f0
  "Initial commit"`, which contains only README.md). `main`, `origin/main`, `portfolio-v1` now
  share history, so a PR into main is possible. Remote README.md preserved.
- `gh` CLI is NOT installed → cannot open the PR or push with auth programmatically. Push + PR
  steps must be done by JP (will be documented in NOTES_FOR_JP.md).
- Astro current stable is **v7.4.2**, not v5 (older cached docs say v5). Installed astro@7.4.2,
  @astrojs/mdx@8, @astrojs/sitemap@3, @astrojs/rss@4, sharp, pagefind, satori, @resvg/resvg-js,
  @playwright/test (dev), @fontsource/space-grotesk + @fontsource/ibm-plex-mono (font source only).
- `npm audit` reports 2 moderate vulns in dev/transitive deps; NOT force-fixed (would be breaking).

## Done

(Commits are being created at this checkpoint — see the checkpoint commit hash below. All work so
far is in that single WIP commit on `portfolio-v1`.)

- Git re-based onto origin/main; remote configured. [verified]
- `package.json` with dev/build/preview scripts (`build` = `astro build && pagefind --site dist`).
- `.gitignore` (dist, node_modules, .astro, env, playwright artifacts).
- `astro.config.mjs` — site, trailingSlash ignore, mdx + sitemap integrations, Shiki github-dark,
  sharp image service.
- `tsconfig.json` — extends astro strict, path aliases.
- `public/CNAME` = jplepecki.tech; `public/robots.txt` with sitemap-index reference.
- Self-hosted fonts copied to `public/fonts/` (Space Grotesk 400/500/700 + latin-ext; IBM Plex
  Mono 400/500 + latin-ext), all < 15 KB each.
- Spec files (requirements/design/tasks) + 3 steering files written.

## STATUS: COMPLETE

All 9 tasks done. Site is built, self-reviewed, and committed on `portfolio-v1`. The only thing
left is for JP to push the branch and open the PR into `main` (cannot be done here — no gh CLI or
git credentials). Full instructions are in NOTES_FOR_JP.md.

Self-review results: `npm run build` clean (17 pages + Pagefind 16 pages). Playwright screenshots
of every route × {375×812, 1440×900} × {light, dark} reviewed — no console errors, no HTTP errors
(except the intentional 404 test). Fixed: hero-trace caption scrim, videos empty-state word spacing.
Audits pass: no secrets, no .env, no tracked file > 2 MB (largest 169 KB OG font), no leaked
"undefined/null/NaN" in rendered HTML.

## In progress

Tasks 2–7 DONE. The FULL `npm run build` pipeline passes: `astro build` emits 17 pages
(home, projects index + 8 details, blog index + 2 posts, videos, about, now, 404, rss.xml,
sitemap-index.xml, og/default.png + 2 blog OG + 8 project OG), then `pagefind --site dist`
indexes 16 pages. OG images render via satori + resvg using OFL TTFs in src/assets/og-fonts/
(build-only, not shipped). NOTE: og.ts resolves fonts from process.cwd()/src/assets/og-fonts
because import.meta.url doesn't survive prerender bundling.

Tasks 6.2 and 8 now DONE too: Search.astro island (lazy-loads /pagefind/pagefind.js) is on
/blog and /projects; `.pages.yml` maps all 3 collections + the now.md file (uploads →
src/assets/uploads/); `.github/workflows/deploy.yml` builds on PRs (no deploy) and builds+deploys
on push to main / workflow_dispatch (actions/checkout@v4, setup-node@v4, upload-pages-artifact@v3,
deploy-pages@v4; perms contents:read/pages:write/id-token:write; no secrets).

NEXT CONCRETE STEP (task 9 — self review): run Playwright to screenshot every route at 375×812 and
1440×900 in light + dark, review them, fix visual issues. Then link/feed/404 checks, secret + 2MB
asset audit, write NOTES_FOR_JP.md, final commit, and prepare push + PR instructions (cannot push:
no gh/credentials).

## Next (remaining tasks, in order)

1. Design system: `src/styles/tokens.css` + `global.css`; `@font-face` declarations.
2. Layouts/components: Base.astro (head, skip link, nav, footer w/ Rio↔Boston time + last-built +
   commit hash), Prose.astro, Nav, Footer, BaseHead (SEO/OG/Twitter/canonical).
3. Content model: `src/content/config.ts` zod schemas (projects, blog, videos; alt required).
4. Core components: StatusLight, Tag, SpecTable, ProjectCard, PostCard, SensorTrace (hero island),
   ThemeToggle (no-FOUC), VideoEmbed (click-to-load facade).
5. Pages: index, projects index + [slug], blog index + [slug], videos, about, now, 404, rss.xml.ts,
   og/[...route].ts (build-time OG images).
6. Seed content: 8 project MDX files (StrideSense, card pricer, homelab, RAG, invest platform, PCA,
   vape teardown, hackathons), 2–3 blog posts, a few videos, about/now copy, placeholder SVG covers
   (<2MB). TODO(JP) for all gaps. Email = TODO(JP).
7. Authoring + deploy: `.pages.yml` mapping collections (uploads → src/assets/uploads/);
   `.github/workflows/deploy.yml` (PR build only; push-to-main + workflow_dispatch deploy; perms
   contents:read/pages:write/id-token:write; no secrets).
8. Self-review: clean `npm run build`; Playwright screenshots every route × {375×812,1440×900} ×
   {light,dark}; fix visual issues; link/404/feed checks; secret + 2MB audit.
9. `NOTES_FOR_JP.md`: build summary, decisions, every TODO(JP) with file path, private repos to
   decide on (talaria, Portfolio-AML, internship/company repos), how to add a post from laptop and
   from phone (Pages CMS), push + PR instructions. Then commit + prepare PR.

## Decisions made & why

- Astro 7 over 5: v7 is the current stable; the brief said "latest stable". Content-collection +
  glob loader + zod approach is unchanged. Confirmed with JP ("proveed").
- Plain CSS + custom properties (not Tailwind): keeps the bespoke instrument aesthetic and minimal
  shipped CSS; single `tokens.css` as required.
- Fonts via Fontsource packages, copying only needed weights to `public/fonts/` so they're
  self-hosted and we don't depend on the package at runtime.

## Open questions for JP

- Which email address to expose (currently TODO(JP)).
- Whether any "private repo" projects should get public pages (listed in NOTES_FOR_JP.md).
- Confirm Astro 7 is acceptable (proceeding on yes).

## How to verify current state

- `npm run build` has NOT been run yet and is EXPECTED TO FAIL until `src/` exists (no pages/
  content config yet). First meaningful build check comes after tasks 1–3.
- Repo base: `git log --oneline` shows the WIP checkpoint commit on top of `8b388f0 Initial commit`
  (shared with origin/main).
