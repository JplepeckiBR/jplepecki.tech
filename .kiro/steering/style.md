# Style — jplepecki.tech

Concept: **field instrument / lab notebook.** The readout of a piece of test equipment crossed
with an engineer's notebook. Bespoke, restrained, editorial. Never generic-AI.

## Explicitly avoid

Purple/blue gradients, glassmorphism, floating blobs, emoji bullets, "Hi, I'm JP 👋" heroes, three
identical icon cards, stock illustrations, generic Inter-everything, centered-everything layouts,
gratuitous scroll animations, bouncing hover effects.

## Palette

- One accent only: signal orange ≈ `#FF5A1F`, used sparingly for status, links, live data.
- Dark (default): graphite background (not pure #000, ~`#14151a`), warm off-white text.
- Light: paper-white background, same accent. Follow `prefers-color-scheme` + a manual toggle that
  persists and does not flash (set theme in an inline head script).
- Contrast must meet WCAG AA in both themes.

## Type

- Headings/body: a characterful grotesk (Space Grotesk). Self-hosted woff2, `font-display: swap`.
- Monospace (IBM Plex Mono) for metadata, labels, dates, spec tables, tags. Uppercase mono labels
  like `STATUS: ACTIVE`, `MCU: nRF52840`.

## Layout

- Left-aligned editorial grid, generous whitespace, visible hairline rules, small uppercase mono
  labels. Asymmetric home layout — not a stack of centered sections.
- Project cards: status light, dates, stack in mono, one strong image. Hover is subtle.
- Blog: ~68ch measure, excellent Shiki code blocks matched to the palette, figures with captions,
  footnotes.

## Signature element

Hero sensor-trace: a small, live-looking procedural waveform (gait-pressure nod to StrideSense).
<5 KB JS, pauses off-screen, static frame under `prefers-reduced-motion`, degrades without JS.

## Footer touches

Rio ↔ Boston local time; a "last built" timestamp + short commit hash.

## Quality bar

Mobile-first, excellent at 360–430px: no horizontal scroll, tap targets ≥44px, readable without
zoom. Semantic HTML, skip link, focus-visible styles, alt text required by schema. No CLS from
fonts/images. No console errors.
