---
name: verify-rizafahmi-web
description: Verify rizafahmi.com (11ty/Eleventy static site) via its web UI - use when validating site builds, article rendering, search functionality, or any user-facing page behavior
---

# Verify rizafahmi.com

This skill verifies the rizafahmi.com personal website - an 11ty/Eleventy static site serving blog articles, portfolio content, tips (YouTube Shorts), and search functionality.

**Primary surface**: Web UI (static HTML pages served via Eleventy dev server)
**Secondary surfaces**: RSS feeds (`/feed.xml`, `/feed/full.xml`), sitemap (`/sitemap.xml`), LLM discovery endpoints (`/llms.txt`, `/llms-full.txt`)

## When to use this skill

- After changing article layouts, templates, or site structure
- After modifying build scripts, Eleventy config, or data files
- After updating search functionality (Pagefind integration)
- After changing CSS, images, or asset processing
- Before creating a PR for any site changes
- When validating that articles render correctly with frontmatter
- When checking that navigation, links, and cross-references work

## Launch

### Start the dev server

```bash
pnpm start
```

This runs `ELEVENTY_ENV=dev eleventy --serve` which:
- Cleans the `dist/` directory
- Starts Eleventy with hot reload
- Serves on `http://localhost:3000`
- Watches `src/` for changes

**Ready signal**: Look for this in the output:
```
[11ty] Server at http://localhost:3000/
```

The dev server uses fast image processing (no optimization) and skips the Pagefind indexing step. For full production verification, use `pnpm run build` and serve `dist/` separately (see Production Build section).

### Isolation

The dev server binds to a fixed port (3000). To run multiple instances:

1. **Check if 3000 is already in use**:
   ```bash
   lsof -ti:3000
   ```
   
2. **If occupied by another dev server you control**, reuse it
   
3. **If occupied by something else or you need isolation**, modify the port in a new tmux session:
   ```bash
   SESSION_NAME="verify-rizafahmi-alt"; \
   tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null || \
   tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "$PWD" -- "${SHELL:-zsh}" -l
   
   tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" \
     'ELEVENTY_ENV=dev eleventy --serve --port=3001' C-m
   ```

### Teardown

**For a dev server you started**:

1. Find the process by port:
   ```bash
   lsof -ti:3000
   ```
   
2. Kill it gracefully:
   ```bash
   kill $(lsof -ti:3000)
   ```

**Never** kill by process name (`pkill eleventy`) - you might kill another agent's or user's server.

**For a tmux session**:
```bash
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "verify-rizafahmi-alt:0.0" C-c
tmux -f /exec-daemon/tmux.portal.conf kill-session -t "verify-rizafahmi-alt"
```

## Doctor

Run before driving to confirm the environment is ready:

```bash
# 1. Check dev server is responding
curl -f -s http://localhost:3000/ > /dev/null && echo "✓ Dev server responding" || echo "✗ Dev server not responding"

# 2. Verify it's serving the expected site
curl -s http://localhost:3000/ | grep -q "Saya Riza" && echo "✓ Correct site content" || echo "✗ Unexpected content"

# 3. Check port 3000 is owned by expected process
lsof -i:3000 | grep -q node && echo "✓ Port 3000 owned by Node" || echo "✗ Port 3000 not owned by Node"

# 4. Verify dependencies are installed
[ -f node_modules/.bin/eleventy ] && echo "✓ Dependencies installed" || echo "✗ Missing dependencies (run pnpm install)"
```

Expected output:
```
✓ Dev server responding
✓ Correct site content
✓ Port 3000 owned by Node
✓ Dependencies installed
```

If any check fails, troubleshoot before driving:
- Server not responding: Start it with `pnpm start`
- Wrong content: Check you're in the right directory
- Port not owned by Node: Kill the other process or use a different port
- Missing dependencies: Run `pnpm install --frozen-lockfile`

## Drive

