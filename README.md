# Delta-web
This is the source code for the official web page for "Delta", the annual career fair hosted by the [D-guild at TLTH](dsek.se). 

#### > DELTΔ --force_ IT managers
- [Hannes Bolmehag](https://github.com/sennahhh)
- [Christoffer Gärtner](https://github.com/christofergartner)
- [Rufus Kogg Röjder](https://github.com/RufusKoggRojder)


## Astro

### Project Structure

Inside the project you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
├── package.json
└── Dockerfile
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

### Commands

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



The two important ones are `install` and `dev`. Run `install` whenever some dependency has changed, it is good practice to run this often, especially after doing anything related to git. `dev` starts the dev server allowing you to see any changes you make in real time. It will also make sure intellisense works correctly, so it is good practice to have this running constantly in a dedicated terminal.

### Want to learn more?

Feel free to check [the Astro documentation](https://docs.astro.build) or jump into their [Discord server](https://astro.build/chat).


## Deployment

The project is deployed on the D-guilds own servers. This is done using the Dockerfile in the root of the project. If you want to try running the container locally to verify that it works, this can easliy be done using either `docker-compose` or `podman-compose`. The exacts commands to run will vary on different operating systems. I recommend using podman since it is more similar (allthough not exactly the same) to the system used on our servers ([OKD](https://docs.okd.io/)).