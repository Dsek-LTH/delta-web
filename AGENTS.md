## Project

Astro v7 SSR site (`output: "server"`) for the DELTA career fair, built on Bun.
Uses Tailwind CSS v4 (CSS-first config), Better Auth with Authentik OIDC, SQLite via Drizzle ORM, and i18n (Swedish default, English).
All components are pure Astro with vanilla JS `<script>` blocks — no React, Vue, or Svelte.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

The dev server runs on port **8080** (not the Astro default).

## Key Commands

| Command | Purpose |
|---------|---------|
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun preview` | Build and run production locally |
| `bun lint` | ESLint check |
| `bun format:check` | Prettier check |
| `bun format:fix` | Prettier auto-fix |
| `bun generate` | Generate Drizzle migration from schema |
| `bun migrate` | Apply database migrations |
| `bun seed` | Seed database (idempotent) |
| `bun seed:reset` | Clear and re-seed database |

## Code Conventions

- **Formatting**: Prettier — 2-space indent, double quotes, semicolons, trailing commas.
- **Linting**: ESLint with `eslint-plugin-astro`.
- **Imports**: Use the `@/` alias (maps to `src/`). Prefer absolute over relative imports.
- **Type imports**: Use `import type` for type-only imports.
- **Components**: PascalCase `.astro` files. Destructure props with `class: className` aliasing:
  ```astro
  ---
  const { class: className, ...rest } = Astro.props;
  ---
  ```
- **Utility files**: camelCase `.ts` files.
- **Translations**: JSON files in `src/i18n/translations/` with a `prefix` field for namespacing.
- **Database schema**: Defined in `src/db/schema.ts` using Drizzle ORM. Run `bun generate` after changes.

## Database Workflow

1. Edit `src/db/schema.ts`
2. `bun generate` to create a migration
3. `bun migrate` to apply it
4. `bun seed` to populate base data, or `bun seed:reset` for a full reset

## Commit Conventions

Conventional Commits are enforced by CI. Format:

```
type(scope): lowercase description
```

Types: `feat`, `fix`, `docs`, `build`, `style`, `refactor`, `perf`, `test`, `ci`, `chore`, `revert`.
Common scopes: `components`, `i18n`, `db`, `auth`, `docker`, `config`, `tooling`.

## Docker

Local testing with Podman (preferred) or Docker:

```bash
podman-compose up -d
podman-compose down
```

`Dockerfile.release` builds the app, `Dockerfile.tools` runs migrations and seeding.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
