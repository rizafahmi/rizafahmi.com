# AGENTS.md

This file is the entry point for AI agents working with this repository. It documents
everything an agent needs to understand, run, and modify the project.

## What Is This?

Personal website, blog, and portfolio of Riza Fahmi at [rizafahmi.com](https://rizafahmi.com).
Built with 11ty/Eleventy, styled with the "Neo-Acid Gallery" brutalist design system.
See `PRODUCT.md` for product context and `DESIGN.md` for the full design system.

## Quick Start

```sh
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build into dist/
npm test         # run unit tests
```

## Build & Development Commands

| Command                | Purpose                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run clean`        | Remove the `dist/` directory                                           |
| `npm start`            | Clean + start dev server with hot reload                               |
| `npm run build`        | Production build + Pagefind search index                               |
| `npm run build:prod`   | Alias for `npm run build` (Netlify compat)                             |
| `npm run debug`        | Dev server with `DEBUG=*` output                                       |
| `npm test`             | Run unit tests via `node --test test/*.test.js`                        |
| `npm run lint`         | Run ESLint on all source files                                         |
| `npm run lint:fix`     | Auto-fix ESLint issues                                                 |
| `npm run format`       | Check formatting with Prettier                                         |
| `npm run format:fix`   | Auto-format all files with Prettier                                    |
| `npm run check`        | Run lint + format + test (full CI verification)                        |
| `npm run new:catatan`  | Scaffold a new article under `src/catatan/`                            |

## Tech Stack

- **11ty/Eleventy 3.x** — Static site generator (ESM config: `eleventy.config.js`)
- **Nunjucks** (`.njk`) — Templating engine
- **Markdown** (`.md`) — Content authoring
- **Shiki** — Syntax highlighting with Monokai theme
- **Sharp** + `@11ty/eleventy-img` — Image optimization (WebP output)
- **Pagefind** — Client-side search index
- **GoatCounter** — Privacy-friendly analytics (build-time, no client-side API calls)

## Project Structure

```
src/
  catatan/          # Blog articles in Markdown
  _data/            # Global data files (goatcounter views, etc.)
  _includes/        # Shared Nunjucks partials and layouts
  libs/             # Custom libraries (shiki config, related posts, OG images)
  tags/             # Tag listing pages
  topik/            # Topic hub pages
  index.njk          # Homepage
  articles.njk       # Articles listing with pagination
  search.njk         # Search page
  showcase.njk       # Portfolio showcase
  now.njk            # /now page
  uses.njk           # /uses page
assets/
  global.css         # Site-wide styles
  home.css           # Homepage-specific styles
  tulisan.css        # Article page styles
  fonts/             # Self-hosted fonts
  images/            # Static images
test/
  related.test.js    # Unit tests for related-posts algorithm
scripts/             # Utility scripts (new article scaffold, etc.)
docs/                # Improvement notes and ideation
```

## Testing

Tests use Node.js built-in test runner (`node:test` and `node:assert/strict`).
Test files follow the `*.test.js` pattern under `test/`.

```sh
npm test                        # Run all tests
node --test test/related.test.js # Run a specific file
```

## Code Conventions

- 2-space indentation
- Arrow functions for callbacks, template literals for strings
- kebab-case for files and directories
- Import order: built-ins → dependencies → local modules
- Dates and time-related UI text in **Indonesian** (e.g., "2 hari yang lalu")
- Markdown frontmatter required for all content files
- Alt text required for all images
- **Pre-commit hooks**: Biome (lint + format) runs automatically on staged files via Husky. Run `npm run check` before pushing to verify everything passes.

## Design System

See `DESIGN.md` for the full design spec. Key rules:

- **Creative North Star**: "The Neo-Acid Gallery" — brutalist, high-contrast, solarized
- **Colors**: Raw Gallery Plaster (`#f7f7f5`) / Obsidian Clay (`#121519`) backgrounds, Acid Lime (`#c5f82a`) and Electric Cobalt (`#1a3bf5`) accents
- **Bans**: No shadows, no gradients, no rounded corners, no glassmorphism, no neon-on-black
- **Line length**: Article views capped at `65ch`, container widths under `720px`
- **Borders**: Flat, thick, solid black/white (`2px` default, `4px` or `8px` for major splits)

## Content Guidelines

- Tags use lowercase kebab-case, max 3-7 per article (see `TAGS.md` for canonical tag list)
- Frontmatter required: `title`, `date`, `tags`, `layout: tulisan`
- Series articles use `series` and `series_index` frontmatter
- Custom `image` or `cover` frontmatter disables auto-generated OG images for that article

## Curated Data

- The "Open Source" cards on `/showcase` (Karya) are rendered from `src/_data/karya.js`,
  a hand-curated list with an Indonesian header comment explaining how to edit it.
  The "Lainnya" section on that page is still hand-written HTML in `src/showcase.njk`.

## Deployment

- Hosted on **Netlify** with auto-deploy on merge to `main`
- `netlify.toml` configures security headers and cache rules
- OG images are auto-generated at build time for articles without custom images
- GoatCounter view counts are fetched at build time and cached in `.cache/goatcounter/`

## Environment Variables

| Variable                      | Required | Purpose                               |
| ----------------------------- | -------- | ------------------------------------- |
| `GOATCOUNTER_SITE`            | No       | GoatCounter site code for view counts |
| `GOATCOUNTER_API_TOKEN`       | No       | API token for GoatCounter stats API   |
| `GOATCOUNTER_API_BASE`        | No       | Override API base URL                 |
| `GOATCOUNTER_CACHE_TTL_HOURS` | No       | Cache TTL for views (default: 12)     |

The site builds fine without these — view counts are simply hidden.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
