# delta-web

This is the source code for the official web page for **> DELTΔ\_**, the annual career fair hosted by the [D-guild at TLTH](https://www.dsek.se/).

## > DELTΔ --force\_ IT managers

- [Hannes Bolmehag](https://github.com/sennahhh)
- [Christoffer Gärtner](https://github.com/christofergartner)
- [Rufus Kogg Röjder](https://github.com/RufusKoggRojder)

## First time setup

- Install dependencies

  ```bash
  bun install
  ```

- Create / Update database

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

### Contributing

_Before you commit_ for the first time you need to set up hooks using the following command. This enures that all code you commit is correctly formatted and linted.

```bash
bunx lefthook install
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                           |
| :-------------------- | :----------------------------------------------- |
| `bun install`         | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |
| `bun format:check`    | Check if all files are formatted correctly       |
| `bun format:fix`      | Fix all incorrectly formatted files              |
| `bun generate`        | Generates migration when schema has changed      |
| `bun migrate`         | Initializes the database and aplies migrations   |
| `bun seed`            | Seeds the database if its empty                  |
| `bun seed:reset`      | Clears the database and seeds it from scratch    |

The two important ones are `install` and `dev`. Run `install` whenever some dependency has changed, it is good practice to run this often, especially after doing anything related to git. `dev` starts the dev server allowing you to see any changes you make in real time. It will also make sure intellisense works correctly, so it is good practice to have this running constantly in a dedicated terminal.

When doing stuff with the database you will need to use `generate`, `migrate` and `seed`. Migrate is used to generate the database from scratch and apply all migrations in order for the database to match the schema. When you have edited the schema you can generate a new migration using `generate` followed by a `migrate` to apply the changes. `seed` will populate the database with base data unless it is already populated. If you want to reset the database you can do it with `seed:reset`

### Docs

[Bun](https://bun.com/docs) - package manager
[Astro](https://docs.astro.build) - framework
[Tailwind](https://tailwindcss.com/docs/installation/using-vite) - Styiling
[Lucide](https://lucide.dev/icons/) - Icon library
[Drizzle](https://orm.drizzle.team/docs/overview) - Object Relational Model

## Deployment

The project is deployed on the D-guilds own servers. This is done using the dockerfiles in the root of the project. If you want to try running the container locally to verify that it works, this can easliy be done using either `docker-compose` or `podman-compose`. The exacts commands to run will vary on different operating systems. I recommend using podman since it is more similar (allthough not exactly the same) to the system used on our servers ([OKD](https://docs.okd.io/)).
