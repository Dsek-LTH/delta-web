# DELTA web design system

How the DELTA career fair site looks, moves, and is built. Written for contributors **and
AI agents**: follow it unless there is a strong reason not to, and update it when the system
changes. `AGENTS.md` covers tooling and workflow; this file covers design.

---

## 1. Identity — do not “fix” these

These are deliberate brand signatures, not accidents:

- **Terminal motif**: the `> DELTΔ_` wordmark with blinking caret, `--force`/command cues, and
  mono accents. Used as a signature, not wallpaper.
- **Palette**: pink primary (`#f280a1`, deepened in light mode), purple/violet accents, D-sek
  blue for links in light mode.
- **Frosted glass** on floating surfaces, over a soft radial gradient backdrop.
- **Glow** only for active/current state (e.g. the current nav item).
- **Playful details**: tilt cards on the landing page, Δ bullets, custom cursor, countdown in
  Noto Sans Mono.

If you are tempted to “modernize” one of these, don’t do it in a drive-by PR — propose it as a
redesign with this document updated.

## 2. Principles

1. **Semantic tokens only.** Components consume roles (`text-card-content`, `bg-card-highlight`,
   `border-border`, …) — never raw palette utilities (`text-slate-*`, `text-white`) and never
   hex values.
2. **Restraint in effects.** One signature per element. No stacked glow + shadow + scale +
   gradient on the same control.
3. **Brand lives in detail, facts stay plain.** Mono type, Δ marks, terminal cues and tabular
   numbers carry personality; prices, guarantees and contact info stay exact and credible.
4. **Progressive disclosure over walls of text.** Show the first paragraph, keep long copy
   behind a fold (see §4 Fold panels).
5. **Motion with purpose.** Enters animate, rapid/keyboard actions do not. Everything honors
   `prefers-reduced-motion`.
6. **Accessibility floor**: WCAG AA contrast (4.5:1 body, 3:1 large text), keyboard reachable,
   information never hidden behind hover only.

## 3. Foundations

### 3.1 Color tokens (`src/styles/global.css`)

| Role              | Utilities                                     | Light             | Dark                          |
| ----------------- | --------------------------------------------- | ----------------- | ----------------------------- |
| Accent / headings | `text-brand-primary`, `bg-brand-primary`      | `#c9457a`         | `#f280a1`                     |
| Text              | `text-card-content` / `text-backdrop-content` | slate-950         | slate-100                     |
| Muted text        | `text-card-content-muted`                     | slate-600         | slate-400                     |
| Links             | `text-backdrop-content-highlight`             | D-sek blue        | violet-400                    |
| Surfaces          | `bg-card`, `bg-card-highlight`                | white 55% / 85%   | slate-900 60% / slate-800 80% |
| Border            | `border-border`, `ring-border`                | slate-950 10%     | white 14%                     |
| Page backdrop     | `bg-backdrop` + `--gradient-backdrop`         | white + pink wash | slate-950 + indigo            |
| Glow              | `text-shadow-glow` (`--color-glow`)           | purple            | white                         |
| Destructive       | `.btn-danger`, feedback                       | red-600           | red-500                       |

**Package tier colors** (for company packages): `bronze`, `silver`, `gold`, `diamond`,
`amethyst`, `emerald` — each has a light (darkened for contrast) and dark (bright) value.

**Documented exceptions** — the only allowed raw colors:

- `text-white` on the photo hero (with `Logo inverse`) and on saturated accent buttons
  (e.g. the emerald Main Sponsor CTA with `dark:text-slate-950`).

### 3.2 Typography

- `font-sans` = **Inter** (body, UI) · `font-display` = **Noto Sans** (wordmark) ·
  `font-mono` = **Noto Sans Mono** (terminal accents, prices, counts, IDs).
- Do not add font families. Prices/IDs/counts use `font-mono` + `tabular-nums`.
- Headings: page `h1` `text-4xl → lg:text-6xl`; section `h2` `text-3xl → lg:text-4xl/5xl`;
  card titles `text-2xl → text-3xl`. Uppercase only for section headings.
- Typographic details: en dash for ranges (`08:00–17:00`), `first-letter:uppercase` for dates
  (Swedish month names stay lowercase), `text-balance` on display copy.

### 3.3 Surfaces, radii, shadows

- `.frosted-glass` — floating/elevated surfaces only (navbar, cards, pickers, panels): blur,
  soft shadow, hairline ring, inner edge highlight.
- Flat surfaces — content blocks inside cards (`bg-card-highlight/40`), placeholders, media.
- Radii: **surfaces `rounded-2xl` · controls `rounded-xl` · pills `rounded-full`**.
- Shadows: one soft scale via `.frosted-glass`; no per-component `shadow-black/70` hacks.

### 3.4 Motion

- **Durations**: UI transitions 200–300 ms; press feedback ≤ 200 ms; page-entry reveals ≤ 450 ms.
- **Easing**: enters use the strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; on-screen
  movement uses ease-in-out; hover/color uses `ease`; never `ease-in`.