This site has **no interactive JavaScript forms or dynamic behavior** - it's a static content site. Verification focuses on:
- HTTP responses (status codes, redirects)
- Rendered HTML (selectors, text content, structure)
- Asset availability (CSS, images, fonts)
- Cross-page navigation
- Feed/machine-readable endpoint validity

### Harness: curl + grep/ripgrep

Most verification uses `curl` to fetch pages and `grep`/`rg` to assert content:

**Example: Verify homepage**
```bash
# Fetch homepage and check key sections exist
curl -s http://localhost:3000/ | grep -q '<h1>👋 Saya Riza!</h1>' && echo "✓ Homepage H1" || echo "✗ Homepage H1 missing"
curl -s http://localhost:3000/ | grep -q 'id="catatan"' && echo "✓ Articles section" || echo "✗ Articles section missing"
curl -s http://localhost:3000/ | grep -q 'id="karya"' && echo "✓ Projects section" || echo "✗ Projects section missing"
```

**Example: Verify an article page**
```bash
# Check article exists and renders with expected structure
ARTICLE_URL="http://localhost:3000/catatan/asisten-ngoding/"
curl -f -s "$ARTICLE_URL" > /dev/null && echo "✓ Article responds 200" || echo "✗ Article not found"
curl -s "$ARTICLE_URL" | grep -q '<article' && echo "✓ Article tag present" || echo "✗ Article tag missing"
curl -s "$ARTICLE_URL" | grep -q 'data-pagefind-body' && echo "✓ Searchable (pagefind attr)" || echo "✗ Not searchable"
```

**Example: Verify search page**
```bash
curl -s http://localhost:3000/search/ | grep -q 'data-search-input' && echo "✓ Search input present" || echo "✗ Search input missing"
curl -s http://localhost:3000/search/ | grep -q 'search-autocomplete.js' && echo "✓ Search script loaded" || echo "✗ Search script missing"
```

**Example: Verify feed**
```bash
curl -s http://localhost:3000/feed.xml | head -20 | grep -q '<feed xmlns="http://www.w3.org/2005/Atom">' && echo "✓ Valid Atom feed" || echo "✗ Invalid feed"
```

### Harness: Browser automation (for visual/JS-required verification)

When you need to verify JavaScript behavior (search autocomplete, theme toggle, lazy loading), or take screenshots for visual regression:

**Using Puppeteer** (if available):
```javascript
// verify-screenshot.mjs
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

await page.goto('http://localhost:3000/');
await page.screenshot({ path: '/tmp/verify-homepage.png', fullPage: true });

await browser.close();
console.log('✓ Screenshot saved to /tmp/verify-homepage.png');
```

Run: `node verify-screenshot.mjs`

**Note**: Puppeteer is NOT currently a dependency of this project. To use it for verification:
```bash
pnpm add -D puppeteer
# Then run your verification script
node .cursor/skills/verify-rizafahmi-web/helpers/screenshot.mjs
```

## Evidence

### What to capture

For each feature verified, capture:

1. **HTTP response status** - proves the page exists and is reachable
2. **Key HTML structure** - proves the right template rendered
3. **Actual content** - proves data/frontmatter was processed correctly
4. **Cross-references** - proves internal links work
5. **Assets** - proves CSS, images, fonts load

### Where it goes

Evidence goes to `/tmp/verify-rizafahmi-web/`:

```bash
mkdir -p /tmp/verify-rizafahmi-web

# HTTP status log
curl -o /tmp/verify-rizafahmi-web/homepage.html http://localhost:3000/
curl -o /tmp/verify-rizafahmi-web/article-asisten-ngoding.html http://localhost:3000/catatan/asisten-ngoding/

# Screenshot (if using browser automation)
# -> /tmp/verify-rizafahmi-web/screenshots/homepage.png

# Search response (if testing Pagefind - requires production build)
# -> /tmp/verify-rizafahmi-web/search-results.json
```

### Proof standards

**Real user path**: Verify via the actual URLs users visit (`/`, `/catatan/slug/`, `/search/`, `/tips/slug/`), not internal Eleventy paths or test-only routes.

