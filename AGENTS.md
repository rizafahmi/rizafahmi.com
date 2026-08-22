# AGENTS.md

This file is the entry point for AI agents working with this repository. It documents
everything an agent needs to understand, run, and modify the project.

## What Is This?

Personal website, blog, and portfolio of Riza Fahmi at [rizafahmi.com](https://rizafahmi.com).
Built with 11ty/Eleventy, styled with the "Neo-Acid Gallery" brutalist design system.
See `PRODUCT.md` for product context and `DESIGN.md` for the full design system.

## Quick Start

```sh
pnpm install
pnpm start        # dev server at http://localhost:3000
pnpm run build    # production build into dist/
pnpm test         # run unit tests
```

This project uses **pnpm** as its only package manager. The version is pinned via the
`packageManager` field in `package.json`, so `corepack enable` is enough to get the right
one. Do not use `npm` or `bun`: `pnpm-lock.yaml` is the single lockfile.

pnpm blocks dependency install scripts by default, and an unapproved one makes
`pnpm install --frozen-lockfile` exit non-zero, which fails the Netlify build. Approved
packages live in `pnpm-workspace.yaml` (`sharp` is there for its native binary); add new
ones with `pnpm approve-builds <pkg>`. pnpm 11 ignores the `pnpm` field in `package.json`.

## Build & Development Commands

| Command                | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `pnpm run clean`       | Remove the `dist/` directory                           |
| `pnpm start`           | Clean + start dev server with hot reload               |
| `pnpm run build`       | Production build + Pagefind + site audit (see Testing) |
| `pnpm run build:prod`  | Alias for `pnpm run build` (Netlify compat)            |
| `pnpm run debug`       | Dev server with `DEBUG=*` output                       |
| `pnpm test`            | Run unit tests via `node --test test/*.test.js`        |
| `pnpm run lint`        | Run Biome linter on source files                       |
| `pnpm run lint:fix`    | Auto-fix Biome lint issues                             |
| `pnpm run format`      | Check formatting with Biome                            |
| `pnpm run format:fix`  | Auto-format files with Biome                           |
| `pnpm run check`       | Run `biome check` + unit tests (full CI verification)  |
| `pnpm run new:catatan` | Scaffold a new article under `src/catatan/`            |

## Tech Stack

- **11ty/Eleventy 3.x** — Static site generator (ESM config: `eleventy.config.js`)
- **Nunjucks** (`.njk`) — Templating engine
- **Markdown** (`.md`) — Content authoring
- **Shiki** — Syntax highlighting with Monokai theme
- **Sharp** + `@11ty/eleventy-img` — Image optimization (WebP output)
- **Pagefind** — Client-side search index. It runs in **opt-in mode**: because some pages
  carry `data-pagefind-body`, Pagefind silently skips every page without it. A new page is
  unsearchable until its `<main>`/`<article>` gets that attribute (plus
  `data-pagefind-meta="title:…"` when the indexed region has no `<h1>`).
- **GoatCounter** — Privacy-friendly analytics (build-time, no client-side API calls)

## Project Structure

```
src/
  catatan/          # Blog articles in Markdown
  _data/            # Global data files (goatcounter views, etc.)
  _includes/        # Shared Nunjucks partials and layouts
  libs/             # Shared JS helpers (cv, karya, tips, shiki, related posts, OG, internal links)
  tags/             # Tag listing pages
  topik/            # Topic hub pages
  index.njk          # Homepage
  articles.njk       # Articles listing with pagination
  search.njk         # Search page
  showcase.njk       # Portfolio showcase
  tips.njk           # /tips Shorts library index
  tip.njk            # /tips/<slug>/ one page per Short
  tips-tag.njk       # /tips/topik/<tag>/ tag filter pages
  cv.njk             # CV; one template, two pages (/cv/ and /cv/en/)
  now.njk            # /now page
  uses.njk           # /uses page
assets/
  global.css         # Site-wide styles
  home.css           # Homepage-specific styles
  tulisan.css        # Article page styles
  cv.css             # CV screen styles + the @media print rules for /cv/
  fonts/             # Self-hosted fonts
  images/            # Static images
test/
  *.test.js          # Unit tests; see Testing
scripts/             # Utility scripts (new article scaffold, audit-site, etc.)
docs/                # Improvement notes and ideation
```

Six templates own a `<head>` of their own rather than sharing one: `_includes/main.njk`,
`_includes/tulisan.njk`, `_includes/serial.njk`, `_includes/cv.njk`, `index.njk`, and
`search.njk`. Anything that has to be on every page goes in a partial included by all six
(`_includes/head.njk` for metadata, `_includes/fonts.njk` for the webfont links) — editing
one layout silently skips the other five.

## Testing

Tests use Node.js built-in test runner (`node:test` and `node:assert/strict`).
Test files follow the `*.test.js` pattern under `test/`.

```sh
pnpm test                       # Run all tests
node --test test/related.test.js # Run a specific file
```

`pnpm run build` also runs `scripts/audit-site.mjs`, which fails the build on SEO,
feed, frontmatter, broken-internal-link, and homepage-reachability regressions. It
checks links in both the rendered `dist/` pages and the `src/_includes/` partials,
so a dead link is caught even in a partial no layout currently renders. The homepage
(`src/index.njk`) is standalone — it does not use `main.njk` — so browsable sections
need a link in both site navs; the audit asserts the built `dist/index.html` anchors
`/articles`, `/tags`, `/topik`, `/tips`, `/showcase`, and `/search`. Chromes and which
carry a site nav: `test/tips-nav.test.js`. Link resolution lives in
`src/libs/internal-links.js` and is shared by that script and `test/internal-links.test.js`.

## Code Conventions

- 2-space indentation
- Arrow functions for callbacks, template literals for strings
- kebab-case for files and directories
- Import order: built-ins → dependencies → local modules
- Dates and time-related UI text in **Indonesian** (e.g., "2 hari yang lalu")
- Markdown frontmatter required for all content files
- Alt text required for all images
- **Pre-commit hooks**: Biome (lint + format) runs automatically on staged files via Husky. Run `pnpm run check` before pushing to verify everything passes.

## Design System

See `DESIGN.md` for the full design spec. Key rules:

- **Creative North Star**: "The Neo-Acid Gallery" — brutalist, high-contrast, solarized
- **Colors**: Raw Gallery Plaster (`#f7f7f5`) / Obsidian Clay (`#121519`) backgrounds, Acid Lime (`#c5f82a`) and Electric Cobalt (`#1a3bf5`) accents
- **Bans**: No shadows, no gradients, no glassmorphism, no neon-on-black; sharp
  corners by default (narrow tip-facade play-chrome exception in `DESIGN.md`)
- **Line length**: Article views capped at `65ch`; article/detail containers under
  `720px` (`/tips` index and tag grids use `1080px` for density — `.tips-index`)
- **Borders**: Flat, thick, solid black/white (`2px` default, `4px` or `8px` for major splits)

## Content Guidelines

- Tags use lowercase kebab-case, max 3-7 per article (see `TAGS.md` for canonical tag list)
- Frontmatter required: `title`, `date`, `tags`, `layout: tulisan`
- Series articles use `series` and `series_index` frontmatter
- Custom `image` or `cover` frontmatter disables auto-generated OG images for that article

## Curated Data

- Open source projects are curated in `src/_data/karya.js` (see its Indonesian header
  for how to edit). That list drives the `/showcase` Open Source cards and the
  generated project entries in `/llms.txt` and `/llms-full.txt` (via
  `src/_includes/karya_llms.njk`). The "Lainnya" section on `/showcase` is still
  hand-written HTML in `src/showcase.njk`.
- Tips (`/tips`) are the channel's YouTube Shorts, one page each. The data file
  `src/_data/tips.json` is produced by `node --env-file=.env
  scripts/fetch-youtube-shorts.mjs`, run **by hand and committed** — never by
  `pnpm run build`, so a slow or rate-limited YouTube cannot break a deploy.
  Re-running is idempotent and preserves hand-edited fields (`tags`,
  `transcript`, `slug`, anything else you add); only title, description,
  publishedAt, duration, and thumbnail are refreshed. Editing rules are in the
  Indonesian header of `src/_data/tipsLibrary.js`; the logic and the tag keyword
  map are in `src/libs/tips.js`. Duration alone cannot identify a Short (the
  limit is 3 minutes now), so the script confirms each candidate with a HEAD on
  `youtube.com/shorts/<id>`; answers are cached in `.cache/youtube-shorts/`.
  Tip pages set `image` to the YouTube thumbnail for OG (not the build-time OG
  generator). The `/tips` grid uses derived `cardThumbnail` from `src/libs/tips.js`
  — leave `thumbnail` as the full-size OG frame; do not point the grid at it.
  Tip tags deliberately do **not** feed `/tags` or `/topik`.
  `tipsLibrary` also drives Recent tips in `/llms.txt` and the Tips inventory in
  `/llms-full.txt` (`src/llms.njk`, `src/llms-full.njk`). `tips.json` is generated,
  so it is excluded from Biome in `biome.json` — the fetch script's
  `JSON.stringify(..., null, 2)` owns that file's formatting.
- CV content is curated in `src/_data/cv.js` (Indonesian header explains the editing
  rules). One template, `src/cv.njk`, paginates over `cv.languages` to emit `/cv/` and
  `/cv/en/` from that single file, so the two languages cannot drift; the shared markup
  is `src/_includes/cv_body.njk` and the formatting helpers are `src/libs/cv.js`. Open
  source entries are pulled live from `karya.js`, not copied.

## Page Language

The site is Indonesian-first: `main.njk`, `tulisan.njk`, and `serial.njk` all hardcode
`<html lang="id">`, which is correct for every page they serve. A page in another
language needs its own layout (see `src/_includes/cv.njk`) and should set these page-data
fields, which `head.njk` reads with Indonesian defaults:

| Field         | Effect                                            |
| ------------- | ------------------------------------------------- |
| `pageLocale`  | `og:locale` (default `id_ID`)                     |
| `pageLangTag` | `inLanguage` on the WebPage JSON-LD node          |
| `alternates`  | List of `{ hreflang, href }` for `rel="alternate"` |

Site chrome stays in Indonesian on those pages; mark the wrapper `lang="id"` so screen
readers do not read it as English.

## Search

- Pagefind indexes **only** elements marked `data-pagefind-body`. Once that attribute exists
  anywhere on the site, pages without it are not searchable at all. Grep for
  `data-pagefind-body` to see what is currently opted in.
- Pagefind's browser API is an ES module that **exports** `search`/`init`; it does not assign
  `window.pagefind`. `assets/search-client.js` owns loading it, `assets/search-autocomplete.js`
  is the DOM layer. `test/search-client.test.js` builds a real Pagefind index and runs a real
  query, so an upgrade that moves the API fails CI instead of silently breaking search.

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
| `YOUTUBE_API_KEY`             | No       | Only for the two `scripts/fetch-youtube-*.mjs` scripts, never the build |

The site builds fine without these — view counts are simply hidden.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
