# jplepecki.tech

Personal portfolio + blog for João Pedro "JP" Lepecki. Static [Astro](https://astro.build) site
deployed to GitHub Pages. "Field instrument / lab notebook" design; near-zero client JS.

## Stack

- Astro 7 with content collections (projects, blog, videos) + zod schemas, MDX.
- Plain CSS with custom properties (`src/styles/tokens.css`). Self-hosted fonts.
- Pagefind (static search), RSS, sitemap, build-time Open Graph images (satori + resvg).
- Phone publishing via [Pages CMS](https://pagescms.org) (`.pages.yml`).

## Commands

| Command           | Action                                              |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start the local dev server                          |
| `npm run build`   | Build the site, then generate the Pagefind index    |
| `npm run preview` | Preview the built `dist/` locally                   |

## Content

Add entries under `src/content/{projects,blog,videos}/` (MDX) or edit from your phone via Pages CMS
(app.pagescms.org). See `NOTES_FOR_JP.md` for details, the content model, and outstanding
`TODO(JP)` items.

## Deploy

`.github/workflows/deploy.yml` builds on pull requests (no deploy) and builds + deploys to GitHub
Pages on push to `main` and manual dispatch. No secrets required. `public/CNAME` holds the domain.
