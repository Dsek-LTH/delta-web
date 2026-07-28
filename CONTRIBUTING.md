# Contributing to delta-web

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Bun](https://bun.sh/) — package manager and runtime
- Node.js >= 22.12.0
- [Podman](https://podman.io/) or Docker (optional, for local container testing)
- Git LFS (the repo tracks a large video file)

## Setup

1. Fork and clone the repository.

2. Install dependencies:

   ```bash
   bun install
   ```

   This automatically copies `.env.example` to `.env` and installs git hooks via Lefthook.

3. Configure environment variables in `.env`. Contact the IT managers for Authentik OIDC credentials if you need authentication to work locally.

4. Set up the database:

   ```bash
   bun migrate
   bun seed
   ```

5. Start the dev server:

   ```bash
   bun dev
   ```

   The server runs at `http://localhost:8080`.

## Development workflow

1. Create a branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes.

3. Format and lint your code before committing:

   ```bash
   bun format:fix
   bun lint
   ```

   Git hooks also run Prettier automatically on staged files at commit time, and format/lint checks run before push.

4. Commit with a [Conventional Commit](#commit-messages) message.

5. Push and open a pull request against `main`.

## Code style

Formatting is enforced by Prettier and linting by ESLint. The key rules:

| Convention        | Style                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Indentation       | 2 spaces                                                              |
| Quotes            | Double quotes                                                         |
| Semicolons        | Yes                                                                   |
| Trailing commas   | Yes                                                                   |
| Imports           | Absolute via `@/` alias (maps to `src/`). Prefer over relative paths. |
| Type imports      | `import type` for type-only imports                                   |
| Component files   | PascalCase `.astro`                                                   |
| Utility files     | camelCase `.ts`                                                       |
| Translation files | camelCase `.json` in `src/i18n/translations/`                         |

### Component conventions

All components are pure Astro — no React, Vue, or Svelte. Client-side interactivity uses vanilla JS `<script>` blocks.

Props are destructured with `class: className` aliasing:

```astro
---
const { class: className, ...rest } = Astro.props;
---

<div class:list={["base", className]} {...rest}></div>
```

### Translations

Translations live in `src/i18n/translations/` as JSON files with a `prefix` field for namespacing. Use the `i18n()` or `useTranslations()` helpers from `@/i18n/utils`.

## Database

The database is SQLite via Drizzle ORM with `@libsql/client`. Schema is defined in `src/db/schema.ts`.

### Making schema changes

1. Edit `src/db/schema.ts`
2. Generate a migration: `bun generate`
3. Apply it: `bun migrate`
4. If needed, re-seed: `bun seed` (idempotent) or `bun seed:reset` (full reset)

### Useful commands

| Command          | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `bun generate`   | Generate migration from schema changes      |
| `bun migrate`    | Apply pending migrations                    |
| `bun seed`       | Seed base data (skips if already populated) |
| `bun seed:reset` | Drop and re-seed the database               |

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). PR titles are validated by CI.

### Format

```
type(scope): lowercase description
```

### Types

`feat`, `fix`, `docs`, `build`, `style`, `refactor`, `perf`, `test`, `ci`, `chore`, `revert`

### Scopes

Common scopes: `components`, `i18n`, `db`, `auth`, `docker`, `config`, `tooling`

### Examples

```
feat(auth): add login with Authentik OIDC
fix(components): resolve countdown timer delay
docs: update setup instructions
refactor(i18n): move translations to json files
```

## Pull requests

### What CI checks

Every PR runs:

1. **Formatting** — `bun format:check`
2. **Linting** — `bun lint`
3. **Docker build** — builds `Dockerfile.release` and `Dockerfile.tools` via Podman
4. **Smoke test** — starts the compose stack and verifies the homepage responds
5. **Commit validation** — PR title must follow Conventional Commits format

### Tips

- Keep PRs focused — one feature or fix per PR.
- Make sure CI passes before requesting review.
- Update translations if you add user-facing strings.

## Deployment

The production site runs on the D-guild's own OKD servers. Docker images are built from `Dockerfile.release` (app) and `Dockerfile.tools` (migrations/seed). The compose stack is orchestrated via `docker-compose.yaml`.

To test locally:

```bash
podman-compose up -d
podman-compose down
```
