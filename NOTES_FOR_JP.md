# Notes for JP — portfolio-v1

Morning, JP. I built your portfolio + blog overnight on the branch **`portfolio-v1`**. Here's
everything you need to review and ship it. Nothing is on `main` yet — `main` deploys to production,
so I left the merge to you.

---

## 1. What I built

A static **Astro 7** site at `jplepecki.tech` — "field instrument / lab notebook" aesthetic:
graphite ground, one signal-orange accent, Space Grotesk + IBM Plex Mono (self-hosted), hairline
rules, mono status/spec labels, and a live procedural gait-pressure **sensor trace** in the hero
(pauses off-screen, static under reduced-motion, degrades without JS).

Pages: Home, Projects (filterable) + 8 project build-logs, Blog + 2 posts, Videos, About, Now, a
custom 404, plus `rss.xml`, `sitemap-index.xml`, `robots.txt`, and a build-time **OG image** per
page/post/project. Static search via **Pagefind**. Near-zero client JS (tiny islands only).

- **Zero secrets**, zero API keys, no `.env`. Largest committed file is a 169 KB OG font.
- Mobile-first; checked at 375px and 1440px in light + dark. No console errors (verified with
  Playwright across every route × 2 sizes × 2 themes).
- `npm run build` runs `astro build && pagefind --site dist` and passes clean (17 pages).

## 2. Decisions I made (and why)

- **Astro 7, not 5.** The brief said "latest stable"; latest stable is v7.4.2. Same content
  collections / glob loader / zod approach. (Steering files say "repo is on v7".)
- **Plain CSS + custom properties**, single `src/styles/tokens.css`. No framework — keeps the
  bespoke look and ships almost no CSS.
- **The repo wasn't cloned** when I started (empty, no git). I ran `git init`, set `origin` to
  `https://github.com/JplepeckiBR/jplepecki.tech.git`, fetched `origin/main`, and based
  `portfolio-v1` on `origin/main` so a PR into `main` works. Your original `README.md` is intact.
- **OG images** use satori + resvg with OFL TTFs in `src/assets/og-fonts/` (build-only, never
  shipped to browsers).
- **Fonts**: only the weights the site uses, self-hosted in `public/fonts/`, preloaded, `swap`.
- **Pages CMS** (`.pages.yml`) maps projects/blog/videos + the Now page; image uploads land in
  `src/assets/uploads/`. No tokens stored — it commits via your own GitHub login.
- I could **not push or open the PR** — there's no `gh` CLI or git credentials on this machine.
  Do that yourself (section 5). Everything is committed locally on `portfolio-v1`.

## 3. Everything marked TODO(JP) — review these

These render as **visible placeholder text**, never as broken/empty UI. Fill in or delete.

**Identity / config**
- `src/consts.ts` (line ~19) — **your public email** (the UI hides the email link until you set it).

**Project build-logs** (bodies written only from what you gave me; the rest is yours):
- `src/content/projects/stridesense.mdx` — beachhead discovery notes; what broke; next milestone;
  repo/demo/video links.
- `src/content/projects/pokemon-card-pricer.mdx` — models/techniques; what broke; next; links.
- `src/content/projects/homelab-cyberdeck.mdx` — hardware/OS; what broke; next service.
- `src/content/projects/local-rag-corruption.mdx` — document set, chunking, outcome.
- `src/content/projects/investment-platform.mdx` — scope; what you learned.
- `src/content/projects/pca-work.mdx` — what the data/frontend did; lessons.
- `src/content/projects/vape-teardown.mdx` — how you traced it; takeaways.
- `src/content/projects/hackathons.mdx` — Hackachusetts + Dell × NVIDIA details.

**Blog**
- `src/content/blog/building-stridesense-on-nrf52840.mdx` — real engineering numbers.
- `src/content/blog/finance-to-hardware.mdx` — optional personal paragraph in your voice.

**About / Now / Videos**
- `src/pages/about.astro` — the "What I'm looking for" paragraph is a conservative DRAFT; rewrite
  it in your voice. Email line also hidden until `src/consts.ts` email is set.
- `src/now.md` — keep this current; it's your frequently-edited page.
- `src/content/videos/card-pricer-ep1.mdx` — placeholder, `draft: true`. Add the real YouTube id
  and set `draft: false` to publish. The Videos page shows a friendly empty-state until then.

## 4. Private repos — YOU decide (I did NOT create pages for these)

Per the rules, I skipped anything that could be employer-confidential. Decide case by case whether
any deserve a public page:

- `talaria`
- `Portfolio-AML`
- any internship / company repos

If you want pages for any, add an MDX file under `src/content/projects/` (copy an existing one).

## 5. How to push and open the PR (do this to review on GitHub)

From the repo root, with your GitHub auth set up:

```bash
git push -u origin portfolio-v1
```

Then open a PR into `main`:
- With the GitHub CLI: `gh pr create --base main --head portfolio-v1 --title "Portfolio v1" --fill`
- Or in the browser: GitHub will show a "Compare & pull request" button for `portfolio-v1`.

Opening the PR runs the workflow's **build job only** (no deploy). Merging to `main` triggers the
**build + deploy** to GitHub Pages. First time only: in the repo, **Settings → Pages → Build and
deployment → Source: GitHub Actions**, and make sure the `jplepecki.tech` DNS points at Pages.
`public/CNAME` already contains the domain.

> Screenshots for the PR are in `.review-screens/` (gitignored). Attach any you like by dragging
> them into the PR description.

## 6. How to add a post

**From your laptop:** create `src/content/blog/my-post.mdx`:

```mdx
---
title: My post title
description: One sentence for SEO + cards.
pubDate: 2026-11-01
tags: [embedded, data]
project: stridesense   # optional — links the post to a project page
draft: false           # true hides it in production
---

Body in Markdown/MDX. Add images via Astro's pipeline.
```

Projects use `src/content/projects/*.mdx`; videos use `src/content/videos/*.mdx` (set `provider`
and either `videoId` or `url`). Then `npm run dev` to preview, commit, push, PR.

**From your phone (Pages CMS):**
1. Go to **app.pagescms.org** and sign in with GitHub (it uses your login — no tokens in the repo).
2. Open the `jplepecki.tech` repo; you'll see **Projects / Blog posts / Videos / Now page**
   (from `.pages.yml`).
3. Add or edit an entry, upload images (they go to `src/assets/uploads/`), and save — Pages CMS
   commits to GitHub. Commit to a branch and open a PR, or (once you trust it) to `main` to deploy.

## 7. Commands

- `npm run dev` — local dev server.
- `npm run build` — Astro build **then** Pagefind index.
- `npm run preview` — preview the built `dist`.
- `node scripts/screenshots.mjs` — regenerate review screenshots (needs `npm run preview` running;
  this script + `.review-screens/` are review-only and gitignored).

## 8. Known follow-ups (optional, not blockers)

- `npm audit` shows 2 moderate advisories in dev/transitive deps. I didn't force-fix (breaking).
  Run `npm audit` when you like.
- Vimeo videos won't get an auto thumbnail (that needs an API call I avoided — no tokens). YouTube
  thumbnails work. Vimeo falls back to a neutral instrument-style poster.
- Replace the placeholder SVG cover art (`src/assets/covers/`) with real photos of the builds when
  you have them — drop them through the Astro `<Image>` pipeline (keep each under 2 MB).