- **Properties**: prefer `transform`/`opacity`. Fold panels animate `grid-template-rows` on the
  wrapper plus opacity/translate on the inner panel.
- **Enter reveals**: hero blocks use `animate-rise`; content below the first screen uses
  `.reveal` (shared IntersectionObserver in `Layout`) — 550 ms opacity/translate, only once it
  enters the viewport. The hidden state is gated behind `html.js`, so no-JS users see everything.
- **Position feedback**: the student timeline rail fill tracks scroll position directly
  (rAF-throttled, no timed animation). It is an indicator, not decoration, so it stays under
  reduced motion.
- **Hover**: color/background changes only. Motion on hover must be gated behind
  `@media (hover: hover) and (pointer: fine)` — touch fires false hovers.
- **Never** animate keyboard-initiated or rapid actions; never reveal required information on
  hover only.
- `prefers-reduced-motion: reduce` zeroes animation/transition durations globally
  (including `::details-content`).

### 3.5 Folds (expandable content)

Accordions, “read more” and package details all use one pattern — **not** native `<details>`:

```html
<button data-fold-toggle aria-expanded="false" aria-controls="ID">…</button>
<div id="ID" class="fold-wrap" inert>
  <div class="fold-panel">…content…</div>
</div>
```

- CSS: `.fold-wrap` (grid rows `0fr → 1fr`) + `.fold-panel` (overflow hidden, fade/slide).
- JS: one delegated listener in `Layout.astro` toggles `data-open`, `inert` and `aria-expanded`.
- Why not `<details>`: animating `::details-content` only works in Chromium; the fold pattern
  above animates in every browser and gives correct a11y states.

## 4. Components

| Component         | Location                                           | Rules                                                                                           |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `Logo`            | `src/components/Logo.astro`                        | Wordmark. Props: `animate` (caret), `command` (`--force`), `inverse` (light text on photos).    |
| `Countdown`       | `src/components/Countdown.astro`                   | Mono, theme-aware; sits under a wordmark.                                                       |
| `Card`            | `src/components/Card.astro`                        | Frosted surface. `animate={true}` (tilt + shimmer) only on the landing hero.                    |
| Buttons           | `.btn` + `.btn-accent/.btn-danger/.btn-ghost`      | `active:scale-[0.98]`, explicit transitions, focus-visible ring.                                |
| Fields            | `.field` (`TextInput`, `SelectInput`, `FileInput`) | Border + focus ring, no glass on controls.                                                      |
| Fold panels       | §3.5                                               | Read more, FAQ, package details. One open at a time per group.                                  |
| Team tiles        | `src/pages/project-group/TeamTile.astro`           | Photo/placeholder + `> Team label NN` header + names with email/GitHub/LinkedIn always visible. |
| Photo placeholder | `src/pages/project-group/PhotoPlaceholder.astro`   | Group silhouette (2+ people) / profile silhouette (single).                                     |
| Package cards     | `src/pages/company/index.astro`                    | Quiet entry pair → three core packages → featured top tier; details open **after their group**. |
| Package details   | `src/components/company/PackageDetails.astro`      | Full description: bold intro, subtitle, `Paketet innehåller:` Δ list, closing, CTA.             |
| Pricing table     | `src/components/company/PricingTable.astro`        | Comparison matrix; equivalent tiers merged into one column; horizontal scroll allowed.          |
| Timeline          | `src/pages/student/index.astro`                    | Rail + Δ marker centered on each card; alternating sides from `lg`.                             |
| Card content      | `src/pages/student/CardContent.astro`              | Lead paragraph + fold for the rest.                                                             |
| Timeline rail     | `src/pages/student/index.astro`                    | Track + fill; `--rail-progress` updated on scroll; without JS only the track shows.             |
| Footer mark       | `src/components/Footer.astro`                      | Oversized stroke-only Δ, `aria-hidden`, decorative; footer keeps extra bottom padding.          |

**Team/package photos** auto-load from `src/assets/team/<name>.{webp,jpg,jpeg,png}`:
`all` (whole team), `general`, `it`, `event`, `finance`, `logistics`, `marketing`, `relations`,
`staff`. Missing files fall back to silhouettes — no code change needed to add photos.

## 5. Page patterns

- **Frame**: `flex flex-col items-center gap-16 px-6 py-16 mx-auto max-w-7xl lg:px-16`.
  Always `mx-auto` — a `max-w-*` without it is left-aligned (this shipped once; don’t repeat it).
- **Hero (text)**: wordmark → 64–80 px → tagline → 24 px → mono capability line → 40–48 px →
  contact line. Keep that rhythm.
- **Hero (photo)**: image with a dark scrim, `Logo inverse`, light text.
- **Pricing**: intro → entry pair (quiet) → core packages (full) → top tier (featured, wide) →
  comparison table. Details unfold directly under the clicked group.
