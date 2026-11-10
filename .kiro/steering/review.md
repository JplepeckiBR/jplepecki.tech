# Review — how JP approves changes

JP needs to SEE a change before it happens. Visuals are mandatory for every change JP will look at.
(The one exception is an unattended overnight run started from kiro-kit/START_HERE.md.)

For any change that affects how the site looks or what it shows:

1. Restate the change in one plain sentence and wait for JP to confirm you understood it.
2. Work on a new branch named `change/<short-name>`. Never on `main`.
3. Take BEFORE and AFTER screenshots with `scripts/screenshots.mjs` at 1440px and 390px wide, for
   every page the change touches. Save them to `review/<short-name>/before/` and `.../after/`.
4. Show JP the after screenshots next to the before ones in this chat, and give the Cloudflare Pages
   preview link for the branch if it exists.
5. If there are real alternatives, make up to 3 options, screenshot each, and let JP pick.
6. Merge only after JP says yes. If he says "no" or "close", iterate on the same branch.

Never change the design system (tokens, fonts, the desk concept) without showing JP options first.
