# Design system

Short reference for the DELTA web visual language. Keep components inside these rules so
light/dark stay consistent and the identity stays recognizable.

## Identity — keep these

- **Terminal motif**: the `> DELTΔ_` wordmark (mono-adjacent display font, blinking caret,
  `--force` flag joke). Use it for hero/error moments, not as decoration everywhere.
- **Palette**: pink (`--brand-pink` / `--brand-pink-strong` / `--brand-purple`) and D-sek blue
  (`--brand-blue`) for highlights. No raw Tailwind palette colors in components.
- **Frosted glass**: the signature surface for floating elements (navbar, cards).
- **Countdown in mono digits** and the playful custom cursor.

## Tokens

Components must only use semantic tokens/utilities. Never reference `--brand-*` primitives
or built-in Tailwind colors (`text-white`, `text-slate-*`, …) directly, and never hard-code
hex values. If a role is missing, add a token.

| Role            | Utility examples                                                     |
| --------------- | -------------------------------------------------------------------- |
| Page background | `bg-backdrop`, gradient via `--gradient-backdrop`                    |
| Text            | `text-backdrop-content`, `text-backdrop-content-muted`, `-highlight` |
| Surfaces        | `bg-card`, `bg-card-highlight` (hover)                               |
| Borders         | `border-border`, `ring-border`                                       |
| Accent          | `text-brand-primary`, `bg-brand-primary`, `ring-brand-primary`       |
| Glow            | `--color-glow` (only for active/current states)                      |

Both themes define the same token set (`:root` + `html[data-theme="dark"]`). Light mode is
not a patch — new components must look intentional in both.

## Components

- `.frosted-glass` — elevated/floating surfaces only (navbar, cards, pickers). Do not use it
  on form controls or buttons.
- `.field` — text inputs, selects, textareas.
- `.btn` + `.btn-accent` / `.btn-danger` / `.btn-ghost` — buttons.
- Radii: `rounded-2xl` for surfaces, `rounded-xl` for controls, `rounded-full` for pills.
- Shadows: the `.frosted-glass` shadow scale. No per-component `shadow-black/70` hacks.
- Interactions: `transition-colors` + background change (`hover:bg-card-highlight`). Glow and
  scale are reserved for active/current state, not hover decoration.

## Typography

- `font-sans` = Inter (body/UI), `font-display` = Noto Sans (wordmark), `font-mono` =
  Noto Sans Mono (countdown/terminal accents). Do not add new families.

## Documented exceptions

- `text-white` is allowed on photo/inverse contexts (home hero over the cover image) and on
  saturated accent buttons (e.g. the emerald CTA), where semantic text tokens would drop contrast.

## Accessibility checklist for page PRs

- [ ] Test light **and** dark at 390 px and 1440 px.
- [ ] Body text ≥ 4.5:1, large/display text ≥ 3:1 against its actual background.
- [ ] Interactive elements visible and reachable with the keyboard.
- [ ] Run `bun check`, `bun lint`, `bun format:check`, `bun run build`.
