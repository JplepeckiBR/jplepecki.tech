# v1-rebuild progress

## Step 0 · Audit

- **Starting branch:** `quartz-obsidian-site` at `d05312c`, the same commit as the refreshed `origin/main`.
- **Remote state:** GitHub has `main` at `d05312c`, `portfolio-v1` at `d62a71f`, and `quartz-obsidian-site` at `676321d`. Local `main` started 21 commits behind `origin/main` with no local-only commits.
- **Fetch:** the configured default fetch failed because it still targets deleted remote branch `v5`; explicit fetches refreshed `origin/main` and `origin/portfolio-v1` successfully. The repository git config was left unchanged.
- **Working tree:** the only untracked source material was `kiro-kit/` (12 files: the overnight instructions, full spec, four steering files, and five HTML mockups plus their README). It is protected on `local-backup-2026-11-09`.
- **Stashes:** none.
- **Local-only refs:** 18 Kiro agent checkpoint commits exist outside remote refs; they were left untouched. No active-branch commit was absent from GitHub.
- **Kiro files:** `.kiro/specs/portfolio-v1/` and `.kiro/steering/{product,style,tech}.md` are tracked on GitHub.
- **Notes and images:** `obsidian_posts/Smart Vivarium.md` and its PNG are tracked. `.review-screens/` images are tracked. Ignored `public/` contains generated Quartz output, and `node_modules/`, `quartz/.quartz-cache/`, and `tsconfig.tsbuildinfo` are ignored build/dependency output.
- **Environment files:** no `.env` file was found, so no local secrets were present to inspect or expose.
- **Result:** audit passed. The untracked overnight kit and this report were committed and pushed to the dated backup branch before rebuild work began.

## Needs JP

- None from Step 0.

## Step 1 · Branch and Kiro setup

- **Archive:** created `quartz-archive` from refreshed `main` (`d05312c`) and pushed it to GitHub.
- **Rebuild branch:** created `v1-rebuild` from refreshed `main`; all subsequent work stays on this branch.
- **Steering:** replaced the old product, style, and tech rules and added the overnight review rule from `kiro-kit/steering/`.
- **Specs:** moved the previous `portfolio-v1` spec into `.kiro/specs/_archive/portfolio-v1/` and copied the rebuild spec to `.kiro/specs/v1-rebuild/SPEC.md`.
- **Design references:** copied all six approved reference files into root `design/`; hashes match `kiro-kit/design/`.
- **Result:** Step 1 passed.

## Needs JP · Step 1

- None.

## Step 2 · Remove Quartz and keep reusable work

- **Research archive:** copied `obsidian_posts/Smart Vivarium.md` to `archive/obsidian/` before removal. Its article images are remote URLs; the only local PNG in the Obsidian folder was also preserved with a matching hash.
- **Local generated output:** moved the ignored Quartz `public/` build and `.quartz-cache/` into ignored `archive/local-build/` instead of deleting uncommitted files.
- **Quartz removal:** removed the specified Quartz source, docs, declarations, screenshots, Obsidian source folder, container file, package manifest, and lockfile. The `quartz-archive` branch retains the complete previous site.
- **Approved reuse only:** restored only `og.ts`, the OG font directory, `VideoEmbed.astro`, `BaseHead.astro`, `buildinfo.ts`, and `scripts/screenshots.mjs` from `portfolio-v1`.
- **Adaptations:** replaced the old typography with licensed Source Serif 4 and JetBrains Mono assets, rebuilt the OG visual as a cutting-mat/notebook object, removed video autoplay and empty states, added Cloudflare commit metadata, and changed screenshots to the new routes, widths, and `review/v1-rebuild/` output.
- **Workflow:** replaced GitHub Pages deployment with a pull-request-only `npm ci` + `npm run build` check and read-only contents permission.
- **Result:** Step 2 passed. Runtime validation follows after the new Astro scaffold exists.

## Needs JP · Step 2

- None.

## Stage 1 · Astro scaffold

- **Scaffold:** created a strict static Astro 7.4.8 project with `site: https://jplepecki.tech`, Node 24, a reproducible lockfile, and small dev/build/preview/screenshot scripts.
- **Visual base:** added the complete maker-desk token set, mat grid, self-hosted Source Serif 4 and JetBrains Mono, accessible global defaults, a skip link, and the initial JP nameplate page.
- **Environment contract:** added `.env.example` with every Appendix variable and blank secret/account values; no real `.env` exists or is tracked.
- **Acceptance:** `npm run build` passes and emits `/`; `npm audit --omit=dev` reports 0 vulnerabilities after a compatible transitive override.
- **Result:** Stage 1 passed locally.

## Needs JP · Stage 1

- Connect `JplepeckiBR/jplepecki.tech` to Cloudflare Pages after reviewing this branch; this requires JP's Cloudflare login and is intentionally deferred to SPEC Stage 5.

## Stage 2 · Components and styleguide

- **Desk surface:** built the cutting mat/ruler/angle guides, radial burns, drag scorch, flux stains, mug ring, tool-outline layer, knife scores, authentic resistor/screw/wire/solder clutter, and JSON-positioned pencil notes.
- **Desk objects:** built the linked PCB navigation, guarded ASCII portrait, polaroid/sticky, notebook, business card, loop card, sketch card, Talaria shadow slot, phone callout map, and synchronized parts list. Interactive objects use real links, 44px targets, restrained lift, and reduced-motion fallbacks.
- **Article objects:** built StatusTape, semantic receipt, PlantStake, taped accessible tables, live New York BuildLog, desktop/mobile ContentsCard, MarginNote, and the no-autoplay video facade.
- **Styleguide:** `/styleguide` renders the component bench with neutral sample data, is omitted from public navigation, and carries `noindex, nofollow`.
- **Acceptance:** `npm run build` passes; all components compile; placeholder scans found no rendered mockup/TODO text; Lighthouse accessibility for `/styleguide` is **100** (target ≥95).
- **Result:** Stage 2 passed. Final 1440px and 390px screenshots will be regenerated after all routes exist.

## Needs JP · Stage 2

- Add `src/assets/portrait.jpg` later if the taped ASCII portrait should appear; the component intentionally stays hidden without a real JP photo.
- Export any handwritten reMarkable notes as SVG files into `src/assets/notes/`; mono pencil text is the current graceful fallback.
