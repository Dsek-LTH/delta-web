---
name: design-review
description: Audit delta-web UI changes for layout consistency and compliance with the project design system (DESIGN.md). Use when reviewing UI pull requests, checking look and feel, verifying light/dark parity, contrast, responsive layout, or token usage. Enforces our rules without overriding the brand.
license: MIT
---

# Design review (delta-web)

Source of truth: `DESIGN.md` plus the tokens in `src/styles/global.css`. This skill checks
that the brand is applied consistently — it never redesigns it. If anything here
contradicts `DESIGN.md`, `DESIGN.md` wins.

## Brand — do not "fix" these

- The terminal motif (`> DELTΔ_`, blinking caret, `--force`/kicker jokes) is intentional.
- Pink/purple palette, frosted glass on floating surfaces, glow for active state, and the
  custom cursor are identity, not accidents.
- Do not replace brand flourishes with generic minimalism. Findings should be phrased
  inside our token system.

## Workflow

1. Start a dev server on a free port: `bun astro dev --background --port <port>` (stop with
   `bun astro dev stop`). If pages need data: `bun migrate && bun seed`.
2. Screenshot matrix with headless Chrome/Chromedriver: 390 / 768 / 1440 / 1920 px, each in
   light and dark (set `localStorage.theme` then reload). Cover top, middle, footer, and any
   expanded/hover states.
3. Measure, don't eyeball: computed `color` vs the element's real background (WCAG 4.5:1 body,
   3:1 large text), and `document.documentElement.scrollWidth` for horizontal overflow.
4. Toolchain: `bun check`, `bun lint`, `bun format:check`, `bun run build`.

## Rules to enforce

- Components consume semantic tokens only (`text-card-content`, `bg-card-highlight`,
  `brand-primary`, `border-border`…). Flag raw palette utilities (`text-white`, `text-slate-*`)
  or brand primitives used directly in components.
- Radii: surfaces `rounded-2xl`, controls `rounded-xl`, pills `rounded-full`. Shadows use the
  `.frosted-glass` scale — no per-component `shadow-black/70`-style hacks.
- `.frosted-glass` is for floating/elevated surfaces only; `.field` for inputs; `.btn*` for
  buttons.
- Glow only for active/current state. Hover is a color/background change; motion on hover is
  gated behind `@media (hover: hover) and (pointer: fine)`.
- Both themes must be intentional. No light text on light surfaces; no dark text on dark.
- Motion: prefer `transform`/`opacity`; durations ≤ 300ms; keep `prefers-reduced-motion`;
  avoid `transition: all`.
- Typography: Inter (`font-sans`) body, Noto Sans (`font-display`) wordmark, Noto Sans Mono
  (`font-mono`) for terminal/data accents. Prices and IDs use `tabular-nums`.
- i18n: any new copy needs both `sv` and `en`, using the existing prefix/namespace setup.

## Known traps (found in production reviews)

- `text-brand-secondary` (white) on pale surfaces — use `text-card-content`.
- Percentage-only image widths (e.g. `max-w-1/3`) overflow on mobile — give a fixed small-screen
  width and a clamp on the card.
- `2xl:px-90` narrows content on wide screens — check 1920 px.
- Collapsible panels stacked in a flex column leave gaps when hidden — use one host element and
  remove it from layout when closed.
- The custom cursor must not use `!important` on `*`; inputs keep the native text cursor.

## Output

Findings as `file:line` with severity (blocker / should-fix / nit) and a one-line fix phrased
in our tokens. End with the screenshot matrix that was checked and any states that could not be
verified (e.g. pages behind auth).
