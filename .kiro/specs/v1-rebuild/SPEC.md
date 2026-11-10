# SPEC · jplepecki.tech v1 rebuild

## Context

You are rebuilding **jplepecki.tech**, the personal site of João Pedro Lepecki (JP), a self-taught maker working on embedded systems and hardware. The site is the deeper, more technical home behind his posts on X. Visitors should leave thinking he is self-taught, deeply technical, hardworking and good at engineering decisions. The site never says this directly; the details show it.

JP owns the content, not the code. He writes everything in **Notion** and does not want to touch the codebase to publish. Every published thing comes from Notion automatically.

The design is a **maker's desk seen from above**: a worn green cutting mat with real objects on it. A black circuit board is the main navigation, an ASCII portrait of JP is printed and taped down, there's a polaroid of the current project with a sticky note, a black lab notebook for posts, and a business card for booking a call. Credibility comes from **authentic engineering detail** (part designators like U1 and BT1, "DNP" for unpopulated parts, copper traces, soldering burns, real tool outlines, pencil notes with real numbers), never from generic "tech" styling.

**Hard design rules**

- No generic template look. No hero-with-gradient, no grids of identical cards, no `// 01` section codes, no "System · Active" status gimmicks.
- Long text never sits directly on the mat. Body copy always lives on a solid page or paper object.
- Every placeholder or empty section is **hidden**, never rendered empty. A page must look complete with zero videos and few posts.
- Rotation on objects never exceeds 3°.
- The only gradients allowed are the radial burn marks, stains and the soft shadow under objects.
- Text contrast meets WCAG AA. Every object is a real `<a>` or `<button>` with an accessible name. Respect `prefers-reduced-motion`.

## Locked decisions

| Area | Decision |
|---|---|
| Framework | Astro (current stable), static output, minimal client JS |
| Hosting | Cloudflare Pages, custom domain jplepecki.tech (connected by JP in stage 5) |
| Content source | Notion API at build time via `@notionhq/client`, in a custom Astro content loader |
| Images | Downloaded at build time and served from the site. Notion file URLs expire after about an hour and must never be used in HTML |
| Rebuilds | Cloudflare Pages deploy hook, called hourly by a scheduled GitHub Action, plus manually |
| Analytics | Cloudflare Web Analytics (cookieless, no consent banner) |
| Fonts | JetBrains Mono (labels, metadata, navigation, ASCII), Source Serif 4 (headings and body), self-hosted |
| v1 pages | Home, posts index, post page, Lab Loop page, projects index, `/call` redirect |
| Not in v1 | Music player, Talaria page, snippets, Now page, About page, RSS or newsletter, comments, live sensor data, topic-depth map, Portuguese (keep routes simple so `/pt/` can be added later) |

## Design tokens

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0D0F0E` | Background around the mat, header bar |
| `--mat` | `#2E5C48` | Cutting mat |
| `--mat-line-major` | `rgba(255,255,255,0.30)` every 100px | Bold grid lines |
| `--mat-line-minor` | `rgba(255,255,255,0.13)` every 20px | Fine grid lines |
| `--page` | `#151918` | Dark notebook page under articles |
| `--pcb` | `#141817` | Circuit board, dark business card |
| `--chip` | `#0E1110` | IC bodies on the board |
| `--copper` | `#C89B5C` | Traces and mounting holes |
| `--paper` | `#F1EEE6` | Polaroids, printed portrait |
| `--paper-bright` | `#FBFAF6` | Receipts, schematics, taped sheets |
| `--stake` | `#F4F3EE` | Plant labels |
| `--tape` | `rgba(232,222,190,0.88)` | Masking tape |
| `--sticky` | `#E5C25A` | Sticky note |
| `--text` | `#ECE8DE` | Primary text on dark |
| `--text-body` | `#DADED9` | Article body text |
| `--text-muted` | `#9DA6A1` | Metadata |
| `--text-on-paper` | `#1E2220` | Text on any paper object |
| `--accent` | `#F5B841` | The only accent: current state, LED, "today", book a call |
| `--danger` | `#A12A1C` | Absolute-maximum values on paper |
| `--pencil` | `rgba(255,255,255,0.62)` | Pencil notes on the mat |
| `--dnp` | `#6E6A61`, dashed | Unpopulated parts and future pages |

