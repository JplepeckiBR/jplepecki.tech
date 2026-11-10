# START HERE — overnight run for jplepecki.tech

JP is asleep. Work through every step below on your own, in order, without waiting for him.
The full spec is `kiro-kit/SPEC.md`. The approved mockups are in `kiro-kit/design/`.

## Ground rules for the whole run

1. Work only on a new branch named `v1-rebuild`. Never commit to or push to `main`. Never force-push.
   Never delete or rewrite the branches `quartz-archive`, `portfolio-v1` or any other existing branch.
2. Never delete files that aren't committed. If you find uncommitted work, protect it first (step 0).
3. Do not touch DNS, the jplepecki.tech domain, Cloudflare account settings or GitHub Pages settings.
   Skip SPEC stage 5 entirely.
4. Never invent content about JP or write in his voice. Missing photos and text stay as
   `TODO(JP): …` and must never render on a page.
5. If something only JP can do blocks you (a secret, an account, a login, a photo, a decision), write
   it under "Needs JP" in `PROGRESS.md` and move on to the next thing you can do. Don't stop the run.
6. After every step and every stage, commit with a message starting with the step or stage number,
   and update `PROGRESS.md` with what passed, what failed and what needs JP.
7. Prefer finishing stages 1 and 2 well over starting stage 4 badly.
8. No screenshots-for-approval are needed tonight. The rules in `steering/review.md` start tomorrow.

## Step 0 · Audit this folder before changing anything

This folder is JP's local copy of the repo `JplepeckiBR/jplepecki.tech`. Before touching anything:

- Run `git status`, `git branch -a`, `git stash list` and `git log --oneline -15`, and `git fetch`.
- Compare the local `main` with `origin/main`. List any local commits not on GitHub and any
  uncommitted or untracked files (ignore `node_modules/` and build output).
- If there is uncommitted or unpushed work, commit it to a new branch named
  `local-backup-<today's date>` and push that branch, so nothing can be lost.
- Look for anything not on GitHub that matters: `.kiro/` specs, notes, images, `.env` files
  (never print secret values; only note that they exist).
- Write all findings at the top of `PROGRESS.md` under "Step 0 · Audit".

## Step 1 · Set up the branch and Kiro's instructions

- Create `quartz-archive` from the current `main` if it doesn't exist yet, and push it.
- Create `v1-rebuild` from `main`.
- Replace the files in `.kiro/steering/` with the four files in `kiro-kit/steering/`
  (product.md, style.md, tech.md, review.md). The old steering files describe a design and stack
  that are no longer used; the new ones win in any conflict.
- Move `.kiro/specs/portfolio-v1/` to `.kiro/specs/_archive/portfolio-v1/`.
- Copy `kiro-kit/SPEC.md` to `.kiro/specs/v1-rebuild/SPEC.md` and `kiro-kit/design/` to `design/`
  at the repo root.

## Step 2 · Remove the old site, keep what's reusable

- Before deleting anything, copy the Obsidian post `obsidian_posts/Smart Vivarium.md` (and any images
  it uses) to `archive/obsidian/`. It is JP's own research and will move into Notion later.
- Remove the Quartz project: `quartz/`, `docs/`, `quartz.config.ts`, `quartz.layout.ts`,
  `Dockerfile`, `CODE_OF_CONDUCT.md`, `globals.d.ts`, `index.d.ts`, `.review-screens/`,
  `obsidian_posts/` (after the copy above), and the Quartz `package.json` and lockfile.
- From the `portfolio-v1` branch, bring these files back and adapt them to the new design and stack
  instead of writing them from scratch:
  `src/lib/og.ts` and `src/assets/og-fonts/` (switch to the new fonts and colours),
  `src/components/VideoEmbed.astro`, `src/components/BaseHead.astro`, `src/lib/buildinfo.ts`,
  `scripts/screenshots.mjs` (update its route list to the new pages).
- Do not bring back anything else from `portfolio-v1`: not its design tokens, components, pages or
  project write-ups.
- Replace `.github/workflows/deploy.yml` (GitHub Pages) with a build-only check on pull requests.
  Deployment moves to Cloudflare Pages in stage 5, which is JP's job.

## Step 3 · Build SPEC stages 1 to 4

Follow `kiro-kit/SPEC.md`, stages 1 to 4, in order. Notes for tonight:

- Stage 1, item 4 (connecting Cloudflare Pages) needs JP's login. Skip it and add it to "Needs JP".
  Everything else in stage 1 runs locally.
- Stage 3: if `NOTION_TOKEN` is set in `.env`, build against the real Notion workspace with
  `INCLUDE_DRAFTS=true` so the draft post renders locally. If it isn't set, build the loader against
  a fixture file `fixtures/notion.json` that matches the schemas in the spec, make the real loader
  switch on automatically when the token exists, and keep going.
- Run each stage's acceptance check yourself as far as you can. Use `scripts/screenshots.mjs` to
  save screenshots of every page at 1440px and 390px into `review/v1-rebuild/`, so JP can compare
  them with `design/` in the morning.

## Step 4 · Morning report

Finish `PROGRESS.md` with:

1. A five-line summary: what works, what doesn't, and how to see it (`npm run dev`, and which URLs).
2. "Needs JP": every action only he can do, in the order he should do them, each in one sentence.
3. Where the screenshots are, and which pages differ most from `design/`.
4. Anything in the spec you think is wrong or risky, with a short reason.

Push `v1-rebuild` so JP can review it on GitHub.