- **Long-form pages**: first paragraph + fold per section; never a wall of text.
- **404 / coming soon**: content-hugging card (`max-w-lg`, no inner scroll), pale gradient.
- **Footer**: plain on the backdrop gradient (no separate background); contact columns.

## 6. Content & i18n

- Swedish is the default language; **every string exists in `en` and `sv`**
  (`src/i18n/translations/**`, prefix per file). No hardcoded copy.
- Tone: confident and plain. Brand wink belongs to decorative chrome; prices, guarantees and
  contact facts stay exact. Package copy is verbatim from the official package document.
- Markdown content lives in `src/content/<lang>/`; paragraph structure uses blank lines, not
  `<br><br>` (that renders as one blob).

## 7. Accessibility & QA checklist

- [ ] Contrast measured against the real background: body ≥ 4.5:1, large text ≥ 3:1.
- [ ] Checked both themes at 390 / 768 / 1440 / 1920 px; no horizontal overflow
      (`document.documentElement.scrollWidth ≤ innerWidth`).
- [ ] Keyboard: focus-visible rings; fold toggles expose `aria-expanded`; closed content `inert`.
- [ ] No required information behind hover; tap targets ≥ 24 px.
- [ ] `prefers-reduced-motion` yields instant (but complete) state changes.
- [ ] `bun check` · `bun lint` · `bun format:check` · `bun run build` pass.

## 8. Review process (agents)

- Run the **`design-review`** skill for UI changes — it encodes this document plus the
  screenshot/contrast workflow (Chrome/Chromedriver matrix, computed colors).
- Use **`web-design-guidelines`** for interaction/a11y rules and
  **`review-animations`** / **`improve-animations`** for motion.
- Do **not** apply generic aesthetic skills to restyle the site; propose system changes here
  first, then implement.

## 9. Known traps (from real reviews)

- `max-w-*` without `mx-auto` → left-aligned page.
- Raw `text-brand-secondary` (white) on pale surfaces → invisible; use `text-card-content`.
- Percentage-only image widths (`max-w-1/3`) overflow on mobile — give a fixed small-screen width.
- Oversized `2xl:px-*` narrows content on wide screens; verify at 1920.
- Hidden children of a flex column still contribute `gap` — keep collapsed content out of layout
  (single host per group, `hidden` when closed).
- Native `<details>` animations are Chromium-only — use folds (§3.5).
- Custom cursor is scoped to `body`; never `!important` on `*` (inputs keep the text cursor).
- Lucide no longer ships brand icons — inline SVGs for GitHub/LinkedIn.
- After DB schema changes: `bun generate && bun migrate` (nullable columns to avoid inventing data).

## 10. File map

```
src/styles/global.css            tokens, utilities, folds, reveals, reduced motion
src/layouts/Layout.astro         page frame, theme init, folds, scroll reveals + rail
src/components/                  shared UI (Logo, Countdown, Card, inputs, pickers…)
src/components/company/          PricingTable, PackageDetails
src/pages/company/index.astro    packages page (tiers + layout hierarchy)
src/pages/project-group/         team bento (TeamTile, PhotoPlaceholder)
src/pages/student/               timeline (CardContent, InfoCard, FaqCard)
src/i18n/translations/           all copy, en + sv
src/content/<lang>/              long-form markdown
src/assets/team/                 team photos (auto-loaded by filename)
```

## 11. Concept: one-page scroll (`design/one-page`)

This branch experiments with turning the landing page into one continuous scroll, adapted from
a friend's concept site (Next.js, dark terminal aesthetic) but kept in our language. The nav
items are anchors (`/#foretag`, `/#studenter`, `/#projektgrupp`, `/#besokare`) instead of
subpage links, so navigation only sets scroll position. Subpages stay reachable through the
`Läs hela sidan` links at the end of each chapter.

On top of `design/scroll-polish` this branch adds:

- **Chapters**: hero → För företag → För studenter → Projektgrupp → Deltagare, each a
  `<section id="…" data-nav-section="…">` separated by a hairline border; chapter content is
  reused from the subpages (same components, copy and prices).
- **Active section tracking**: `Navbar` observes the sections (middle ~5% of the viewport) and
  toggles `data-active` on `[data-nav-section-link]` links, styled with `data-[active]:`
  variants.
- **Anchor offset**: `html { scroll-padding-top: 6rem }` compensates for the floating header;
  the hero is `#top`.
- **Hero backdrop scoped to the first viewport** (`h-dvh`), so reading chapters sit on the
  gradient, not on the photo.
- **One countdown per page**: `Countdown` writes into fixed element IDs, so only the hero
  instance exists on the one-pager.

Ideas from the reference we deliberately rejected (kept our identity): canvas particle hero,
typewriter headline, terminal/JSON props, scanlines, dark-only palette, invented stats and
pricing, cursor-spotlight cards, marquee. Package copy and prices stay verbatim from the
official document.