Type: article body Source Serif 4 at 19px, line-height 1.75. Post title 46px desktop, 32px mobile. Mono labels 11–14px. Nothing below 11px.

---

## Stage 1 · Scaffold

1. On `v1-rebuild`, create the Astro project (the Quartz files were removed in START_HERE step 2).
2. Add the fonts, a global CSS file with the tokens, and one placeholder page with the mat background and JP's name.
3. Add `.env.example` with every variable in the Appendix. Real values never get committed.
4. Connecting the repo to Cloudflare Pages needs JP's login: list it under "Needs JP".

**Acceptance:** `npm run build` passes, `npm run dev` shows the mat page, no secrets committed.

## Stage 2 · Components and a styleguide

Build every component with hardcoded sample data, then a hidden `/styleguide` route that shows each one, labelled, at desktop and phone widths. Match the files in `design/`.

**Desk surface**

- **Mat:** grid from the tokens, a ruler strip of numbers along the top edge, one 45° and one 60° guide line.
- **BurnMark:** small elliptical radial scorch, plus a long "drag" variant. Position and size are props.
- **Stain:** translucent amber flux stain with an irregular border-radius, and a mug-ring variant.
- **ToolOutline:** dashed outlines of a soldering iron, pliers, tweezers and a multimeter, as one SVG layer behind objects.
- **Clutter:** an SVG layer with resistors (correct colour bands), screws, a solder-wire coil, heat-shrink offcuts, wire insulation, jumper-wire offcuts and solder blobs.
- **PencilNote:** places an SVG from `src/assets/notes/` at a set position and rotation. If the file doesn't exist, it falls back to JetBrains Mono text in `--pencil`. Positions come from a per-page JSON file so JP can add reMarkable exports later without code changes.
- **KnifeScores:** a few thin light scratch lines.

**Objects** (each one is a link; on hover it lifts 4px, rotates back to 0° and its shadow deepens)

- **PcbNav:** the black board in SVG, with four copper mounting holes, traces and silkscreen:
  - `U1 PROJECTS` → `/projects`
  - `U2 POSTS` → `/posts`
  - `BT1 LOOP nn`: a battery whose fill is loop day ÷ loop length; links to the current loop's project
  - `D1 NOW`: an LED in `--accent` that pulses every 2s (static under reduced motion)
  - `U4 HOW I WORK` → `/loop`
  - `U3 DNP`: dashed, non-interactive footprint, tooltip "Talaria · coming later"
  - `LS1 DNP`: dashed speaker footprint, tooltip "music · coming later"
  - Silkscreen along the bottom edge: "JPLEPECKI.TECH · REV" and the build month
- **AsciiPortrait:** printed paper, taped at the top, captioned "fig. 1 · the maker". The ASCII is generated at build time from `src/assets/portrait.jpg`: resize with `sharp` to about 48 columns, correct for character aspect ratio, map luminance to the ramp ` .:-=+*#%@`. On desktop hover, crossfade to the real photo. Until the photo exists, hide the object.
- **Polaroid:** photo with a bottom border, optionally with a **StickyNote** overlapping it.
- **StickyNote:** mono text such as "LOOP 01 / day 2/14 / [ build ]".
- **Notebook:** black lab notebook with an elastic band, "LAB NOTEBOOK" and the post count.
- **BusinessCard:** dark card, "JP LEPECKI", "proudly a maker", "book a call →" linking to `/call`.
- **LoopCard:** paper card with the loop drawn in ASCII, linking to `/loop`.
- **SketchCard:** graph-paper card holding an image (the current build sketch), linking to the current build post.
- **ShadowSlot:** dashed outline of a future object (the Talaria insole). Not interactive.

**Paper inside articles**