**Capture action AND resulting state**:
- ✓ Fetch `/catatan/asisten-ngoding/` AND check the H1 text matches the article title
- ✗ Only check that the markdown file exists in `src/catatan/`

**Verify side effects alongside what's visible**:
- After verifying an article renders, check it also appears in `/articles/` listing
- After verifying search page exists, check articles have `data-pagefind-body` attribute

**Mocks only at production boundary**: This is a static site with no external API calls at runtime (GoatCounter analytics is async and non-blocking). The dev server is already a "mock" environment (no Pagefind index built). For full verification, build production (`pnpm run build`) and serve `dist/`.

## Cleanup

**Order**: Run cleanup AFTER capturing evidence.

**What to clean**:
1. Dev server processes you started
2. Temporary tmux sessions you created
3. Alternative-port server instances

**What NOT to clean**:
- The `dist/` directory (someone else might be using it)
- The `.cache/` directory (speeds up future builds)
- Evidence files in `/tmp/verify-rizafahmi-web/` (needed for proof)
- Any dev server that was already running when you started

**How to clean**:

```bash
# 1. Kill dev server (only if you started it on port 3000)
if lsof -ti:3000 > /dev/null 2>&1; then
  PID=$(lsof -ti:3000)
  kill $PID
  sleep 1
  # Force kill if still alive
  if ps -p $PID > /dev/null 2>&1; then
    kill -9 $PID
  fi
  echo "✓ Stopped dev server on port 3000"
fi

# 2. Kill alternative port server (if you started one on 3001)
if lsof -ti:3001 > /dev/null 2>&1; then
  kill $(lsof -ti:3001)
  echo "✓ Stopped dev server on port 3001"
fi

# 3. Kill tmux session (if you created one)
if tmux -f /exec-daemon/tmux.portal.conf has-session -t "verify-rizafahmi-alt" 2>/dev/null; then
  tmux -f /exec-daemon/tmux.portal.conf kill-session -t "verify-rizafahmi-alt"
  echo "✓ Killed tmux session verify-rizafahmi-alt"
fi

echo "Cleanup complete. Evidence preserved at /tmp/verify-rizafahmi-web/"
```

**Confirm evidence survived cleanup**:
```bash
ls -lh /tmp/verify-rizafahmi-web/
```

## Production Build

The dev server skips:
- Image optimization (WebP/AVIF generation)
- Pagefind search indexing
- Site audit checks
- OG image generation for articles

To verify the full production build:

```bash
# Build production assets
pnpm run build

# Serve the dist/ folder
pnpm dlx serve dist -l 3002

# Verify
curl -s http://localhost:3002/ | grep -q "Saya Riza" && echo "✓ Production build serves correctly"

# Check Pagefind index was built
[ -d dist/pagefind ] && echo "✓ Pagefind index exists" || echo "✗ Pagefind index missing"

# Cleanup
kill $(lsof -ti:3002)
```

The production build also runs `scripts/audit-site.mjs` which checks:
- Broken internal links
- Missing SEO tags
- Invalid feed XML
- Homepage navigation completeness
- Frontmatter consistency

If the build exits non-zero, the audit found a regression.

## Helpers

### Helper: screenshot.mjs

Create `.cursor/skills/verify-rizafahmi-web/helpers/screenshot.mjs`:

```javascript
#!/usr/bin/env node
// Usage: node .cursor/skills/verify-rizafahmi-web/helpers/screenshot.mjs <url> <output-path>
// Example: node .cursor/skills/verify-rizafahmi-web/helpers/screenshot.mjs http://localhost:3000/ /tmp/verify-rizafahmi-web/homepage.png

import puppeteer from 'puppeteer';

const [url, outputPath] = process.argv.slice(2);

if (!url || !outputPath) {
  console.error('Usage: screenshot.mjs <url> <output-path>');
  process.exit(1);
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

try {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`✓ Screenshot saved: ${outputPath}`);
} catch (error) {
  console.error(`✗ Screenshot failed: ${error.message}`);
  process.exit(1);
} finally {
  await browser.close();
}
```

