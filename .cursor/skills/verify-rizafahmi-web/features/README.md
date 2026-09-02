# Feature Map: rizafahmi.com

This directory maps the primary user-facing features of rizafahmi.com - a personal website built with 11ty/Eleventy. Each file describes how to verify one feature end-to-end.

## Index

1. **[Homepage](./homepage.md)** - Landing page with latest/popular articles, projects, and contact links
2. **[Article Reading](./article-reading.md)** - Reading individual blog articles with full content, metadata, and navigation
3. **[Article Listing](./article-listing.md)** - Browsing all articles with pagination, tags, and view counts
4. **[Search](./search.md)** - Searching articles via Pagefind-powered autocomplete interface
5. **[Tips Library](./tips-library.md)** - Browsing YouTube Shorts tips with tag filtering

## Baseline Preconditions

Before driving any feature:

1. **Dependencies installed**: `node_modules/.bin/eleventy` exists
2. **Dev server running**: Port 3000 responds with 200
3. **Correct site**: Homepage contains `"Saya Riza"` text

Quick check:
```bash
[ -f node_modules/.bin/eleventy ] && \
curl -f -s http://localhost:3000/ | grep -q "Saya Riza" && \
echo "✓ Ready to drive" || echo "✗ Preconditions failed"
```

## Driving Conventions

### URL Format

- Dev server: `http://localhost:3000`
- Articles: `/catatan/<slug>/`
- Tips: `/tips/<slug>/`
- Static pages: `/<page>/` (e.g., `/articles/`, `/search/`, `/showcase/`)

### HTTP Harness

**Fetch and assert in one line**:
```bash
curl -s http://localhost:3000/ | grep -q "PATTERN" && echo "✓ Found" || echo "✗ Missing"
```

**Fetch, save, then assert multiple things**:
```bash
curl -s http://localhost:3000/ > /tmp/verify-rizafahmi-web/page.html
grep -q "PATTERN_1" /tmp/verify-rizafahmi-web/page.html && echo "✓ Check 1"
grep -q "PATTERN_2" /tmp/verify-rizafahmi-web/page.html && echo "✓ Check 2"
```

**Check HTTP status**:
```bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
[ "$STATUS" = "200" ] && echo "✓ 200 OK" || echo "✗ Got $STATUS"
```

### Selectors to use

- `id="catatan"` - Articles section on homepage
- `id="karya"` - Projects section on homepage
- `id="kontak"` - Contact section on homepage
- `<article` - Article container (on article pages)
- `data-pagefind-body` - Content marked as searchable
- `class="catatan-item"` - Article list item
- `class="tip-card"` - Tip card in tips grid
- `id="search-input"` - Search input field
- `data-search-panel` - Search autocomplete panel

### Evidence Location

All evidence goes to `/tmp/verify-rizafahmi-web/<feature>/`:

```bash
mkdir -p /tmp/verify-rizafahmi-web/homepage
curl -s http://localhost:3000/ > /tmp/verify-rizafahmi-web/homepage/index.html
```

## Proof/Skip Reporting

**Proof**: Each feature file includes exact commands to run. Copy-paste them. They should output `✓` for pass, `✗` for fail.

**Skip**: If a feature requires a production build (e.g., full search with Pagefind index) and you're only verifying dev server, document:
```
SKIPPED: Search query execution (requires production build with Pagefind index)
VERIFIED: Search page structure, input field, autocomplete panel HTML
```

## Feature Entry Contract

Each feature file has exactly four H2 sections in this order:

1. **Sub-features** - What parts make up this feature
2. **How to get to it (user POV)** - URL, navigation path, or entry point
3. **Driving it with curl + grep** - Step-by-step commands with exact selectors
4. **Gotchas** - Known limitations, dev vs prod differences, edge cases

## Related Documentation

- `SKILL.md` - Main skill entry point (launch, doctor, cleanup)
- `AGENTS.md` - Full project architecture and conventions
- `test/*.test.js` - Unit tests for specific components
- `scripts/audit-site.mjs` - Production build validator
