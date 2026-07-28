<div align="center">
  <img src="public/delta.svg" alt="DELTA logo" width="512">
  <p>
    Annual career fair hosted by D-sektionen at TLTH
    <br />
    <a href="https://delta.dsek.se/"><strong>delta.dsek.se</strong></a>
  </p>
</div>

## > DELTΔ --force\_ IT managers

- [Hannes Bolmehag](https://github.com/sennahhh)
- [Christoffer Gärtner](https://github.com/christofergartner)
- [Rufus Kogg Röjder](https://github.com/RufusKoggRojder)

## Prerequisites

- [Bun](https://bun.sh/) — package manager and runtime
- Node.js >= 22.12.0
- [Podman](https://podman.io/) (optional, for Docker testing)

## First time setup

- Install dependencies

  ```bash
  bun install
  ```

  This also copies `.env.example` to `.env` and sets up git hooks automatically.

- Configure environment variables

  Edit `.env` and fill in the required values. The Authentik OIDC variables (`BETTER_AUTH_AUTHENTIK_ID`, `BETTER_AUTH_AUTHENTIK_SECRET`) are needed for authentication to work. Contact the IT managers for credentials.

- Create / update database

  ```bash
  bun migrate
  ```

- Seed database

  ```bash
  bun seed
  ```

- Start dev server

  ```bash
  bun dev
  ```

  The dev server runs at `http://localhost:8080`.

## Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                           |
| :-------------------- | :----------------------------------------------- |
| `bun install`         | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:8080`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |
| `bun lint`            | Lint source files with ESLint                    |
| `bun format:check`    | Check if all files are formatted correctly       |
| `bun format:fix`      | Fix all incorrectly formatted files              |
| `bun generate`        | Generates migration when schema has changed      |
| `bun migrate`         | Initializes the database and applies migrations  |
| `bun seed`            | Seeds the database if it's empty                 |
| `bun seed:reset`      | Clears the database and seeds it from scratch    |

The two important ones are `install` and `dev`. Run `install` whenever some dependency has changed — it is good practice to run this often, especially after doing anything related to git. `dev` starts the dev server allowing you to see any changes you make in real time. It will also make sure intellisense works correctly, so it is good practice to have this running constantly in a dedicated terminal.

When doing stuff with the database you will need to use `generate`, `migrate` and `seed`. Migrate is used to generate the database from scratch and apply all migrations in order for the database to match the schema. When you have edited the schema you can generate a new migration using `generate` followed by a `migrate` to apply the changes. `seed` will populate the database with base data unless it is already populated. If you want to reset the database you can do it with `seed:reset`.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). PR titles are validated by CI. Format:

```
type(scope): lowercase description
```

Types: `feat`, `fix`, `docs`, `build`, `style`, `refactor`, `perf`, `test`, `ci`, `chore`, `revert`.

## Docs

- [Bun](https://bun.sh/docs) — package manager
- [Astro](https://docs.astro.build) — framework
- [Tailwind CSS v4](https://tailwindcss.com/docs/installation/using-vite) — styling
- [Lucide](https://lucide.dev/icons/) — icon library
- [Drizzle](https://orm.drizzle.team/docs/overview) — ORM

## Deployment

The project is deployed on the D-guild's own servers. This is done using the Dockerfiles in the root of the project. If you want to try running the container locally to verify that it works, this can easily be done using either `docker-compose` or `podman-compose`:

```bash
podman-compose up -d
podman-compose down
```

The production system uses [OKD](https://docs.okd.io/).