Make it executable:
```bash
chmod +x .cursor/skills/verify-rizafahmi-web/helpers/screenshot.mjs
```

Invocation:
```bash
node .cursor/skills/verify-rizafahmi-web/helpers/screenshot.mjs \
  http://localhost:3000/ \
  /tmp/verify-rizafahmi-web/homepage.png
```

### Helper: check-links.sh

Create `.cursor/skills/verify-rizafahmi-web/helpers/check-links.sh`:

```bash
#!/bin/bash
# Usage: check-links.sh <base-url>
# Example: check-links.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
EVIDENCE_DIR="/tmp/verify-rizafahmi-web"

mkdir -p "$EVIDENCE_DIR"

echo "Checking internal links from $BASE_URL"

# Key pages to check
PAGES=(
  "/"
  "/articles/"
  "/search/"
  "/showcase/"
  "/tips/"
  "/cv/"
  "/now/"
  "/uses/"
  "/feed.xml"
)

for PAGE in "${PAGES[@]}"; do
  URL="$BASE_URL$PAGE"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  
  if [ "$STATUS" = "200" ]; then
    echo "✓ $PAGE ($STATUS)"
  else
    echo "✗ $PAGE ($STATUS)"
  fi
done

echo "Link check complete. See $EVIDENCE_DIR for captured pages."
```

Make it executable:
```bash
chmod +x .cursor/skills/verify-rizafahmi-web/helpers/check-links.sh
```

Invocation:
```bash
.cursor/skills/verify-rizafahmi-web/helpers/check-links.sh http://localhost:3000
```

## Related files

- `eleventy.config.js` - Eleventy configuration (plugins, transforms, collections)
- `src/_includes/main.njk` - Main layout template
- `src/_includes/tulisan.njk` - Article layout template
- `src/index.njk` - Homepage template
- `src/search.njk` - Search page template
- `assets/search-client.js` - Pagefind loader and search logic
- `assets/search-autocomplete.js` - Search UI autocomplete behavior
- `test/*.test.js` - Unit tests (run with `pnpm test`)
- `scripts/audit-site.mjs` - Production build validator
- `AGENTS.md` - Full project documentation for agents
- `DESIGN.md` - Design system rules

## Common verification patterns

### Pattern: Verify an article renders correctly

```bash
SLUG="asisten-ngoding"
URL="http://localhost:3000/catatan/$SLUG/"

# 1. Check it responds 200
curl -f -s "$URL" > /dev/null && echo "✓ Article found" || { echo "✗ Article 404"; exit 1; }

# 2. Capture the HTML
curl -s "$URL" > "/tmp/verify-rizafahmi-web/article-$SLUG.html"

# 3. Check key structure
grep -q '<article' "/tmp/verify-rizafahmi-web/article-$SLUG.html" && echo "✓ <article> tag present"
grep -q 'data-pagefind-body' "/tmp/verify-rizafahmi-web/article-$SLUG.html" && echo "✓ Searchable"
grep -q 'class="reading-progress"' "/tmp/verify-rizafahmi-web/article-$SLUG.html" && echo "✓ Reading progress bar"

# 4. Check it appears in article listing
curl -s http://localhost:3000/articles/ | grep -q "/catatan/$SLUG/" && echo "✓ Listed in /articles/"
```

### Pattern: Verify search page loads (dev server - no Pagefind index)

```bash
URL="http://localhost:3000/search/"

curl -s "$URL" > /tmp/verify-rizafahmi-web/search-page.html

grep -q 'id="search-input"' /tmp/verify-rizafahmi-web/search-page.html && echo "✓ Search input exists"
grep -q 'data-search-panel' /tmp/verify-rizafahmi-web/search-page.html && echo "✓ Search panel exists"
grep -q 'search-autocomplete.js' /tmp/verify-rizafahmi-web/search-page.html && echo "✓ Autocomplete script loaded"

echo "Note: Pagefind index is not built in dev mode. For full search verification, build production."
```

