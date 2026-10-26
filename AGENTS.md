# AGENTS.md

Instructions for AI coding agents working on this repository. Read this file and the relevant files in `docs/` before making changes.

## Project

Website for the **Coral d'Antics Escolans de Montserrat (CAE Montserrat)**, replacing the WordPress site at https://caemontserrat.cat. Goals: zero monthly cost, hosted on Vercel (free Hobby plan) and deployed from GitHub, and content that non-technical choir members can edit.

The whole project is built with AI agents, so keep the repository self-explanatory: decisions live in `docs/decisions/`, and the docs must match the code.

## Language rules

- **Code, identifiers, commit messages and this file**: English.
- **Website UI and content**: Catalan (`ca`). The site is Catalan-only for now, but don't hard-code it in a way that blocks adding i18n later. Keep UI strings centralised.
- **`docs/`**: Catalan.

## Tech stack

| Area            | Choice                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| Framework       | Next.js (App Router), React, TypeScript (`strict`)                              |
| Styling         | Tailwind CSS                                                                    |
| Content         | Keystatic (Markdown/YAML in `content/`, local mode in dev, GitHub mode in prod) |
| Images          | Stored in the repo, optimised, rendered with `next/image`                       |
| Audio           | Vercel Blob (store only URLs in content)                                        |
| Video           | YouTube embeds (store only video IDs in content)                                |
| Contact form    | Web3Forms or Formspree (no custom backend)                                      |
| Hosting         | Vercel, auto-deploy from `main`                                                 |
| Package manager | npm                                                                             |
| Tests           | Vitest (unit), Playwright (e2e smoke)                                           |
| CI              | GitHub Actions on every push to `main`                                          |
| Analytics       | Vercel Web Analytics (cookieless, `@vercel/analytics`)                          |

Do not add new services, databases or paid dependencies without a new ADR in `docs/decisions/`.

## Workflow

- All work is committed directly to `main` (no PRs). CI must stay green, and every push to `main` deploys to production. Never push code that doesn't build.
- Work in small, focused commits, one task per commit where possible.
- Before you finish a task, run the following and fix any failures:
  ```
  npm run lint
  npm run format:check   # npm run format to fix
  npm run typecheck
  npm run test
  npm run build
  npm run test:e2e       # needs `npx playwright install chromium` once
  ```
  CI (`.github/workflows/ci.yml`) runs the same steps on every push to `main`.
- When you make a significant decision (new library, service or structural change), add an ADR to `docs/decisions/` using the existing format and numbering.
- If behaviour, structure or commands change, update `AGENTS.md` and the related `docs/` file in the same commit.

## Conventions

- Node.js 24 (see `.nvmrc`). Files use LF line endings (`.gitattributes`) and Prettier formatting.
- UI strings live in `src/lib/i18n` (`t()`); don't put user-facing text directly in components.
- Unit tests sit next to the code as `*.test.ts(x)`; e2e tests live in `e2e/`.
- Keep the existing public URL slugs from the WordPress site (see `docs/inventari.md`). Any changed URL needs a 301 redirect in `next.config`.
- Prefer Server Components. Use `"use client"` only when interactivity requires it.
- Read content only through the Keystatic reader or helpers in `src/lib/content`. Never hard-code page content in components.
- Accessibility: semantic HTML, alt text on every image, keyboard navigable, WCAG AA contrast.
- Performance: aim for Lighthouse ≥ 90 on every category. Don't use heavy client-side libraries for simple UI.
- No tracking cookies. Analytics is Vercel Web Analytics only (cookieless, see ADR 0008).
- Images added to the repo must be optimised first (max ~2000 px on the long edge, WebP/AVIF or quality-compressed JPEG).

## Security

- Never commit secrets. Use environment variables, documented in `.env.example` with placeholder values.
- Public form keys (e.g. Web3Forms access key) still go through env vars.

## Repository layout (target)

```
AGENTS.md            AI agent instructions (this file)
docs/                Project documentation (Catalan)
  decisions/         Architecture Decision Records (ADRs)
content/             Keystatic-managed content (Markdown/YAML)
public/              Static assets (images, favicons)
scripts/             One-off scripts (e.g. WordPress migration)
src/app/             Next.js routes
src/components/      UI components
src/lib/             Helpers (content access, utils)
keystatic.config.ts  Content model
```

## Roadmap

The task backlog is `docs/tasques.md` (no GitHub issues). When you start a task, mark it `[~]`; when you finish it, mark it `[x]` in the same commit as the change. Add new tasks there when you discover them.

See also `docs/arquitectura.md` and the phases in `docs/visio.md`. Current phase: **Phase 2 – content model (Keystatic)**.
