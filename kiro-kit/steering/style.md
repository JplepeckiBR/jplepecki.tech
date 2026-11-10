# Style — jplepecki.tech

Concept: **a maker's desk seen from above.** A worn green cutting mat with real objects on it. A black
circuit board is the main navigation; an ASCII portrait of JP is printed and taped down; posts are a
black lab notebook; booking a call is a business card. Credibility comes from authentic engineering
detail (part designators U1/BT1/D1, "DNP" for unpopulated parts, copper traces, soldering burns, tool
outlines, pencil notes with real numbers), never from generic "tech" styling.

The approved mockups are in `design/` (see its README). They are the visual source of truth.

## Explicitly avoid

The previous "field instrument / lab notebook" look: `// 01` section codes, `STATUS: ACTIVE` mono
labels everywhere, reference numbers like "FN-2025-0042", title blocks on every page. Also: gradients
(except burn marks, stains and object shadows), glassmorphism, emoji, identical card grids, centred
hero sections, bouncing hover effects.

## Rules

- Long text never sits directly on the mat. Body copy lives on a solid page or paper object.
- Object rotation never exceeds 3°.
- One accent colour only: `#F5B841`, for current state (today, current stage, LED, book a call).
- Fonts: JetBrains Mono for labels, metadata, navigation and ASCII. Source Serif 4 for headings and
  body. Self-hosted. Article body 19px, line-height 1.75.
- Desktop home (≥1100px) is the desk. Below 1100px it is the callout map + parts list.
- WCAG AA contrast, every object a real link or button, `prefers-reduced-motion` respected.

## Tokens

ink #0D0F0E · mat #2E5C48 · grid major rgba(255,255,255,.30)/100px · grid minor rgba(255,255,255,.13)/20px
page #151918 · pcb #141817 · chip #0E1110 · copper #C89B5C · paper #F1EEE6 · paper-bright #FBFAF6
stake #F4F3EE · tape rgba(232,222,190,.88) · sticky #E5C25A · text #ECE8DE · text-body #DADED9
text-muted #9DA6A1 · text-on-paper #1E2220 · accent #F5B841 · danger #A12A1C
pencil rgba(255,255,255,.62) · dnp #6E6A61 (dashed)