### Pattern: Verify feeds are valid

```bash
# RSS/Atom excerpt feed
curl -s http://localhost:3000/feed.xml > /tmp/verify-rizafahmi-web/feed.xml
head -20 /tmp/verify-rizafahmi-web/feed.xml | grep -q '<feed xmlns="http://www.w3.org/2005/Atom">' && echo "✓ Valid Atom feed"

# Full-content feed
curl -s http://localhost:3000/feed/full.xml > /tmp/verify-rizafahmi-web/feed-full.xml
head -20 /tmp/verify-rizafahmi-web/feed-full.xml | grep -q '<feed xmlns="http://www.w3.org/2005/Atom">' && echo "✓ Valid full-content feed"
```

### Pattern: Verify tip (YouTube Short) page

```bash
# Pick a tip slug from src/_data/tips.json
SLUG="elixir-101"
URL="http://localhost:3000/tips/$SLUG/"

curl -f -s "$URL" > /dev/null && echo "✓ Tip page found" || { echo "✗ Tip page 404"; exit 1; }

curl -s "$URL" > "/tmp/verify-rizafahmi-web/tip-$SLUG.html"

grep -q 'class="tip-content"' "/tmp/verify-rizafahmi-web/tip-$SLUG.html" && echo "✓ Tip content structure"
grep -q 'youtube.com/embed/' "/tmp/verify-rizafahmi-web/tip-$SLUG.html" && echo "✓ YouTube embed present"
```

### Pattern: Check homepage sections

```bash
curl -s http://localhost:3000/ > /tmp/verify-rizafahmi-web/homepage.html

grep -q 'id="catatan"' /tmp/verify-rizafahmi-web/homepage.html && echo "✓ Articles section"
grep -q 'id="karya"' /tmp/verify-rizafahmi-web/homepage.html && echo "✓ Projects section"
grep -q 'id="kontak"' /tmp/verify-rizafahmi-web/homepage.html && echo "✓ Contact section"

# Check latest articles are listed (at least 3)
ARTICLE_COUNT=$(grep -o '<li class="catatan-item">' /tmp/verify-rizafahmi-web/homepage.html | wc -l)
[ "$ARTICLE_COUNT" -ge 3 ] && echo "✓ At least 3 articles listed" || echo "✗ Not enough articles"
```

## Troubleshooting

**Problem**: Dev server won't start, says "Port 3000 already in use"

Solution:
```bash
# Check what's using it
lsof -i:3000
# If it's another dev server you control, reuse it
# If it's something else, kill it or use a different port
kill $(lsof -ti:3000)
```

**Problem**: Pages return 404 in dev server but markdown files exist

Solution: Check the frontmatter. Articles need `layout: tulisan` and a valid `date` field to be rendered. Check `src/catatan/<slug>.md` frontmatter.

**Problem**: Search doesn't work in dev server

Expected: Dev server doesn't build the Pagefind index (performance optimization). Search autocomplete loads but returns no results. To verify search:
```bash
pnpm run build
pnpm dlx serve dist -l 3002
# Now test search at http://localhost:3002/search/
```

**Problem**: Images don't load or show broken

Solution: In dev mode, images are not optimized. Check:
1. File exists in `assets/images/` or `src/catatan/` folder
2. Path in markdown/template is correct (`/assets/images/foo.png` not `assets/images/foo.png`)
3. Dev server console for 404s

**Problem**: CSS/styles look wrong

Solution: Check:
1. `assets/global.css` loads (view source, check `<link>` tag)
2. Browser console for CSS errors
3. Theme toggle state (site has dark/light mode)

**Problem**: Cleanup killed a dev server another agent was using

Prevention: This skill only kills processes on ports it started (3000 if explicitly started, 3001+ if alternative port used). Always check ownership:
```bash
# Before killing
lsof -i:3000
# Only kill if you recognize your own process
```

## Feature map

See `features/README.md` and individual feature files for detailed driving instructions.