- **StatusTape:** masking-tape label, e.g. "IN PROGRESS · LOOP 01 · DAY 2/14". Hidden when the post isn't in progress.
- **Receipt:** thermal-receipt styling: store, date, item lines, tax, total.
- **PlantStake:** pot-label shape (pointed bottom via clip-path) with an italic Latin name, role, short note and price.
- **TapedSheet:** any table, printed on `--paper-bright` and taped down. Rows marked as maximum values use `--danger`.
- **BuildLog:** vertical timeline of entries with date, status (done, today, planned) and title. Planned is muted; today uses `--accent`.
- **ContentsCard:** lined index card, sticky in the right margin on desktop, a collapsible button on phones.
- **MarginNote:** handwritten SVG in the left margin on desktop, inline between paragraphs on phones.

**Mobile homepage**

- **CalloutMap:** a scaled-down "photo" of the whole desk with numbered amber balloons on each object.
- **PartsList:** header "PARTS LIST" and "QTY n · n DNP", then numbered rows (number, name, short hint) matching the balloons.

**Acceptance:** `/styleguide` matches `design/` closely, Lighthouse accessibility ≥ 95, every object reachable and usable by keyboard.

## Stage 3 · Notion pipeline

A custom Astro content loader using `@notionhq/client`. All IDs come from environment variables (Appendix). Use the Notion API version that queries **data sources**.

**What to read**

- **Posts** from the "Studies & Blog" data source. Required properties (fail with a clear message if missing): `Title`, `Slug` (text), `Site status` (select: Draft, In progress, Published), `Published date` (date), `Series` (select), `Part` (number), `Excerpt` (text), `Hero` (files). It also has `Status`, `Topics`, `Projects` and `Work`. Only `Site status` = Published or In progress is built (plus Draft when `INCLUDE_DRAFTS=true`). In progress shows the StatusTape.
- **Loops:** `Name`, `Dates`, `Status`, `Stage` (Ask, Study, Build, Ship), `Goal`, `Post target`, `Project`. The loop with Status "In progress" is the current loop.
- **Daily targets:** `Task`, `Done`, `Day`, `KPI`, `Loop`. These feed the BuildLog and the homepage.
- **Projects:** `Name`, `Status`, `What it is`, `Next action`, and the page cover.
- **Content:** `Title`, `Status`, `Format`, `Publish date`, `Loop`. Used to count what shipped this loop.
- **README page** (page ID): the bullet list under the heading "The loop" and the table under "Framework changelog".

**Block rendering** (a custom renderer, not a generic markdown conversion)

| Notion block | Renders as |
|---|---|
| Paragraph, heading 2 and 3, lists, quote, divider, code | Normal article typography |
| Image | Downloaded at build, optimised, shown as a Polaroid |
| Table | TapedSheet. A row whose first cell starts with "MAX" uses the danger style |
| Callout with 🧾 icon | Receipt. Each line is `item │ price`; the last line is `TOTAL │ price` |
| Callout with 🏷️ icon containing a table | A row of PlantStakes. Columns: Name, Role, Note, Price |
| Callout with ✍️ icon containing an image | MarginNote |
| Toggle | Collapsible section |
| YouTube video or embed | Click-to-load facade with a poster image. Never autoplay |
| Anything else | Skipped, with a build warning naming the page and block type |

**BuildLog data:** for a post linked to a loop, show that loop's Daily targets grouped by day. Past days show done targets, today's date (America/New_York) is marked "today", future days with targets show as planned. Generate at build time; mark "today" in the browser so it stays right between rebuilds.

**Images:** every Notion-hosted file is downloaded during the build, hashed, and served through Astro's image pipeline. No Notion file URL may appear in built HTML.

**Acceptance:** the draft post "Planning the setup" (Smart Vivarium part 1) renders with its receipt, plant stakes, table and build log. Two hours after a build, every image still loads. Setting a post to Draft and rebuilding removes it.

## Stage 4 · Pages

**Home `/`**

