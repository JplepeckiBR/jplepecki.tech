# jplepecki.tech

This is a Quartz 4 site published from Obsidian notes.

## Content source

Put publishable Markdown notes in [`obsidian_posts/`](./obsidian_posts/). A note
is included only when its YAML frontmatter contains:

```yaml
publish: true
```

Keep private notes, including `NOTES.md`, `RETRO.md`, and `KPI.md`, without that
flag. Quartz's `ExplicitPublish` filter excludes them from the build.

## Local development

```bash
npm ci
npx quartz build --serve -d obsidian_posts
```

The `-d obsidian_posts` argument points Quartz at the Obsidian source folder;
the notes remain the single source of truth and are not copied into another
content tree.

## Publishing

Commit and push a note with `publish: true` to `main`. GitHub Actions builds
Quartz and deploys it to GitHub Pages at `https://jplepecki.tech`.
