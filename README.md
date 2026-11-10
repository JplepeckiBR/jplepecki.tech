# jplepecki.tech

JP Lepecki's static Astro site. Published posts, loops, and projects are loaded from Notion at build time. Without a `NOTION_TOKEN`, local and pull-request builds use `fixtures/notion.json`.

## Local development

```powershell
npm ci
npm run dev
```

Open `http://localhost:4321`. Copy `.env.example` to `.env` only when testing the real Notion workspace; `.env` is ignored.

## Checks

```powershell
npm run build
npm run screenshots
```

The screenshot script expects a server at `http://localhost:4321` and writes the overnight review set to `review/v1-rebuild/`.