- **1100px and wider:** the worn-mat desk (`design/home-desktop.html`). A dark header bar with JP's name, "Proudly a maker.", X, LinkedIn, GitHub, email and a Book a call button. On the mat: AsciiPortrait top left, SketchCard, PcbNav near the centre, a Polaroid of the current loop's project (its cover) with a StickyNote showing loop, day and stage at top right, Notebook bottom right, BusinessCard bottom left, LoopCard, ShadowSlot for Talaria. Wear layers behind. Object positions are percentages in one config file. A "tidy the desk" button switches to the PartsList layout and remembers the choice in localStorage.
- **Below 1100px:** `design/home-phone.html`. Header, CalloutMap, PartsList.
- **Live data:** loop day and stage, today's targets, posts shipped against the loop's post target. Day count computed in the browser from the loop's start date.

**Posts `/posts`:** rows on the mat, each a dark strip with date, title, series and part, plus a StatusTape when in progress. Newest first.

**Post `/posts/[slug]`** (`design/post-desktop.html`, `design/post-phone.html`):

- Desktop: three columns on the mat. Left margin for MarginNotes, a dark `--page` article column at most 720px wide, a sticky ContentsCard on the right.
- Order: StatusTape, mono metadata line (series, part, date, reading time), title, excerpt in italics, hero Polaroid, body blocks, then previous and next part links.
- Phone: the mat becomes a 12px frame around the page; contents become a collapsible button.

**Lab Loop `/loop`** (`design/loop-desktop.html`): a schematic printout taped to the mat, one SVG component with four ICs (ASK, STUDY, BUILD, SHIP) in a ring with arrowheads, a CLK oscillator labelled with the loop length, output pins from SHIP (posts, video, tweets), a dashed feedback path through a resistor "R_retro · 1 change per loop", and a red "● YOU ARE HERE" label bound to the current loop's stage and day. Below: a NOTES block in uppercase mono from the README "The loop" list, a revision table (REV, DATE, CHANGE) from the README changelog with letters assigned in order, and a "Loops so far" list.

**Projects `/projects`:** each project as a Polaroid using its Notion cover, with status and "What it is", linking to `/posts?project=<slug>`. Paused projects are muted.

**`/call`:** redirect to `CAL_URL`.

**Every page:** footer with the same social links; an Open Graph image per post, generated from its title on the mat background.

**Acceptance:** each page matches its `design/` file at 1440px and 390px. No empty sections. Lighthouse mobile ≥ 90 for performance and accessibility. Works with JavaScript off, except the live "today" marker and "tidy the desk".

## Stage 5 · Deploy and automation (JP does this with you, not overnight)

1. Connect the repo to Cloudflare Pages; add the jplepecki.tech custom domain; give JP exact DNS steps for his registrar. Keep GitHub Pages serving until the new site is live.
2. Create a deploy hook and a GitHub Action that calls it hourly and on demand.
3. Enable Cloudflare Web Analytics.
4. Write `PUBLISHING.md`: how to publish from Notion, what each callout icon does, how to add a handwritten note, how to trigger a rebuild.

**Acceptance:** a post published in Notion is live within an hour without touching the repo.

---

## Appendix · Environment variables

- `NOTION_TOKEN` (secret)
- `NOTION_DS_STUDIES` = `62023507-b88f-4671-b411-f48fb6002210`
- `NOTION_DS_LOOPS` = `acd8a00f-5489-48ab-9def-f62c78b8f03a`
- `NOTION_DS_DAILY_TARGETS` = `66fc6189-5deb-443a-8f00-a2d2cb10b7be`
- `NOTION_DS_PROJECTS` = `22011a36-52e5-4a1a-a979-20a4f79182eb`
- `NOTION_DS_CONTENT` = `ffdd5941-7382-429f-80c8-65c481f11af4`
- `NOTION_DS_WORK` = `9e6d24df-2ca2-4dfe-bef5-aae549ee119d`
- `NOTION_PAGE_README` = `41369ce9-5771-8156-902d-f478847171d5`
- `INCLUDE_DRAFTS` (local only)
- `CAL_URL`
- `CF_DEPLOY_HOOK_URL` (GitHub secret only)
