---
name: audit-docs
description: Audits project documentation (README, AGENTS, CONTRIBUTING, etc.) against actual codebase state — tooling, conventions, configs, dependencies. Use when updating, reviewing, or verifying project docs are accurate and complete.
---

# Documentation Audit Skill

Audits project documentation against the actual codebase to find outdated, incorrect, or missing information. Cross-references every documented claim with source code, config files, and git history.

## When to use

- Documentation feels stale or incomplete
- After major feature additions or tooling changes
- Before a release to ensure docs reflect current state
- When onboarding reveals documentation gaps

## Audit workflow

### 1. Discover documentation files

Find all docs at the project root and key locations:

- `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`
- `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- Any `docs/` directory
- AI agent configs (`.opencode/`, `.claude/`, `.agents/`)

### 2. Discover actual project state

Read and understand the real project configuration:

- `package.json` — scripts, dependencies, engines, metadata
- `tsconfig.json` — compiler options, path aliases, strict mode
- Linter/formatter configs (`.prettierrc*`, `eslint.config.*`, `biome.json`)
- CI/CD configs (`.github/workflows/`, `.gitlab-ci.yml`)
- Git hooks (`lefthook.yml`, `.husky/`, `.pre-commit-config.yaml`)
- Docker configs (`Dockerfile*`, `docker-compose*`)
- `.env.example` — environment variables
- Framework configs (`astro.config.*`, `next.config.*`, `vite.config.*`, etc.)

### 3. Cross-reference and find discrepancies

For each documentation file, verify every claim:

| Check              | How                                                            |
| ------------------ | -------------------------------------------------------------- |
| Commands/scripts   | Compare documented commands against `package.json` scripts     |
| Port numbers       | Check server config (e.g. `astro.config.mjs`, `vite.config.*`) |
| Dev server URL     | Verify against actual config, not framework defaults           |
| Setup steps        | Walk through setup yourself — does it work?                    |
| Tool versions      | Check `engines` field, lockfile, `.tool-versions`              |
| Env vars           | Compare `.env.example` against actual `env()` usage in code    |
| File paths         | Verify referenced files and directories exist                  |
| Code conventions   | Read source files — do they match documented style?            |
| Naming conventions | Check actual file names, variable names, component names       |
| Import patterns    | Read source files — do they use the documented alias/style?    |
| Commit conventions | Check `git log` and CI validation config                       |
| Dependencies       | Cross-reference mentioned tools with `package.json`            |
| Deployment         | Check Dockerfiles and compose match documented commands        |

### 4. Check external links

For every tool, library, or service mentioned in docs:

- Verify it has a hyperlink on first mention
- Confirm the URL is correct (fetch if unsure)
- Ensure no tools are mentioned without a link

### 5. Check for undocumented changes

Run `git log --oneline -20` and check if recent changes introduced:

- New dependencies not mentioned in docs
- New scripts or commands
- Changed ports, URLs, or configuration
- New environment variables
- New file paths or conventions

### 6. Generate report and implement fixes

Present findings as a categorized list:

- **Critical**: Wrong information that will break workflows (wrong ports, missing steps)
- **High**: Missing important info (undocumented env vars, no setup instructions)
- **Medium**: Outdated or incomplete info
- **Low**: Typos, style inconsistencies

Then fix each issue. When editing markdown:

- Run the project formatter after changes (e.g. `bun format:fix`, `npm run format`)
- Verify formatting passes (`bun format:check`)
- Commit each logical group of fixes separately with conventional commit messages

### 7. Verify

After all changes:

- Run the formatter and linter
- Ensure no docs reference non-existent files or commands
- Spot-check that setup instructions work from scratch

## Tips

- Read actual source files, don't guess from file names
- Check `git log` for recent changes that may have stale docs
- Use `grep` to find every mention of a tool/variable across the codebase
- Compare README commands table against actual `package.json` scripts
- Check that CLAUDE.md / AGENTS.md stay in sync if one is a symlink
